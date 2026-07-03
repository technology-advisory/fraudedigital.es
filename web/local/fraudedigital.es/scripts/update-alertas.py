#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
====================================================================
 update-alertas.py — FraudeDigital.es
--------------------------------------------------------------------
 Actualiza data/fraudes.json con las últimas alertas publicadas por
 INCIBE / OSI (Ciudadanía > Avisos).

 NOTA HISTÓRICA (2026-07-03): OSI (osi.es) se ha integrado dentro de
 INCIBE bajo incibe.es/ciudadania. La antigua URL de osi.es/es/actualidad
 /avisos/feed ahora redirige en bucle. El feed real vive en INCIBE y
 usa formato ATOM (no RSS 2.0), de ahí que el parser soporte ambos.

 Uso:
   python scripts/update-alertas.py
   python scripts/update-alertas.py --max 6      # nº máximo de alertas
   python scripts/update-alertas.py --dry-run     # solo mostrar, no escribir

 Automatización recomendada:
   - GitHub Actions (cron diario) — ver docs/rss-workflow.yml
   - Windows Task Scheduler cada 24h
   - Linux/macOS cron: 0 9 * * *  cd /ruta && python scripts/update-alertas.py

 Sin dependencias externas: usa solo la stdlib.
====================================================================
"""
import argparse
import json
import re
import sys
import ssl
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime

# ------------------------------------------------------------------
# Configuración
# ------------------------------------------------------------------
SOURCES = {
    'incibe': {
        'name': 'INCIBE/OSI',
        'url':  'https://www.incibe.es/ciudadania/avisos/feed',
        'label_prefix': 'INCIBE/OSI'
    },
}

ROOT = Path(__file__).resolve().parent.parent
FRAUDES_JSON = ROOT / 'data' / 'fraudes.json'

USER_AGENT = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
    'AppleWebKit/537.36 (KHTML, like Gecko) '
    'Chrome/124.0.0.0 Safari/537.36 '
    'FraudeDigitalRSSUpdater/1.1 (+https://fraudedigital.es)'
)


# ------------------------------------------------------------------
# Utilidades
# ------------------------------------------------------------------
def strip_html(text: str) -> str:
    """Quita etiquetas HTML de forma básica."""
    if not text:
        return ''
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    for a, b in [('&amp;', '&'), ('&lt;', '<'), ('&gt;', '>'),
                 ('&quot;', '"'), ('&#39;', "'"), ('&nbsp;', ' ')]:
        text = text.replace(a, b)
    return text


def shorten(text: str, max_len: int = 180) -> str:
    text = strip_html(text)
    if len(text) <= max_len:
        return text
    cut = text[:max_len].rsplit(' ', 1)[0]
    return cut + '…'


# Patrón de "ruido" de plantilla que INCIBE/Drupal antepone al resumen real:
# "<fecha en español> Aviso Recursos Afectados <texto real>"
# Ej: "Mar, 26/05/2026 - 12:51 Aviso Recursos Afectados Aquellos usuarios..."
_BOILERPLATE_RE = re.compile(
    r'^\s*(Lun|Mar|Mié|Jue|Vie|Sáb|Dom),\s*\d{1,2}/\d{1,2}/\d{4}\s*-\s*\d{1,2}:\d{2}\s*'
    r'(Aviso\s*)?(Recursos Afectados\s*:?\s*)?',
    re.IGNORECASE
)


def clean_incibe_description(raw_desc: str, title: str) -> str:
    """Quita el título duplicado + fecha + etiquetas 'Aviso'/'Recursos Afectados'
    que INCIBE antepone al texto real del resumen, dejando solo el contenido útil."""
    text = strip_html(raw_desc)
    if title and text.lower().startswith(title.lower()):
        text = text[len(title):].strip()
    text = _BOILERPLATE_RE.sub('', text).strip()
    return text


def fetch_url(url: str, timeout: int = 20) -> str:
    """Descarga una URL con User-Agent de navegador real y sigue redirecciones."""
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={
        'User-Agent': USER_AGENT,
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    })
    opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler())
    with opener.open(req, timeout=timeout) as resp:
        raw = resp.read()
    return raw.decode('utf-8', errors='replace')


def strip_namespaces(elem):
    """Elimina namespaces XML ({http://...}tag -> tag) para poder
    parsear RSS 2.0 y Atom con el mismo código sin declarar namespaces."""
    for e in elem.iter():
        if '}' in e.tag:
            e.tag = e.tag.split('}', 1)[1]
    return elem


def parse_feed(xml_text: str, label: str, limit: int = 6):
    """Parsea RSS 2.0 (<item>) o Atom (<entry>) indistintamente."""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as e:
        print(f"  ✗ Error parsing XML: {e}", file=sys.stderr)
        return []

    root = strip_namespaces(root)

    entries = list(root.iterfind('.//item'))       # RSS 2.0
    is_atom = False
    if not entries:
        entries = list(root.iterfind('.//entry'))  # Atom 1.0
        is_atom = True

    items = []
    for entry in entries[:limit]:
        title = (entry.findtext('title', default='') or '').strip()
        title_clean = strip_html(title)
        if not title_clean:
            continue

        if is_atom:
            # Atom: <summary> o <content>, <link href="..."/>
            desc = (entry.findtext('summary', default='')
                    or entry.findtext('content', default='') or '').strip()
        else:
            desc = (entry.findtext('description', default='') or '').strip()

        # Limpiar boilerplate de plantilla ANTES de truncar, si no el texto
        # útil se queda cortado por el ruido (fecha, "Aviso", "Recursos Afectados").
        desc_clean = clean_incibe_description(desc, title_clean)
        desc_clean = shorten(desc_clean, 220)

        items.append({
            'tipo': f'{label} · {title_clean}',
            'descripcion': desc_clean or title_clean
        })
    return items


def load_fraudes():
    if not FRAUDES_JSON.exists():
        return {'alertas': [], 'destacadas': []}
    with FRAUDES_JSON.open('r', encoding='utf-8') as f:
        return json.load(f)


def save_fraudes(data):
    FRAUDES_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description='Actualiza alertas desde el feed de INCIBE/OSI.')
    parser.add_argument('--max', type=int, default=6, help='Nº de alertas a mostrar (default 6)')
    parser.add_argument('--dry-run', action='store_true', help='No escribir el JSON, solo mostrar')
    args = parser.parse_args()

    print('=' * 60)
    print(f'  update-alertas.py · {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print('=' * 60)

    all_items = []
    for key, src in SOURCES.items():
        print(f'\n[{src["name"]}] Descargando {src["url"]}')
        try:
            xml_text = fetch_url(src['url'])
        except urllib.error.HTTPError as e:
            print(f'  ✗ HTTP {e.code}: {e.reason}', file=sys.stderr)
            continue
        except Exception as e:
            print(f'  ✗ Error de red: {e}', file=sys.stderr)
            continue

        items = parse_feed(xml_text, src['label_prefix'], limit=args.max)
        print(f'  ✓ {len(items)} alertas obtenidas')
        for it in items:
            print(f'    · {it["tipo"][:80]}')
        all_items.extend(items)

    all_items = all_items[:args.max]

    if not all_items:
        print('\n⚠ No se han obtenido alertas. Se mantienen las anteriores.')
        return 1

    fraudes = load_fraudes()
    fraudes['alertas'] = all_items
    fraudes['_last_update'] = datetime.now().isoformat(timespec='seconds')
    fraudes['_source'] = f'Feed: {", ".join(s["name"] for s in SOURCES.values())}'

    if args.dry_run:
        print('\n[DRY-RUN] JSON resultante:')
        print(json.dumps(fraudes, ensure_ascii=False, indent=2))
        return 0

    save_fraudes(fraudes)
    print(f'\n✓ Actualizado: {FRAUDES_JSON.relative_to(ROOT)}')
    print(f'  Total alertas: {len(all_items)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
