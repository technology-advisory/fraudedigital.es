/* ============================================================
   FraudeDigital.es — main.js  (home)
   ----------------------------------------------------
   - data/amenazas.json       → catálogo maestro (13 amenazas)
   - data/fraudes.json        → panel de control del home:
       · destacadas    (array de IDs a mostrar en el catálogo)
   - data/fraudes-incibe.json → banda roja "Últimas amenazas
     detectadas" (resumen breve). Alimentado por el script del
     repo privado de Miguel. Parseado vía js/alertas-incibe.js.
     Listado completo en /alertas-incibe/.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    // ==============================
    // Mapa de iconos: color + SVG por tipo
    // ==============================
    const ICONOS = {
        'correo':     { color: '#2563eb', svg: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>` },
        'telefono':   { color: '#16a34a', svg: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>` },
        'sms':        { color: '#ea580c', svg: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>` },
        'qr':         { color: '#4f46e5', svg: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>` },
        'ia':         { color: '#9333ea', svg: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>` },
        'usuarios':   { color: '#0d9488', svg: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` },
        'wifi':       { color: '#0891b2', svg: `<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.94 0"/><circle cx="12" cy="20" r="1"/>` },
        'sim':        { color: '#c2410c', svg: `<rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 2v20"/><path d="M16 2v20"/><path d="M2 8h20"/><path d="M2 16h20"/>` },
        'factura':    { color: '#7c3aed', svg: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>` },
        'chantaje':   { color: '#be123c', svg: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>` },
        'ransomware': { color: '#dc2626', svg: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>` },
        'compra':     { color: '#059669', svg: `<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>` }
    };

    // Detección de ruta base (por si el home se sirve desde subdir)
    const inSubfolder = /\/(amenazas|guia|legal|primeros-auxilios)\//.test(window.location.pathname);
    const basePath = inSubfolder ? '../' : '';

    let amenazasCatalogo = [];   // catálogo completo (para buscador)
    let amenazasHome = [];       // subset destacadas para tarjetas

    // ==============================
    // Carga de datos: catálogo + panel de control
    // ==============================
    Promise.all([
        fetch(basePath + 'data/amenazas.json').then(r => r.json()),
        fetch(basePath + 'data/fraudes.json').then(r => r.json()).catch(() => ({ destacadas: [] })),
        fetch(basePath + 'data/fraudes-incibe.json').then(r => r.json()).catch(() => ({ alertas: [] }))
    ]).then(([amenazasJson, fraudesJson, incibeJson]) => {
        amenazasCatalogo = amenazasJson.amenazas || [];
        const destacadas = fraudesJson.destacadas || [];
        const byId = Object.fromEntries(amenazasCatalogo.map(a => [a.id, a]));

        // Preservar el orden que el usuario definió en fraudes.json
        amenazasHome = destacadas.map(id => byId[id]).filter(Boolean);

        const alertasParseadas = (window.FDIncibe ? window.FDIncibe.parseAlertas(incibeJson.alertas) : []);
        renderAlerts(alertasParseadas);
        renderAmenazas(amenazasHome);
    }).catch(err => {
        console.error("Error cargando base de datos:", err);
    });

    // ==============================
    // Alertas Rojas · resumen breve (fuente: fraudes-incibe.json)
    // ==============================
    function renderAlerts(alertasParseadas) {
        const container = document.getElementById("alerts-container");
        if(!container) return;

        if (!alertasParseadas || alertasParseadas.length === 0) {
            container.innerHTML = '';
            return;
        }

        const MAX_HOME = 4;
        const fmtFecha = (window.FDIncibe && window.FDIncibe.formatFecha) || (f => f);
        const truncar = (window.FDIncibe && window.FDIncibe.truncar) || (t => t);

        container.innerHTML = alertasParseadas.slice(0, MAX_HOME).map(a => `
            <a href="${basePath}alertas-incibe/index.html#alerta-${a.id}" class="alert-card">
                <span style="display:inline-block; font-family:'Courier New',monospace; font-size:10px; font-weight:700; letter-spacing:0.05em; color:#dc2626; text-transform:uppercase; margin-right:8px;">INCIBE · ${fmtFecha(a.fecha)}</span><br>
                <strong>${a.titulo}</strong>
                <span style="display:block; font-size:0.85rem; color:#64748b; font-weight:400; margin-top:4px;">${truncar(a.descripcion, 110)}</span>
            </a>
        `).join('') + (alertasParseadas.length > MAX_HOME ? `
            <a href="${basePath}alertas-incibe/index.html" class="alert-card" style="text-align:center; font-weight:700; color:#dc2626; display:flex; align-items:center; justify-content:center;">
                Ver las ${alertasParseadas.length} alertas de INCIBE →
            </a>
        ` : '');
    }

    // ==============================
    // Rejilla de Amenazas (formato original: SVG grande a la izquierda)
    // ==============================
    function renderAmenazas(amenazas) {
        const container = document.getElementById("amenazas-container");
        if(!container) return;

        container.innerHTML = amenazas.map(item => {
            const icono = ICONOS[item.icono] || ICONOS['correo'];
            return `
                <a href="${basePath}amenazas/${item.enlace}" class="card-amenaza">
                    <svg viewBox="0 0 24 24" fill="none" stroke="${icono.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        ${icono.svg}
                    </svg>
                    <div class="card-body">
                        <h3>${item.titulo}</h3>
                        <p>${item.descripcion}</p>
                    </div>
                </a>
            `;
        }).join('');
    }

    // ==============================
    // Buscador en tiempo real (usa el catálogo completo, no solo destacadas)
    // ==============================
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    if(searchInput) {
        searchInput.addEventListener("input", function(e) {
            const query = e.target.value.toLowerCase().trim();
            if(query.length < 2) {
                if(searchResults) searchResults.style.display = "none";
                return;
            }

            const filtered = amenazasCatalogo.filter(item =>
                item.titulo.toLowerCase().includes(query) ||
                item.descripcion.toLowerCase().includes(query) ||
                (item.tags || []).some(kw => kw.toLowerCase().includes(query))
            );

            if(!searchResults) return;

            if(filtered.length > 0) {
                searchResults.innerHTML = filtered.map(item => `
                    <a href="${basePath}amenazas/${item.enlace}" class="search-item">
                        <strong>${item.titulo}</strong> — ${item.descripcion}
                    </a>
                `).join('');
                searchResults.style.display = "block";
            } else {
                searchResults.innerHTML = `<div class="search-item" style="color:#64748b;">No se encontraron amenazas coincidentes...</div>`;
                searchResults.style.display = "block";
            }
        });
    }
});
