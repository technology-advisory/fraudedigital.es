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
        { key: 'index',              href: `${basePath}index.html`,                       label: 'Inicio' },
        { key: 'amenazas',           href: `${basePath}amenazas/index.html`,              label: 'Amenazas' },
        { key: 'defensas',           href: `${basePath}defensas/index.html`,              label: 'Defensas' },
        { key: 'alertas-incibe',     href: `${basePath}alertas-incibe/index.html`,        label: 'Alertas INCIBE' },
        { key: 'guia',               href: `${basePath}guia/fraude-digital.html`,         label: 'Guía' },
        { key: 'ejemplos',           href: `${basePath}ejemplos/index.html`,              label: 'Casos Reales' },
        { key: 'primeros-auxilios',  href: `${basePath}primeros-auxilios/index.html`,     label: 'Primeros Auxilios' },
        { key: 'herramientas',       href: `${basePath}herramientas/index.html`,          label: 'Herramientas' },
        { key: 'sobre-mi',           href: `${basePath}sobre-mi.html`,                    label: 'Sobre Mí' },
        { key: 'legal',              href: `${basePath}legal/aviso-legal.html`,           label: 'Legal' }
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
                <ul class="nav-list" style="display: flex; align-items: center; gap: 0.5rem 1.5rem; list-style: none; padding: 0; margin: 0; flex-wrap: wrap;">
                    ${links.map(l => {
                        const isLegal = l.key === 'legal';
                        const style = isLegal
                            ? "text-decoration:none; color:#ffffff; font-weight:700; font-size:0.85rem; background:#dc2626; padding:6px 16px; border-radius:20px; transition: background 0.2s; display: flex; align-items: center; gap: 6px;"
                            : "text-decoration:none; color:#334155; font-weight:600; font-size:0.95rem; transition: color 0.2s; display: flex; align-items: center; gap: 6px;";
                        return `
                        <li>
                            <a href="${l.href}" class="menu-link${isLegal ? ' menu-link-cta' : ''}" data-page="${l.key}" style="${style}">
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
