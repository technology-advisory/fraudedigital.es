
(() => {
  'use strict';

  const ICONOS = {
    correo:{c:'#2563eb',s:'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'},
    telefono:{c:'#16a34a',s:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.94.36 1.86.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.95.34 1.87.58 2.81.7A2 2 0 0 1 22 16.92z"/>'},
    sms:{c:'#ea580c',s:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
    qr:{c:'#4f46e5',s:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'},
    ia:{c:'#9333ea',s:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>'},
    usuarios:{c:'#0d9488',s:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>'},
    wifi:{c:'#0891b2',s:'<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.94 0"/><circle cx="12" cy="20" r="1"/>'},
    sim:{c:'#c2410c',s:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 2v5h8V2"/><path d="M8 12h8M8 16h8"/>'},
    factura:{c:'#7c3aed',s:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'},
    chantaje:{c:'#be123c',s:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'},
    ransomware:{c:'#dc2626',s:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/>'},
    compra:{c:'#059669',s:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'}
  };

  const esc = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  const flowSvg = steps => {
    const safe = (steps || []).slice(0,3);
    const x = [72, 220, 368];
    const nodes = safe.map((step,i) => `
      <rect x="${x[i]-55}" y="15" width="110" height="30" rx="7" fill="#1e293b" stroke="#475569"/>
      <text x="${x[i]}" y="34" text-anchor="middle" fill="#f8fafc" font-family="Arial, sans-serif" font-size="10">${esc(step)}</text>
    `).join('');
    const arrows = safe.slice(0,-1).map((_,i) => `
      <line x1="${x[i]+58}" y1="30" x2="${x[i+1]-64}" y2="30" stroke="#dc2626" stroke-width="2"/>
      <path d="M${x[i+1]-64} 30 l-7 -4 v8 z" fill="#dc2626"/>
    `).join('');
    return `<svg viewBox="0 0 440 58" role="img" aria-label="Flujo del ataque">${arrows}${nodes}</svg>`;
  };

  const iconSvg = item => {
    const icon = ICONOS[item.icono] || ICONOS.correo;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="${icon.c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon.s}</svg>`;
  };

  let amenazas = [];
  let categoria = 'todas';
  let query = '';
  const PAGE_SIZE = 7;
  let currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get('page') || '1', 10) || 1);

  const grid = document.getElementById('grid-amenazas');
  const count = document.getElementById('amz-count');
  const search = document.getElementById('amz-search');
  const filters = document.getElementById('amz-filters');

  const render = () => {
    const filtered = amenazas.filter(a => {
      const matchCategory = categoria === 'todas' || a.categoria_id === categoria;
      const haystack = norm([a.titulo,a.descripcion,a.categoria,a.vector,...(a.tags||[]),...(a.senales||[]),...(a.objetivo||[])].join(' '));
      const matchQuery = !query || haystack.includes(norm(query));
      return matchCategory && matchQuery;
    });

    count.textContent = `${filtered.length} / ${amenazas.length}`;

    if (!filtered.length) {
      grid.innerHTML = '<div class="amz-empty"><strong>No encuentro una amenaza con esos criterios.</strong><br>Prueba con términos como “SMS”, “banco”, “QR”, “factura”, “voz” o “contraseña”.</div>';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    grid.innerHTML = pageItems.map(a => `
      <article class="amz-card">
        <div class="amz-card-header">
          <span class="amz-exp">${esc(a.exp)}</span>
          <span class="amz-badge">${esc(a.badge)}</span>
        </div>

        <div class="amz-card-main">
          <div class="amz-icon">${iconSvg(a)}</div>
          <div>
            <h2 class="amz-title">${esc(a.titulo)}</h2>
            <p class="amz-resumen">${esc(a.descripcion)}</p>
          </div>
        </div>

        <div class="amz-meta">
          <div class="amz-meta-item">
            <div class="amz-meta-label">Riesgo</div>
            <div class="amz-meta-value amz-risk" data-risk="${esc(a.riesgo)}">${esc(a.riesgo)}</div>
          </div>
          <div class="amz-meta-item">
            <div class="amz-meta-label">Canal</div>
            <div class="amz-meta-value">${esc((a.canal || []).join(' · '))}</div>
          </div>
          <div class="amz-meta-item">
            <div class="amz-meta-label">Objetivo</div>
            <div class="amz-meta-value">${esc((a.objetivo || []).slice(0,2).join(' · '))}</div>
          </div>
        </div>

        <div class="amz-flow">
          <div class="amz-flow-title">Flujo típico del ataque</div>
          ${flowSvg(a.flujo)}
        </div>

        <div class="amz-quick">
          <div class="amz-quick-label">Respuesta inmediata</div>
          <p>${esc(a.respuesta_rapida)}</p>
        </div>

        <div class="amz-signals">
          ${(a.senales || []).map(s => `<span class="amz-tag">#${esc(s)}</span>`).join('')}
        </div>

        <div class="amz-footer">
          <div class="amz-defense">
            <strong>Defensa principal</strong>
            <a href="${esc(a.defensa_principal?.enlace || '../defensas/index.html')}">${esc(a.defensa_principal?.titulo || 'Panel de Defensas')} →</a>
          </div>
          <a class="amz-cta" href="${esc(a.enlace)}">Ver expediente →</a>
        </div>
      </article>
    `).join('');

    renderPagination(totalPages);
  };

  const renderPagination = totalPages => {
    let pager = document.getElementById('amz-pagination');
    if (!pager) {
      pager = document.createElement('nav');
      pager.id = 'amz-pagination';
      pager.className = 'catalog-pagination';
      pager.setAttribute('aria-label', 'Paginación de amenazas');
      grid.insertAdjacentElement('afterend', pager);
    }
    if (totalPages <= 1) {
      pager.innerHTML = '';
      return;
    }
    pager.innerHTML = Array.from({length: totalPages}, (_, i) => i + 1).map(page => `
      <button type="button" class="catalog-page ${page === currentPage ? 'is-active' : ''}" data-page="${page}" aria-label="Página ${page}">${page}</button>
    `).join('');
    pager.querySelectorAll('.catalog-page').forEach(button => {
      button.addEventListener('click', () => {
        currentPage = Number(button.dataset.page);
        const url = new URL(location.href);
        if (currentPage === 1) url.searchParams.delete('page'); else url.searchParams.set('page', currentPage);
        history.replaceState({}, '', url);
        render();
        document.querySelector('.amz-controls')?.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  };

  fetch('../data/amenazas.json?v=' + Date.now(), {cache:'no-store'})
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      amenazas = data.amenazas || [];
      document.getElementById('stat-total').textContent = amenazas.length;
      document.getElementById('stat-criticas').textContent = amenazas.filter(a => a.riesgo === 'Crítico').length;
      document.getElementById('stat-categorias').textContent = new Set(amenazas.map(a => a.categoria_id)).size;

      const categories = [...new Map(amenazas.map(a => [a.categoria_id,a.categoria])).entries()];
      filters.innerHTML = `<button class="amz-filter is-active" data-category="todas">Todas</button>` +
        categories.map(([id,label]) => `<button class="amz-filter" data-category="${esc(id)}">${esc(label)}</button>`).join('');

      filters.addEventListener('click', e => {
        const button = e.target.closest('.amz-filter');
        if (!button) return;
        categoria = button.dataset.category || 'todas';
        currentPage = 1;
        filters.querySelectorAll('.amz-filter').forEach(b => b.classList.toggle('is-active', b === button));
        render();
      });

      render();
    })
    .catch(err => {
      console.error('Error cargando amenazas:', err);
      grid.innerHTML = '<div class="amz-empty">No se ha podido cargar el catálogo de amenazas.</div>';
    });

  search.addEventListener('input', e => {
    query = e.target.value.trim();
    currentPage = 1;
    render();
  });
})();
