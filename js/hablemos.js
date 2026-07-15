
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('hab-grid');
  const pager = document.getElementById('hab-pagination');
  if (!grid || !pager) return;

  const PAGE_SIZE = 4;
  const esc = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  let currentPage = Math.max(1, parseInt(new URLSearchParams(location.search).get('page') || '1', 10) || 1);

  fetch('../data/hablemos.json', {cache:'no-store'})
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      const stories = data.historias || [];
      const totalPages = Math.max(1, Math.ceil(stories.length / PAGE_SIZE));

      const render = () => {
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageStories = stories.slice(start, start + PAGE_SIZE);

        grid.innerHTML = pageStories.map(story => `
          <a class="hab-card" href="${esc(story.enlace)}">
            <div class="hab-card-head">
              <span class="hab-card-num">${esc(story.num)}</span>
              <span class="hab-card-label">${esc(story.label)}</span>
            </div>
            <div class="hab-card-body">
              <h2>${esc(story.title)}</h2>
              <p>${esc(story.subtitle)}</p>
            </div>
            <div class="hab-card-foot">Te lo explico →</div>
          </a>
        `).join('');

        pager.innerHTML = Array.from({length: totalPages}, (_, i) => i + 1).map(page => `
          <button class="hab-page ${page === currentPage ? 'is-active' : ''}" type="button" data-page="${page}" aria-label="Página ${page}">${page}</button>
        `).join('');

        pager.querySelectorAll('.hab-page').forEach(button => {
          button.addEventListener('click', () => {
            currentPage = Number(button.dataset.page);
            const url = new URL(location.href);
            if (currentPage === 1) url.searchParams.delete('page');
            else url.searchParams.set('page', currentPage);
            history.replaceState({}, '', url);
            render();
            document.querySelector('.hab-intro')?.scrollIntoView({behavior:'smooth', block:'start'});
          });
        });
      };

      render();
    })
    .catch(error => {
      console.error('Error cargando Hablemos:', error);
      grid.innerHTML = '<p>No se ha podido cargar el contenido.</p>';
    });
});
