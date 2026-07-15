
(() => {
  'use strict';

  const ICONOS = {
    candado:{c:'#15803d',s:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'},
    escudo:{c:'#15803d',s:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'},
    backup:{c:'#15803d',s:'<path d="M4 7a8 8 0 1 1-1 8"/><polyline points="4 3 4 7 8 7"/><path d="M12 8v5l3 2"/>'},
    usuarios:{c:'#15803d',s:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>'}
  };

  const esc = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  const flowSvg = steps => {
    const safe = (steps || []).slice(0,3);
    const x = [72,220,368];
    const nodes = safe.map((step,i) => `
      <rect x="${x[i]-55}" y="15" width="110" height="30" rx="7" fill="#14532d" stroke="#4ade80"/>
      <text x="${x[i]}" y="34" text-anchor="middle" fill="#f0fdf4" font-family="Arial, sans-serif" font-size="10">${esc(step)}</text>
    `).join('');
    const arrows = safe.slice(0,-1).map((_,i) => `
      <line x1="${x[i]+58}" y1="30" x2="${x[i+1]-64}" y2="30" stroke="#4ade80" stroke-width="2"/>
      <path d="M${x[i+1]-64} 30 l-7 -4 v8 z" fill="#4ade80"/>
    `).join('');
    return `<svg viewBox="0 0 440 58" role="img" aria-label="Flujo de la defensa">${arrows}${nodes}</svg>`;
  };

  const iconSvg = item => {
    const icon = ICONOS[item.icono] || ICONOS.escudo;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="${icon.c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon.s}</svg>`;
  };

  let defensas = [], categoria = 'todas', query = '';
  const PAGE_SIZE = 7;
  let currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get('page') || '1', 10) || 1);
  const grid = document.getElementById('grid-defensas');
  const count = document.getElementById('def-count');
  const search = document.getElementById('def-search');
  const filters = document.getElementById('def-filters');

  const render = () => {
    const filtered = defensas.filter(d => {
      const matchCategory = categoria === 'todas' || d.categoria_id === categoria;
      const haystack = norm([d.titulo,d.descripcion,d.categoria,d.control,d.resultado,...(d.tags||[]),...(d.protege||[]),...(d.amenazas_relacionadas||[])].join(' '));
      return matchCategory && (!query || haystack.includes(norm(query)));
    });

    count.textContent = `${filtered.length} / ${defensas.length}`;

    if (!filtered.length) {
      grid.innerHTML = '<div class="def-empty"><strong>No encuentro una defensa con esos criterios.</strong><br>Prueba con “cuentas”, “ransomware”, “MFA”, “privacidad” o “backup”.</div>';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    grid.innerHTML = pageItems.map(d => `
      <article class="def-card">
        <div class="def-card-header">
          <span class="def-exp">${esc(d.exp)}</span>
          <span class="def-badge">${esc(d.badge)}</span>
        </div>
        <div class="def-card-main">
          <div class="def-icon">${iconSvg(d)}</div>
          <div>
            <h2 class="def-title">${esc(d.titulo)}</h2>
            <p class="def-resumen">${esc(d.descripcion)}</p>
          </div>
        </div>
        <div class="def-meta">
          <div class="def-meta-item"><div class="def-meta-label">Eficacia</div><div class="def-meta-value">${esc(d.eficacia)}</div></div>
          <div class="def-meta-item"><div class="def-meta-label">Madurez</div><div class="def-meta-value">${esc(d.madurez)}</div></div>
          <div class="def-meta-item"><div class="def-meta-label">Control</div><div class="def-meta-value">${esc(d.control)}</div></div>
        </div>
        <div class="def-flow">
          <div class="def-flow-title">Cómo rompe el ataque</div>
          ${flowSvg(d.flujo)}
        </div>
        <div class="def-result">
          <div class="def-result-label">Resultado esperado</div>
          <p>${esc(d.resultado)}</p>
        </div>
        <div class="def-tags">${(d.protege||[]).map(x => `<span class="def-tag">#${esc(x)}</span>`).join('')}</div>
        <div class="def-footer">
          <div class="def-related">
            <strong>Reduce exposición frente a</strong>
            ${esc((d.amenazas_relacionadas||[]).join(' · '))}
          </div>
          <a class="def-cta" href="${esc(d.enlace)}">Ver defensa completa →</a>
        </div>
      </article>
    `).join('');

    renderPagination(totalPages);
  };

  const renderPagination = totalPages => {
    let pager = document.getElementById('def-pagination');
    if (!pager) {
      pager = document.createElement('nav');
      pager.id = 'def-pagination';
      pager.className = 'catalog-pagination';
      pager.setAttribute('aria-label', 'Paginación de defensas');
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
        document.querySelector('.def-controls')?.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  };

  fetch('../data/defensas.json?v=' + Date.now(), {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      defensas = data.defensas || [];
      document.getElementById('stat-total-def').textContent = defensas.length;
      document.getElementById('stat-avanzadas').textContent = defensas.filter(d => d.madurez === 'Avanzada').length;
      document.getElementById('stat-familias-def').textContent = new Set(defensas.map(d => d.categoria_id)).size;

      const categories = [...new Map(defensas.map(d => [d.categoria_id,d.categoria])).entries()];
      filters.innerHTML = `<button class="def-filter is-active" data-category="todas">Todas</button>` +
        categories.map(([id,label]) => `<button class="def-filter" data-category="${esc(id)}">${esc(label)}</button>`).join('');

      filters.addEventListener('click', e => {
        const button = e.target.closest('.def-filter');
        if (!button) return;
        categoria = button.dataset.category || 'todas';
        currentPage = 1;
        filters.querySelectorAll('.def-filter').forEach(b => b.classList.toggle('is-active', b === button));
        render();
      });
      render();
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<div class="def-empty">No se ha podido cargar el catálogo de defensas.</div>';
    });

  search.addEventListener('input', e => { query = e.target.value.trim(); currentPage = 1; render(); });
})();
