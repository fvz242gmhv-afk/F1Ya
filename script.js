// Map Initialization
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    zoomSnap: 0.1,             // Permite niveles de zoom fraccionados (más fluido)
    zoomDelta: 0.2,            // Pasos de zoom más pequeños
    wheelPxPerZoomLevel: 200   // Requiere más giro de rueda para hacer zoom (más lento)
}).setView([-32.522779, -55.765835], 7); // Center of Uruguay

// Custom Dark Mode Map Tiles (CartoDB Dark Matter)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Data Management
// Initially empty, populated by fetch or localStorage
let crimeData = {};
let demoData = { men: 0, women: 0, minors: 0 };
let geoJsonLayer;

// Function to get color based on value
function getColor(d) {
    return d > 10 ? '#ff4757' : // High
        d > 5 ? '#ffa502' : // Medium
            d > 0 ? '#ff7f50' : // Low
                '#3742fa';  // No cases (Blue/Safe)
}

function getStyle(feature) {
    const deptName = feature.properties.NAME_1;
    const count = crimeData[deptName] || 0;

    return {
        fillColor: getColor(count),
        weight: 2,
        opacity: 1,
        color: '#1e272e', // Border color
        dashArray: '',
        fillOpacity: 0.7
    };
}

function updateHUD() {
    const total = Object.values(crimeData).reduce((a, b) => a + b, 0);
    const totalEl = document.getElementById('total-cases');

    // Simple text animation
    let current = parseInt(totalEl.innerText);
    if (isNaN(current)) current = 0;

    if (current !== total) totalEl.innerText = total;

    const now = new Date();
    document.getElementById('last-update').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Interactivity
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#fff',
        dashArray: '',
        fillOpacity: 0.9
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    showTooltip(e);
}

function resetHighlight(e) {
    geoJsonLayer.resetStyle(e.target);
    hideTooltip();
}

function showTooltip(e) {
    const layer = e.target;
    const props = layer.feature.properties;
    const count = crimeData[props.NAME_1] || 0;

    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = `<strong>${props.NAME_1}</strong><br/>Asesinatos: ${count}`;
    tooltip.style.display = 'block';

    const originalEvent = e.originalEvent;
    tooltip.style.left = originalEvent.pageX + 'px';
    tooltip.style.top = originalEvent.pageY + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

map.on('mousemove', function (e) {
    const tooltip = document.getElementById('tooltip');
    if (tooltip.style.display === 'block') {
        tooltip.style.left = e.originalEvent.pageX + 'px';
        tooltip.style.top = e.originalEvent.pageY + 'px';
    }
});

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
    if (feature.properties && feature.properties.NAME_1) {
        layer.bindTooltip(feature.properties.NAME_1, {
            permanent: true,
            direction: 'center',
            className: 'dept-label'
        });
    }
}

function updateRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    const sorted = Object.entries(crimeData)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    list.innerHTML = '';

    if (sorted.length === 0) {
        list.innerHTML = '<li style="padding:10px; color:#aaa; font-style:italic; font-size:0.8rem;">Sin datos registrados</li>';
        return;
    }

    sorted.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'ranking-item';
        li.innerHTML = `
            <div style="display:flex; align-items:center;">
                <span class="rank-number">#${index + 1}</span>
                <span class="rank-name">${item[0]}</span>
            </div>
            <strong style="color:var(--accent);">${item[1]}</strong>
        `;
        list.appendChild(li);
    });
}

function updateDemographics() {
    const menEl = document.getElementById('count-men');
    const womenEl = document.getElementById('count-women');
    const minorsEl = document.getElementById('count-minors');

    if (menEl) menEl.innerText = demoData.men || 0;
    if (womenEl) womenEl.innerText = demoData.women || 0;
    if (minorsEl) minorsEl.innerText = demoData.minors || 0;
}

// Fetch Data & Map
const MAP_URL = 'https://raw.githubusercontent.com/alotropico/uruguay.geo/master/uruguay.json';
// Add timestamp to prevent caching old data.json
const DATA_JSON_URL = 'data.json' + '?t=' + new Date().getTime();

Promise.all([
    fetch(MAP_URL).then(r => r.json()),
    fetch(DATA_JSON_URL).then(r => r.json().catch(() => null)) // Use catch to handle empty or invalid JSON
]).then(([topology, remoteData]) => {

    // 1. Determine Data Source
    // Priority: LocalStorage (Local Dev/Admin) > Remote JSON (Public Mobile/Github)

    const localCrime = JSON.parse(localStorage.getItem('uruguayCrimeData'));
    const localDemo = JSON.parse(localStorage.getItem('uruguayDemoData'));

    // Validar si hay datos locales "reales" (más de 0 keys/datos)
    const hasLocalData = localCrime && Object.keys(localCrime).length > 0;

    if (hasLocalData) {
        console.log("Modo: Datos Locales (Admin/Dev)");
        crimeData = localCrime || {};
        demoData = localDemo || { men: 0, women: 0, minors: 0 };
    } else if (remoteData) {
        console.log("Modo: Datos Remotos (Público/Github)");
        crimeData = remoteData.crimes || {};
        demoData = remoteData.demographics || { men: 0, women: 0, minors: 0 };
    } else {
        console.log("Modo: Inicial (Vacío)");
        crimeData = {};
        demoData = { men: 0, women: 0, minors: 0 };
    }

    // 2. Setup Map
    const geojson = topojson.feature(topology, topology.objects.uruguay);
    geoJsonLayer = L.geoJson(geojson, {
        style: getStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    // Initial fill for missing keys
    geojson.features.forEach(f => {
        const name = f.properties.NAME_1;
        if (crimeData[name] === undefined) crimeData[name] = 0;
    });

    // 3. Update UI
    updateHUD();
    updateRanking();
    updateDemographics();
})
    .catch(err => {
        console.warn("Critical Error loading data:", err);
    });

// Listener for localStorage changes (Only really useful when Admin is open in another tab on SAME PC)
window.addEventListener('storage', (e) => {
    if (e.key === 'uruguayCrimeData') {
        crimeData = JSON.parse(e.newValue);
        if (geoJsonLayer) geoJsonLayer.eachLayer(l => l.setStyle(getStyle(l.feature)));
        updateHUD();
        updateRanking();
    }
    if (e.key === 'uruguayDemoData') {
        demoData = JSON.parse(e.newValue);
        updateDemographics();
    }
});
