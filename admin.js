const departments = [
    "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores",
    "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Río Negro",
    "Rivera", "Rocha", "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
];

let crimeData = JSON.parse(localStorage.getItem('uruguayCrimeData')) || {};
let demoData = JSON.parse(localStorage.getItem('uruguayDemoData')) || { men: 0, women: 0, minors: 0 };

// ===== MANEJO DE DATOS Y UI BASICA =====
function init() {
    // 1. Cargar Deptos
    const grid = document.getElementById('departments-grid');
    grid.innerHTML = '';

    departments.forEach(dept => {
        const count = crimeData[dept] || 0;

        const card = document.createElement('div');
        card.className = 'dept-card';
        card.innerHTML = `
            <span class="dept-name">${dept}</span>
            <div class="input-group">
                <input type="number" id="input-${dept}" value="${count}" min="0">
                <button onclick="update('${dept}', 1)">+</button>
                <button onclick="update('${dept}', -1)">-</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // 2. Cargar Demografia
    const menInput = document.getElementById('demo-men');
    const womenInput = document.getElementById('demo-women');
    const minorsInput = document.getElementById('demo-minors');

    if (menInput) menInput.value = demoData.men || 0;
    if (womenInput) womenInput.value = demoData.women || 0;
    if (minorsInput) minorsInput.value = demoData.minors || 0;
}

function update(dept, change) {
    const input = document.getElementById(`input-${dept}`);
    let val = parseInt(input.value) + change;
    if (val < 0) val = 0;
    input.value = val;
    saveAll();
}

function saveAll() {
    // 1. Guardar Deptos
    departments.forEach(dept => {
        const input = document.getElementById(`input-${dept}`);
        crimeData[dept] = parseInt(input.value) || 0;
    });

    // 2. Guardar Demografia
    const menInput = document.getElementById('demo-men');
    if (menInput) {
        demoData.men = parseInt(menInput.value) || 0;
        demoData.women = parseInt(document.getElementById('demo-women').value) || 0;
        demoData.minors = parseInt(document.getElementById('demo-minors').value) || 0;
        localStorage.setItem('uruguayDemoData', JSON.stringify(demoData)); // Nueva Key
    }

    localStorage.setItem('uruguayCrimeData', JSON.stringify(crimeData));

    const btn = document.querySelector('.save-btn');
    const originalText = btn.innerText;
    btn.innerText = "¡Guardado!";
    setTimeout(() => btn.innerText = originalText, 1000);
}

// ===== RADAR DE NOTICIAS CON ANALISIS DE TEXTO =====

const RSS_FEEDS = [
    { url: 'https://news.google.com/rss/search?q=homicidio+uruguay+when:3d&hl=es-419&gl=UY&ceid=UY:es-419', name: 'Google News', type: 'xml' },
    { url: 'https://www.subrayado.com.uy/policiales/rss.xml', name: 'Subrayado', type: 'xml' },
    { url: 'https://www.montevideo.com.uy/Seccion/Policiales', name: 'Mvd Portal', type: 'html' },
    { url: 'https://www.debate.com.uy/seccion/seguridad', name: 'Debate.uy', type: 'html' },
    { url: 'https://www.xn--lamaana-7za.uy/actualidad/', name: 'La Mañana', type: 'html' }
];

const TWITTER_SOURCES = [
    { name: 'Teledoce', url: 'https://x.com/teledoce' },
    { name: 'Canal 4', url: 'https://x.com/Canal4_UY' },
    { name: 'Canal 10', url: 'https://x.com/canal10uruguay' },
    { name: 'Derecha Diario', url: 'https://x.com/DerechaDiarioUY' }
];

const LOCAL_SOURCES = [
    { name: 'El Telégrafo (Paysandú)', url: 'https://www.eltelegrafo.com/seccion/policiales/' },
    { name: 'Diario Cambio (Salto)', url: 'https://diariocambio.com.uy/categoria/policiales/' },
    { name: 'Diario Norte (Rivera)', url: 'https://diarionorte.com.uy/policiales/' },
    { name: 'Mvd Portal (Policiales)', url: 'https://www.montevideo.com.uy/Seccion/Policiales' }
];


// Palabras clave para detectar si es un homicidio
const KILL_KEYWORDS = ['asesinado', 'asesinato', 'homicidio', 'mataron', 'muerto', 'cuerpo', 'baleado', 'apuñalado', 'crimen'];

// Función para obtener texto limpio y quitar acentos para comparar
function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Inyectar sección de Fuentes Externas (Twitter + Locales)
function renderExternalSources() {
    const newsSection = document.querySelector('.news-section');
    if (document.getElementById('external-links')) return;

    const div = document.createElement('div');
    div.id = 'external-links';
    div.style.marginBottom = '1rem';

    // Twitter Links
    let html = '<div style="margin-bottom:0.5rem; padding:0.8rem; background:rgba(29, 161, 242, 0.1); border-radius:8px;">';
    html += '<h3 style="margin:0 0 0.5rem 0; font-size:0.8rem; color:#1DA1F2;">Rápido: Redes Sociales</h3><div style="display:flex; gap:0.5rem; flex-wrap:wrap;">';
    TWITTER_SOURCES.forEach(src => {
        html += `<a href="${src.url}" target="_blank" style="background:#1DA1F2; color:white; text-decoration:none; padding:0.2rem 0.6rem; border-radius:4px; font-size:0.75rem;">${src.name}</a>`;
    });
    html += '</div></div>';

    // Local Press Links
    html += '<div style="margin-bottom:0.5rem; padding:0.8rem; background:rgba(255, 165, 2, 0.1); border-radius:8px;">';
    html += '<h3 style="margin:0 0 0.5rem 0; font-size:0.8rem; color:#ffa502;">Prensa del Interior (Manual)</h3><div style="display:flex; gap:0.5rem; flex-wrap:wrap;">';
    LOCAL_SOURCES.forEach(src => {
        html += `<a href="${src.url}" target="_blank" style="background:#ffa502; color:#000; text-decoration:none; padding:0.2rem 0.6rem; border-radius:4px; font-size:0.75rem; font-weight:bold;">${src.name}</a>`;
    });
    html += '</div></div>';

    div.innerHTML = html;

    const subtitle = newsSection.querySelector('.subtitle');
    subtitle.parentNode.insertBefore(div, subtitle.nextSibling);
}

function detectDepartment(title) {
    const normalized = normalizeText(title);
    for (let dept of departments) {
        if (normalized.includes(normalizeText(dept))) {
            return dept;
        }
    }
    return null;
}

// Nueva Función: Escaneo Profundo de Artículos
async function scanArticleForLocation(url) {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (!data.contents) return null;

        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, "text/html");

        // Estrategia: Unir textos de parrafos P
        const paragraphs = Array.from(doc.querySelectorAll('p'))
            .map(p => p.textContent)
            .join(' ');

        return detectDepartment(paragraphs);

    } catch (e) {
        return null;
    }
}

async function fetchNews() {
    renderExternalSources();

    const newsContainer = document.getElementById('news-feed');
    const loading = document.getElementById('loading-feed');
    let allItems = [];
    let totalScanned = 0;

    loading.style.display = 'block';
    loading.innerHTML = 'Inicializando escaneo...';
    newsContainer.innerHTML = '';

    for (let feed of RSS_FEEDS) {
        try {
            loading.innerHTML = `Analizando fuente: <b>${feed.name}</b>...`;

            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
            const data = await response.json();

            let candidates = [];

            if (feed.type === 'xml' && data.contents) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                const items = xmlDoc.querySelectorAll("item");
                totalScanned += items.length;

                items.forEach(item => {
                    const title = item.querySelector("title").textContent;
                    const link = item.querySelector("link").textContent;
                    const dateStr = item.querySelector("pubDate")?.textContent;
                    const date = dateStr ? new Date(dateStr) : new Date();
                    candidates.push({ title, link, date, source: feed.name });
                });
            } else if (feed.type === 'html' && data.contents) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, "text/html");
                const headlines = doc.querySelectorAll('h1 a, h2 a, h3 a, article a');

                totalScanned += headlines.length;

                headlines.forEach(a => {
                    const title = a.textContent.trim();
                    const href = a.getAttribute('href');
                    if (title.length > 15) {
                        let link = href;
                        if (link && !link.startsWith('http')) {
                            const origin = new URL(feed.url).origin;
                            link = origin + (link.startsWith('/') ? link : '/' + link);
                        }
                        candidates.push({ title, link, date: new Date(), source: feed.name });
                    }
                });
            }

            // Procesar candidatos de esta fuente
            let itemsFound = 0;
            for (let item of candidates) {
                if (isRelevant(item.title)) {
                    let dept = detectDepartment(item.title);
                    let detectedVia = 'Título';

                    // DEEP SCAN: Si es relevante pero no dice dónde
                    if (!dept) {
                        loading.innerHTML = `Leyendo artículo: <b>"${item.title.substring(0, 40)}..."</b>`;
                        // Esperar un poco para no saturar si son muchos (opcional)
                        dept = await scanArticleForLocation(item.link);
                        if (dept) detectedVia = 'Lectura IA';
                    }

                    itemsFound++;
                    allItems.push({ ...item, dept, detectedVia });
                }
            }
            console.log(`[Radar] ${feed.name}: Escaneados ${candidates.length}, Relevantes: ${itemsFound}`);

        } catch (e) {
            console.error("Error fetching feed:", feed.name, e);
            loading.innerHTML += `<br/><span style="color:red">Error en ${feed.name}</span>`;
        }
    }

    allItems.sort((a, b) => b.date - a.date);

    // Filter duplicates
    const uniqueItems = [];
    const seen = new Set();
    allItems.forEach(item => {
        const key = item.link || item.title;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueItems.push(item);
        }
    });

    loading.style.display = 'none';
    newsContainer.innerHTML = '';

    if (uniqueItems.length === 0) {
        newsContainer.innerHTML = `
            <div style="text-align:center; color:#888; padding:1rem;">
                <small>Se analizaron <b>${totalScanned}</b> titulares.</small>
                <p>Sin noticias relevantes recientes.</p>
            </div>
        `;
        return;
    }

    // Header de resultados
    const statusDiv = document.createElement('div');
    statusDiv.style.marginBottom = '1rem';
    statusDiv.style.fontSize = '0.8rem';
    statusDiv.style.color = 'var(--text-secondary)';
    statusDiv.innerHTML = `Hechos encontrados: <b>${uniqueItems.length}</b>`;
    newsContainer.appendChild(statusDiv);

    uniqueItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'news-item';

        let actionHtml = '';
        if (item.dept) {
            actionHtml = `
                <div class="suggested-action">
                    <span class="suggested-text">
                        Detectado: <b>${item.dept}</b> (+1)<br/>
                        <small style="color:#aaa; font-size:10px;">Vía: ${item.detectedVia}</small>
                    </span>
                    <button class="confirm-btn" onclick="applySuggestion('${item.dept}')">Confirmar</button>
                    <button class="confirm-btn" onclick="applySuggestion('${item.dept}')">Confirmar</button> 
                </div>
            `;
        } else {
            // Generar ID único para este selector
            const uniqueId = `sel-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Generar opciones del select
            let options = `<option value="">- Asignar Dpto -</option>`;
            departments.forEach(d => options += `<option value="${d}">${d}</option>`);

            actionHtml = `
                <div class="suggested-action" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); flex-direction:column; align-items:flex-start;">
                    <span class="suggested-text" style="color: #aaa; margin-bottom:5px;">Ubicación no detectada. Asignar:</span>
                    <div style="display:flex; gap:5px; width:100%;">
                        <select id="${uniqueId}" style="background:#222; color:#eee; border:1px solid #444; padding:4px; border-radius:4px; font-size:0.8rem; flex-grow:1;">
                            ${options}
                        </select>
                        <button class="confirm-btn" onclick="let s=document.getElementById('${uniqueId}'); if(s.value){ applySuggestion(s.value); } else { alert('Selecciona un departamento primero'); }">Confirmar</button>
                    </div>
                </div>
            `;
        }

        // Correccion duplicati botom
        if (item.dept) {
            actionHtml = `
                <div class="suggested-action">
                    <span class="suggested-text">
                        Detectado: <b>${item.dept}</b> (+1)<br/>
                        <small style="color:#aaa; font-size:10px;">Vía: ${item.detectedVia}</small>
                    </span>
                    <button class="confirm-btn" onclick="applySuggestion('${item.dept}')">Confirmar</button>
                </div>
            `;
        }

        div.innerHTML = `
            <div>
                <span class="news-source">${item.source}</span>
                <span class="news-date">${item.date.toLocaleDateString()}</span>
            </div>
            <div class="news-title"><a href="${item.link}" target="_blank" style="color:inherit; text-decoration:none;">${item.title}</a></div>
            ${actionHtml}
        `;
        newsContainer.appendChild(div);
    });
}

function isRelevant(title) {
    const normalized = normalizeText(title);
    return KILL_KEYWORDS.some(keyword => normalized.includes(keyword));
}

function applySuggestion(dept) {
    update(dept, 1);
    alert(`Se agregó +1 caso a ${dept}`);
}

// Inicialización
init();
fetchNews();
// Actualizar noticias cada 5 minutos
setInterval(fetchNews, 300000);

// Listen for storage changes
window.addEventListener('storage', (e) => {
    if (e.key === 'uruguayCrimeData') {
        crimeData = JSON.parse(e.newValue);
        init();
    }
});
