
(() => {
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const grid=document.getElementById('ej2-grid');
  const search=document.getElementById('ej2-search');
  let casos=[];

  const flow = labels => {
    const steps=(labels||[]).slice(0,3), x=[72,220,368];
    const nodes=steps.map((s,i)=>`<rect x="${x[i]-55}" y="15" width="110" height="30" rx="7" fill="#1e293b" stroke="#475569"/><text x="${x[i]}" y="34" text-anchor="middle" fill="#f8fafc" font-family="Arial" font-size="10">${esc(s)}</text>`).join('');
    const arr=steps.slice(0,-1).map((_,i)=>`<line x1="${x[i]+58}" y1="30" x2="${x[i+1]-64}" y2="30" stroke="#2563eb" stroke-width="2"/><path d="M${x[i+1]-64} 30 l-7 -4 v8 z" fill="#2563eb"/>`).join('');
    return `<svg viewBox="0 0 440 58">${arr}${nodes}</svg>`;
  };

  const deriveFlow = c => {
    const text=norm(`${c.titulo} ${c.subtitulo} ${c.categoria}`);
    if(text.includes('deepfake')) return ['Voz sintética','Confianza familiar','Transferencia'];
    if(text.includes('anydesk')||text.includes('remoto')) return ['Pretexto','Acceso remoto','Control del equipo'];
    if(text.includes('trading')||text.includes('inversion')) return ['Captación','Plataforma falsa','Más depósitos'];
    return ['Oferta laboral','Desplazamiento','Coacción / fraude'];
  };

  const render=q=>{
    const filtered=casos.filter(c=>!q||norm(`${c.titulo} ${c.subtitulo} ${c.categoria}`).includes(norm(q)));
    document.getElementById('ej2-count').textContent=filtered.length;
    grid.innerHTML=filtered.length?filtered.map((c,i)=>`
      <a class="ej2-card" href="${esc(c.enlace)}">
        <div class="ej2-head"><span class="ej2-id">CASO ${String(i+1).padStart(2,'0')}</span><span class="ej2-category">${esc(c.categoria)}</span></div>
        <div class="ej2-body">
          <h2 class="ej2-title">${esc(c.titulo)}</h2>
          <p class="ej2-desc">${esc(c.subtitulo)}</p>
          <div class="ej2-flow">${flow(deriveFlow(c))}</div>
          <div class="ej2-meta"><span class="ej2-pill">#Caso real</span><span class="ej2-pill">#Análisis técnico</span><span class="ej2-pill">#${esc(c.categoria)}</span></div>
        </div>
      </a>`).join(''):'<div class="ej2-empty">No hay casos coincidentes.</div>';
  };

  fetch('../data/ejemplos.json?v='+Date.now(),{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()})
    .then(data=>{
      casos=data.casos||[];
      document.getElementById('ej2-total').textContent=casos.length;
      document.getElementById('ej2-destacados').textContent=casos.filter(c=>c.destacado).length;
      document.getElementById('ej2-categorias').textContent=new Set(casos.map(c=>c.categoria)).size;
      render('');
    })
    .catch(()=>grid.innerHTML='<div class="ej2-empty">No se han podido cargar los casos.</div>');

  search.addEventListener('input',e=>render(e.target.value.trim()));
})();
