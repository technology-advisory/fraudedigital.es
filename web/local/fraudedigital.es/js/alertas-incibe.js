/* ============================================================
   FraudeDigital.es — alertas-incibe.js
   ----------------------------------------------------
   Módulo compartido: limpia y estructura las entradas crudas de
   data/fraudes-incibe.json (alimentado por script externo del
   repo privado de Miguel, fuente: incibe.es/ciudadania/avisos)
   para poder maquetarlas en:
     - Home: banda roja "Últimas amenazas detectadas" (resumen
       breve, enlaza al artículo propio en /alertas-incibe/)
     - /alertas-incibe/: listado completo con todas las secciones
       (afectados, descripción, solución, detalle, etiquetas) y
       un botón final al aviso original en incibe.es.

   El texto crudo de INCIBE viene con las secciones pegadas sin
   delimitador claro ("...Recursos Afectados {texto} Descripción
   {texto} Solución {texto} Detalle {texto} 4 - Alta Etiquetas
   {tags} CVE ..."), así que este módulo localiza las anclas de
   cada sección por su nombre y extrae el texto entre ellas.
   ============================================================ */

(function (global) {

  function cleanWs(s) {
    return (s || '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function slugFromUrl(url) {
    return (url || '').replace(/\/$/, '').split('/').pop();
  }

  // Anclas de sección, en el orden en que deberían aparecer en el texto.
  const SECTION_PATTERNS = [
    ['recursos',      /Recursos Afectados/],
    ['descripcion',   /Descripción/],
    ['identificador', /Identificador\s+INCIBE-\S*/],
    ['solucion',      /Solución/],
    ['detalle',       /Detalle/],
    ['etiquetas',     /Etiquetas/],
  ];

  /**
   * Reconstruye una lista de pasos a partir del texto de "Solución".
   * En el HTML original eran <li>, pero al extraer el texto quedaron
   * pegados sin espacio tras el punto (".En vez de". En"), así que
   * usamos ese patrón como separador de items.
   */
  function splitSolucion(texto) {
    const partes = texto.split(/(?<=[a-záéíóúñ0-9)])\.(?=[A-ZÁÉÍÓÚÑ])/);
    const out = [];
    for (let p of partes) {
      p = cleanWs(p);
      if (!p) continue;
      if (!p.endsWith('.')) p += '.';
      out.push(p);
    }
    return out;
  }

  // Tags conocidas de más de una palabra (para no partirlas mal al separar).
  const MULTI_WORD_TAGS = [
    'Correo electrónico', 'Robo de datos', 'Sector energía',
    'Administración pública', 'Filtración de datos', 'Datos personales',
    'Ingeniería social', 'Acceso no autorizado', 'Fuga de información',
    'Redes sociales', 'Configuración Segura', 'Comercio electrónico',
    'Google Play', 'Fake news', 'Buenas prácticas', 'Fallo de seguridad',
  ].sort((a, b) => b.length - a.length);

  function splitEtiquetas(raw) {
    let texto = cleanWs(raw);
    const encontradas = [];
    MULTI_WORD_TAGS.forEach(tag => {
      if (texto.includes(tag)) {
        encontradas.push(tag);
        texto = texto.replace(tag, ' ');
      }
    });
    const sueltas = texto.split(/\s+/).filter(t => t && t !== '+' && t !== '-');
    return [...encontradas, ...sueltas];
  }

  /**
   * Convierte una alerta cruda de fraudes-incibe.json en un objeto
   * limpio y listo para maquetar.
   */
  function parseAlerta(raw) {
    const titulo = raw.titulo || '';
    const fecha = raw.fecha || '';
    const url = raw.url || '#';
    const desc = cleanWs(raw.descripcion || '');

    // Localizar posiciones de cada ancla presente
    const anchors = [];
    SECTION_PATTERNS.forEach(([name, re]) => {
      const m = desc.match(re);
      if (m) anchors.push({ name, start: m.index, end: m.index + m[0].length });
    });
    anchors.sort((a, b) => a.start - b.start);

    function sectionText(name) {
      const i = anchors.findIndex(a => a.name === name);
      if (i === -1) return '';
      const start = anchors[i].end;
      const end = i + 1 < anchors.length ? anchors[i + 1].start : desc.length;
      return desc.slice(start, end).trim();
    }

    const afectados = sectionText('recursos');
    const descripcion = sectionText('descripcion');
    const solucionRaw = sectionText('solucion');
    let detalleRaw = sectionText('detalle');
    const etiquetasRawFull = sectionText('etiquetas');

    // La importancia ("4 - Alta") suele colarse al final de "detalle"
    // (a veces con texto extra tipo "Listado de referencias..." de por
    // medio). Buscamos la ÚLTIMA coincidencia y cortamos el detalle ahí.
    const impRe = /(\d)\s*-\s*(Alta|Media|Baja|Crítica)\b/g;
    let mImp, lastImp = null;
    while ((mImp = impRe.exec(detalleRaw)) !== null) lastImp = mImp;
    const importancia = lastImp ? `${lastImp[1]} - ${lastImp[2]}` : null;
    const detalle = lastImp ? detalleRaw.slice(0, lastImp.index).trim() : detalleRaw;

    // Etiquetas: cortar en la primera aparición de "CVE" (boilerplate final)
    const cveIdx = etiquetasRawFull.search(/\bCVE\b/);
    const etiquetasRaw = cveIdx >= 0 ? etiquetasRawFull.slice(0, cveIdx).trim() : etiquetasRawFull;

    return {
      id: slugFromUrl(url),
      titulo, fecha, url, importancia,
      afectados,
      descripcion,
      solucion: splitSolucion(solucionRaw),
      detalle,
      etiquetas: splitEtiquetas(etiquetasRaw),
    };
  }

  function parseAlertas(rawArray) {
    return (rawArray || []).map(parseAlerta);
  }

  function formatFecha(fechaISO) {
    if (!fechaISO) return '';
    const [y, m, d] = fechaISO.split('-');
    if (!y || !m || !d) return fechaISO;
    return `${d}/${m}/${y}`;
  }

  function truncar(texto, max) {
    if (!texto || texto.length <= max) return texto;
    const cortado = texto.slice(0, max);
    const ultimoEspacio = cortado.lastIndexOf(' ');
    return (ultimoEspacio > 0 ? cortado.slice(0, ultimoEspacio) : cortado) + '…';
  }

  global.FDIncibe = { parseAlerta, parseAlertas, formatFecha, truncar };

})(window);
