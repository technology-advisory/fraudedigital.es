# scripts/ · FraudeDigital.es

Scripts de mantenimiento del sitio.

## `update-alertas.py`

Descarga las últimas alertas de seguridad publicadas por OSI e INCIBE y actualiza `data/fraudes.json` para que se muestren en la banda roja del home.

**Sin dependencias externas** — solo Python 3.8+ y `urllib` (stdlib).

### Uso manual

```bash
python scripts/update-alertas.py                    # 6 alertas (3 OSI + 3 INCIBE)
python scripts/update-alertas.py --max 4            # 4 alertas totales
python scripts/update-alertas.py --source osi       # solo OSI
python scripts/update-alertas.py --source incibe    # solo INCIBE
python scripts/update-alertas.py --dry-run          # muestra pero no escribe
```

### Automatización

**Windows — Programador de tareas:**
1. Abrir "Programador de tareas"
2. Crear tarea básica → Diario → hora deseada
3. Acción: `python.exe` con argumentos `C:\ruta\a\fraudedigital\scripts\update-alertas.py`
4. "Iniciar en": la ruta raíz del proyecto

**Linux/macOS — cron:**
```
0 9 * * *  cd /ruta/a/fraudedigital && /usr/bin/python3 scripts/update-alertas.py >> logs/rss.log 2>&1
```

**GitHub Actions** (si el sitio vive en GitHub Pages):
Crear `.github/workflows/update-alertas.yml`:
```yaml
name: Actualizar alertas RSS
on:
  schedule:
    - cron: '0 9 * * *'   # cada día a las 09:00 UTC
  workflow_dispatch:       # también ejecutable a mano
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ejecutar script
        run: python scripts/update-alertas.py
      - name: Commit cambios
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/fraudes.json
          git diff --staged --quiet || git commit -m "chore(alertas): actualización automática RSS"
          git push
```

### Fallback

Si los RSS caen o el script falla, `fraudes.json` mantiene las alertas anteriores. Nada se rompe.
