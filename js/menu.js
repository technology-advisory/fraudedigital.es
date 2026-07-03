/* ============================================================
   FraudeDigital.es — menu.js
   Header responsive con hamburguesa móvil
   ============================================================ */
document.addEventListener("DOMContentLoaded", function() {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) return;

    // Detectar subcarpeta
    const isInSubfolder = /\/(amenazas|legal|guia|primeros-auxilios|herramientas|ejemplos|defensas|alertas-incibe)\//.test(window.location.pathname);
    const basePath = isInSubfolder ? '../' : '';

    // ============================================================
    // LINKS DEL MENÚ (para mantener orden único)
    // ============================================================
    const links = [
        { key: 'index',              href: `${basePath}index.html`,                       label: 'Inicio',
          icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
        { key: 'amenazas',           href: `${basePath}amenazas/index.html`,              label: 'Amenazas',
          icon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
        { key: 'defensas',           href: `${basePath}defensas/index.html`,              label: 'Defensas',
          icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>' },
        { key: 'alertas-incibe',     href: `${basePath}alertas-incibe/index.html`,        label: 'Alertas INCIBE',
          icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
        { key: 'guia',               href: `${basePath}guia/fraude-digital.html`,         label: 'Guía',
          icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' },
        { key: 'ejemplos',           href: `${basePath}ejemplos/index.html`,              label: 'Casos Reales',
          icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
        { key: 'primeros-auxilios',  href: `${basePath}primeros-auxilios/index.html`,     label: 'Primeros Auxilios',
          icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>' },
        { key: 'herramientas',       href: `${basePath}herramientas/index.html`,          label: 'Herramientas',
          icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
        { key: 'sobre-mi',           href: `${basePath}sobre-mi.html`,                    label: 'Sobre Mí',
          icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
        { key: 'legal',              href: `${basePath}legal/aviso-legal.html`,           label: 'Legal',
          icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' }
    ];

    // Renderizar
    menuContainer.innerHTML = `
        <nav class="site-nav" style="border-bottom: 1px solid #e2e8f0; padding: 0.8rem 2rem; background: #ffffff; font-family: 'Segoe UI', system-ui, sans-serif; position: sticky; top: 0; z-index: 100;">
            <div class="nav-container" style="max-width: 1380px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">

                <!-- Logo -->
                <a href="${basePath}index.html" class="logo-link" style="font-size: 1.35rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    FraudeDigital.es
                </a>

                <!-- Botón hamburguesa (móvil) -->
                <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false">
                    <svg class="icon-open"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                <!-- Enlaces -->
                <ul class="nav-list" style="display: flex; align-items: center; justify-content: flex-end; gap: 0.35rem 1.05rem; list-style: none; padding: 0; margin: 0; flex-wrap: wrap; flex: 1 1 auto;">
                    ${links.map(l => {
                        const isLegal = l.key === 'legal';
                        const style = isLegal
                            ? "text-decoration:none; color:#ffffff; font-weight:700; font-size:0.78rem; background:#dc2626; padding:5px 13px; border-radius:16px; transition: background 0.2s; display: flex; align-items: center; gap: 5px; white-space:nowrap;"
                            : "text-decoration:none; color:#334155; font-weight:600; font-size:0.82rem; transition: color 0.2s; display: flex; align-items: center; gap: 4px; white-space:nowrap;";
                        return `
                        <li>
                            <a href="${l.href}" class="menu-link${isLegal ? ' menu-link-cta' : ''}" data-page="${l.key}" style="${style}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">${l.icon}</svg>
                                ${l.label}
                            </a>
                        </li>
                    `;
                    }).join('')}
                </ul>
            </div>
        </nav>
    `;

    // ============================================================
    // TOGGLE HAMBURGUESA
    // ============================================================
    const toggle  = menuContainer.querySelector('.menu-toggle');
    const list    = menuContainer.querySelector('.nav-list');
    const iconOpen  = menuContainer.querySelector('.icon-open');
    const iconClose = menuContainer.querySelector('.icon-close');

    if (toggle && list) {
        toggle.addEventListener('click', () => {
            const isOpen = list.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            iconOpen.style.display  = isOpen ? 'none' : 'block';
            iconClose.style.display = isOpen ? 'block' : 'none';
        });

        // Cerrar al pinchar un link (útil en móvil)
        list.querySelectorAll('a.menu-link').forEach(a => {
            a.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    list.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    iconOpen.style.display  = 'block';
                    iconClose.style.display = 'none';
                }
            });
        });
    }

    // ============================================================
    // RESALTAR PÁGINA ACTUAL
    // ============================================================
    const currentPath = window.location.pathname;
    menuContainer.querySelectorAll('.menu-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        const cleanHref = href.replace(/^\.\.\//, '').replace(/#.*$/, '');
        let isActive = false;

        if (cleanHref === 'index.html' && (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html') && !currentPath.includes('/amenazas/') && !currentPath.includes('/ejemplos/') && !currentPath.includes('/herramientas/') && !currentPath.includes('/primeros-auxilios/') && !currentPath.includes('/defensas/') && !currentPath.includes('/alertas-incibe/'))) isActive = true;
        else if (cleanHref === 'amenazas/index.html' && currentPath.includes('/amenazas/')) isActive = true;
        else if (cleanHref === 'defensas/index.html' && currentPath.includes('/defensas/')) isActive = true;
        else if (cleanHref === 'alertas-incibe/index.html' && currentPath.includes('/alertas-incibe/')) isActive = true;
        else if (cleanHref === 'guia/fraude-digital.html' && currentPath.includes('/guia/')) isActive = true;
        else if (cleanHref === 'ejemplos/index.html' && currentPath.includes('/ejemplos/')) isActive = true;
        else if (cleanHref === 'primeros-auxilios/index.html' && currentPath.includes('/primeros-auxilios/')) isActive = true;
        else if (cleanHref === 'herramientas/index.html' && currentPath.includes('/herramientas/')) isActive = true;
        else if (cleanHref === 'sobre-mi.html' && currentPath.includes('sobre-mi')) isActive = true;
        else if (cleanHref === 'legal/aviso-legal.html' && currentPath.includes('/legal/')) isActive = true;

        if (isActive && link.dataset.page !== 'legal') {
            link.style.color = '#dc2626';
            link.setAttribute('data-active', 'true');
        } else if (isActive) {
            link.setAttribute('data-active', 'true');
        }
    });

    // Hover
    menuContainer.querySelectorAll('.menu-link').forEach(link => {
        if (link.dataset.page === 'legal') {
            link.addEventListener('mouseover', function() { this.style.background = '#b91c1c'; });
            link.addEventListener('mouseout', function() { this.style.background = '#dc2626'; });
            return;
        }
        link.addEventListener('mouseover', function() {
            if (this.getAttribute('data-active') !== 'true') this.style.color = '#dc2626';
        });
        link.addEventListener('mouseout', function() {
            if (this.getAttribute('data-active') !== 'true') this.style.color = '#334155';
        });
    });
});
