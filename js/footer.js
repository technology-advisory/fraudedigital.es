document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("footer-container");
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer style="background-color: #0f172a; color: #94a3b8; padding: 4rem 2rem 2rem; font-size: 0.9rem; border-top: 1px solid #1e293b; font-family: 'Segoe UI', system-ui, sans-serif;">
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 3rem; padding-bottom: 3rem; border-bottom: 1px solid #1e293b;">
                
                <!-- Columna 1: Marca y Propósito -->
                <div>
                    <a href="/" style="font-size: 1.3rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 1rem;">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        FraudeDigital.es
                    </a>
                    <p style="color: #64748b; line-height: 1.6;">Análisis operativo, respuesta a incidentes y contramedidas técnicas frente a las estafas y el fraude online en España. Menos burocracia, más efectividad.</p>
                </div>

                <!-- Columna 2: Amenazas Críticas -->
                <div>
                    <h4 style="color: #ffffff; margin-bottom: 1.2rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">Líneas de Defensa</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="/amenazas/phishing-tradicional.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Phishing de Identidad</a></li>
                        <li><a href="/amenazas/vishing.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Vishing e Ingeniería de Voz</a></li>
                        <li><a href="/amenazas/smishing.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Smishing y Canales Móviles</a></li>
                        <li><a href="/amenazas/ia-estafas.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Fraudes con Inteligencia Artificial</a></li>
                    </ul>
                </div>

                <!-- Columna 3: Herramientas Operativas -->
                <div>
                    <h4 style="color: #ffffff; margin-bottom: 1.2rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">Herramientas</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="/emergencia.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Checklist de Respuesta Inmediata</a></li>
                        <li><a href="/herramientas/generador-denuncias.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Generador de Denuncias</a></li>
                        <li><a href="/herramientas/verificacion-online.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Verificación Online</a></li>
                        <li><a href="/defensas/index.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Panel de Defensas</a></li>
                    </ul>
                </div>

            </div>

            <!-- Barra Inferior Legal -->
            <div style="max-width: 1200px; margin: 2rem auto 0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; font-size: 0.85rem; color: #64748b;">
                <p>© 2026 FraudeDigital.es — Enfoque Técnico y Práctico contra el Cibercrimen.</p>
                <div style="display: flex; flex-wrap: wrap; gap: 1rem 1.5rem;">
                    <a href="/legal/aviso-legal.html" style="color: #64748b; text-decoration: none;">Aviso Legal</a>
                    <a href="/legal/privacidad.html" style="color: #64748b; text-decoration: none;">Política de Privacidad</a>
                    <a href="/legal/cookies.html" style="color: #64748b; text-decoration: none;">Cookies</a>
                </div>
            </div>
        </footer>
    `;
});