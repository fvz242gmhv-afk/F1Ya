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
let crimeData = JSON.parse(localStorage.getItem('uruguayCrimeData')) || {};
let demoData = JSON.parse(localStorage.getItem('uruguayDemoData')) || { men: 0, women: 0, minors: 0 };
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

    if (current !== total) {
        totalEl.innerText = total;
        // Ideally add a count-up animation here
    }

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

    // Follow cursor
    const originalEvent = e.originalEvent;
    tooltip.style.left = originalEvent.pageX + 'px';
    tooltip.style.top = originalEvent.pageY + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

// Mouse move listener for tooltip following
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
        // click: zoomToFeature
    });

    // Agregar etiqueta permanente
    if (feature.properties && feature.properties.NAME_1) {
        layer.bindTooltip(feature.properties.NAME_1, {
            permanent: true,
            direction: 'center',
            className: 'dept-label'
        });
    }
}

// Fetch TopoJSON
// Using the raw URL from the alotropico repo we found: https://raw.githubusercontent.com/alotropico/uruguay.geo/master/uruguay.json
// Update Ranking Panel
function updateRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    // Convert to array, filter > 0, sort desc
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

// Update Demographics Panel
function updateDemographics() {
    const menEl = document.getElementById('count-men');
    const womenEl = document.getElementById('count-women');
    const minorsEl = document.getElementById('count-minors');

    if (menEl) menEl.innerText = demoData.men || 0;
    if (womenEl) womenEl.innerText = demoData.women || 0;
    if (minorsEl) minorsEl.innerText = demoData.minors || 0;
}

// Fetch TopoJSON
const DATA_URL = 'https://raw.githubusercontent.com/alotropico/uruguay.geo/master/uruguay.json';

fetch(DATA_URL)
    .then(response => response.json())
    .then(topology => {
        const geojson = topojson.feature(topology, topology.objects.uruguay);

        geoJsonLayer = L.geoJson(geojson, {
            style: getStyle,
            onEachFeature: onEachFeature
        }).addTo(map);

        geojson.features.forEach(f => {
            const name = f.properties.NAME_1;
            if (crimeData[name] === undefined) {
                crimeData[name] = 0;
            }
        });
        localStorage.setItem('uruguayCrimeData', JSON.stringify(crimeData));
        updateHUD();
        updateRanking();
        updateDemographics();
    })
    .catch(err => {
        console.error("Error loading map data:", err);
        document.getElementById('map').innerHTML = "<div style='color:white; padding:2rem; text-align:center'>Error cargando el mapa. Verifica tu conexión.</div>";
    });

// Listen for storage changes
window.addEventListener('storage', (e) => {
    if (e.key === 'uruguayCrimeData') {
        crimeData = JSON.parse(e.newValue);
        if (geoJsonLayer) {
            geoJsonLayer.eachLayer((layer) => {
                layer.setStyle(getStyle(layer.feature));
            });
        }
        updateHUD();
        updateRanking();
    }
    if (e.key === 'uruguayDemoData') {
        demoData = JSON.parse(e.newValue);
        updateDemographics();
    }
});

// Listen for storage changes (Sync with Admin Panel)
window.addEventListener('storage', (e) => {
    if (e.key === 'uruguayCrimeData') {
        crimeData = JSON.parse(e.newValue);
        if (geoJsonLayer) {
            geoJsonLayer.setStyle(getStyle);
        }
        updateHUD();
    }
});
