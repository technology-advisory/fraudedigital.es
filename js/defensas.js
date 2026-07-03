/* ============================================================
   FraudeDigital.es — defensas.js
   Lógica del hub /defensas/: carga catálogo, renderiza tarjetas,
   gestiona búsqueda. Módulo independiente del de amenazas.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ==============================
    // ICONOS SVG (paleta verde, propia del módulo defensa)
    // ==============================
    const iconosSVG = {
        'candado':   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        'escudo':    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
        'backup':    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
        'usuarios':  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    };

    // ==============================
    // ESTADO
    // ==============================
    let todasLasDefensas = [];
    let queryActual = '';

    // ==============================
    // CARGA DEL JSON
    // ==============================
    async function cargarDefensas() {
        const grid = document.getElementById('grid-defensas');
        if (!grid) return;
        try {
            const response = await fetch('../data/defensas.json');
            if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');
            const data = await response.json();
            todasLasDefensas = data.defensas || [];
            renderizarTarjetas(todasLasDefensas);
        } catch (error) {
            console.error('Error cargando defensas:', error);
            grid.innerHTML = `
                <p style="color: #dc2626; grid-column: 1/-1; text-align: center; padding: 40px;">
                    ❌ Error al cargar el catálogo. Intenta recargar la página.
                </p>
            `;
        }
    }

    // ==============================
    // RENDERIZADO DE TARJETAS
    // ==============================
    function renderizarTarjetas(defensas) {
        const grid = document.getElementById('grid-defensas');
        if (!grid) return;

        if (defensas.length === 0) {
            grid.innerHTML = `
                <p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 40px; font-size: 16px;">
                    🔍 No se encontraron defensas con esa búsqueda.
                </p>
            `;
            return;
        }

        let html = '';
        defensas.forEach(d => {
            const iconoSVG = iconosSVG[d.icono] || iconosSVG['escudo'];
            html += `
                <a href="${d.enlace}" class="threat-card" style="text-decoration: none; color: inherit; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; transition: all 0.2s; display: flex; flex-direction: column; gap: 12px;" onmouseover="this.style.borderColor='#16a34a'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='none'">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-family: monospace; font-size: 11px; color: #16a34a; font-weight: 700;">${d.exp}</div>
                        ${iconoSVG}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">${d.titulo}</h3>
                        <span style="font-size: 9px; background: #16a34a; color: #fff; padding: 2px 8px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">${d.badge}</span>
                    </div>
                    <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0;">${d.descripcion}</p>
                </a>
            `;
        });

        grid.innerHTML = html;
        actualizarContador(defensas.length);
    }

    // ==============================
    // CONTADOR
    // ==============================
    function actualizarContador(cantidad) {
        const el = document.getElementById('contador-defensas');
        if (el) el.textContent = `${cantidad} defensas`;
    }

    // ==============================
    // BÚSQUEDA
    // ==============================
    window.ejecutarFiltroDefensas = function () {
        const input = document.getElementById('search-input-defensas');
        if (!input) return;
        queryActual = input.value.toLowerCase().trim();

        if (queryActual === '') {
            renderizarTarjetas(todasLasDefensas);
            return;
        }

        const resultado = todasLasDefensas.filter(d => {
            const tituloMatch = d.titulo.toLowerCase().includes(queryActual);
            const descMatch = d.descripcion.toLowerCase().includes(queryActual);
            const tagsMatch = (d.tags || []).some(tag => tag.toLowerCase().includes(queryActual));
            return tituloMatch || descMatch || tagsMatch;
        });

        renderizarTarjetas(resultado);
    };

    cargarDefensas();
});
