/* ============================================================
   FraudeDigital.es — alertas-incibe.js
   ----------------------------------------------------
   Módulo compartido: limpia y tipifica las entradas crudas de
   data/fraudes-incibe.json (alimentado por script externo del
   repo privado de Miguel) para poder maquetarlas en:
     - Home: banda roja "Últimas amenazas detectadas" (resumen)
     - /alertas-incibe/: listado completo con fecha

   El feed de origen mezcla 3 tipos de contenido con estructura
   de texto distinta (avisos técnicos con CVE, boletines de
   vulnerabilidades personalizados, y artículos/bitácora). Este
   módulo detecta el tipo y extrae solo lo presentable, sin
   reproducir el aviso completo (se enlaza al original en INCIBE).
   ============================================================ */

(function (global) {

  const WEEKDAY_TAIL = /\s*(Lun|Mar|Mié|Jue|Vie|Sáb|Dom),\s*\d{1,2}\/\d{1,2}\/\d{4}\s*-\s*\d{1,2}:\d{2}\s*$/;

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function cleanWs(s) {
    return (s || '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function truncar(texto, max) {
    if (texto.length <= max) return texto;
    const cortado = texto.slice(0, max);
    const ultimoEspacio = cortado.lastIndexOf(' ');
    return (ultimoEspacio > 0 ? cortado.slice(0, ultimoEspacio) : cortado) + '…';
  }

  /**
   * Convierte una alerta cruda de fraudes-incibe.json en un objeto
   * limpio y listo para maquetar: { tipo, titulo, importancia, resumen, fecha, url }
   */
  function parseAlerta(raw) {
    const titulo = raw.titulo || '';
    const descOriginal = cleanWs(raw.descripcion || '');
    const desc = descOriginal.replace(WEEKDAY_TAIL, '');
    const fecha = raw.fecha || '';
    const url = raw.url || '#';

    // --- Tipo 1: aviso técnico estructurado (CVE) ---
    if (titulo === 'Un nuevo aviso de seguridad' ||
        titulo === 'Un nuevo aviso de SCI' ||
        titulo === 'Actualización en un aviso de seguridad') {

      const tipo = titulo.includes('SCI') ? 'aviso-sci'
                 : titulo.includes('Actualización') ? 'actualizacion'
                 : 'aviso';

      const reTitulo = new RegExp(escapeRegExp(titulo) + '\\s*(.+?)\\s*Fecha\\d{2}/\\d{2}/\\d{4}');
      const mTitulo = desc.match(reTitulo);
      const tituloReal = mTitulo ? mTitulo[1].trim() : titulo;

      const mImp = desc.match(/Importancia(\d)\s*-\s*(\w+)/);
      const importancia = mImp ? `${mImp[1]} - ${mImp[2]}` : null;

      const mDesc = desc.match(/Descripción\s+(.+?)\s+Solución/);
      let resumen = mDesc ? mDesc[1].trim() : desc.slice(0, 200);
      resumen = truncar(resumen, 200);

      return { tipo, titulo: tituloReal, importancia, resumen, fecha, url };
    }

    // --- Tipo 2: boletín de vulnerabilidades (personalizado en origen) ---
    if (titulo === 'Boletín de vulnerabilidades') {
      const nCves = (desc.match(/CVE-\d{4}-\d+/g) || []).length;
      const nAltas = (desc.match(/Severidad:\s*ALTA/g) || []).length;
      const resumen = nCves > 0
        ? `${nCves} vulnerabilidad${nCves === 1 ? '' : 'es'} actualizada${nCves === 1 ? '' : 's'} en productos monitorizados por INCIBE-CERT` +
          (nAltas > 0 ? ` (${nAltas} de severidad alta).` : '.')
        : 'Sin vulnerabilidades nuevas relevantes en este boletín.';
      return { tipo: 'boletin', titulo: 'Boletín de vulnerabilidades', importancia: null, resumen, fecha, url };
    }

    // --- Tipo 3: artículo / bitácora ---
    const reCabecera = new RegExp(
      escapeRegExp(titulo) + '\\s*\\d{2}/\\d{2}/\\d{4}\\s*(?:Lun|Mar|Mié|Jue|Vie|Sáb|Dom),\\s*\\d{2}/\\d{2}/\\d{4}\\s*-\\s*\\d{2}:\\d{2}\\s*(.+)'
    );
    const mCuerpo = desc.match(reCabecera);
    const cuerpo = mCuerpo ? mCuerpo[1].trim() : desc;
    const resumen = truncar(cuerpo, 220);

    return { tipo: 'articulo', titulo, importancia: null, resumen, fecha, url };
  }

  function parseAlertas(rawArray) {
    return (rawArray || []).map(parseAlerta);
  }

  // Metadatos de presentación por tipo (badge + color)
  const TIPO_META = {
    'aviso':         { label: 'Aviso de seguridad', color: '#dc2626' },
    'aviso-sci':     { label: 'Aviso SCI',           color: '#b45309' },
    'actualizacion': { label: 'Actualización',       color: '#0369a1' },
    'boletin':       { label: 'Boletín CVE',         color: '#7c3aed' },
    'articulo':      { label: 'Bitácora INCIBE',     color: '#16a34a' },
  };

  function formatFecha(fechaISO) {
    if (!fechaISO) return '';
    const [y, m, d] = fechaISO.split('-');
    if (!y || !m || !d) return fechaISO;
    return `${d}/${m}/${y}`;
  }

  global.FDIncibe = { parseAlerta, parseAlertas, TIPO_META, formatFecha };

})(window);
