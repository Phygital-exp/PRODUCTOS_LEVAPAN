// ---------------------------------------
// Variables

const CONFIG = {
    // Títulos
    TAB_TITLE: 'Buscador Levapan',
    HEADER_TITLE: 'Búsqueda Productos Levapan',

    // Textos
    PLACEHOLDER_LOADING: 'Cargando productos...',
    PLACEHOLDER_READY: 'Ingresa SAP, EAN o nombre del producto',

    // Railway
    DATA_URL: 'https://productoslevapan-production.up.railway.app/api/levapan/productos',

    // Endpoint directo (referencia):
    // DIRECT_URL: 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/productos_tickets_levapan',

    // Columnas buscador
    SEARCH_KEYS: [
        'SAP',
        'Codigo EAN/UPC',
        'Producto',
        'Marca',
        'Nombre Linea',
        'Nombre Grupo',
        'Nombre SubGrupo'
    ],
};
// ---------------------------------------

let debounceTimer;
let fuse = null;
let allData = [];

document.title = CONFIG.TAB_TITLE;
const titleEl = document.getElementById('searchTitle');
if (titleEl) titleEl.textContent = CONFIG.HEADER_TITLE;
const inputEl = document.getElementById('searchInput');
if (inputEl) inputEl.placeholder = CONFIG.PLACEHOLDER_LOADING;

async function loadData() {
    try {
        if (!allData.length) {
            const response = await fetch(CONFIG.DATA_URL);
            const json = await response.json();
            allData = json.result || [];
            initializeFuse();

            const searchInput = document.getElementById('searchInput');
            searchInput.disabled = false;
            searchInput.placeholder = CONFIG.PLACEHOLDER_READY;
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
        document.getElementById('searchInput').placeholder = 'No disponible';
        document.getElementById('results').innerHTML = `
            <p style="color:red;"> No se pudo cargar la información.
            Es posible que los permisos de CORS o el servidor estén bloqueando la conexión.</p>`;
    }
}

function initializeFuse() {
    const options = {
        keys: CONFIG.SEARCH_KEYS,
        threshold: 0.3,
    };
    fuse = new Fuse(allData, options);
}

function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        if (searchInput.trim()) {
            performSearch(searchInput);
        } else {
            document.getElementById('results').innerHTML = '';
        }
    }, 300);
}

function performSearch(query) {
    if (!fuse) return;
    const results = fuse.search(query).map(result => result.item);
    renderResults(results);
}

function renderResults(results) {
    let output = `<h2>Resultados (${results.length} encontrados):</h2>`;

    if (results.length > 0) {
        results.forEach(result => {
            const nombre = result.Producto || result['NOMBRE PROD'] || 'Sin nombre';
            const marca = result.Marca || '';
            const linea = result['Nombre Linea'] || '';
            const grupo = result['Nombre Grupo'] || '';
            const ean = result['Codigo EAN/UPC'] ?? result.EAN ?? 'N/A';

            output += `
                <div class="result-item producto" role="region" aria-label="${nombre}">
                    <h3>
                        <i class="material-icons icon-tipo">inventory_2</i>
                        ${nombre}
                    </h3>
                    <div class="tags">
                        ${marca ? `<span class="tag">${marca}</span>` : ''}
                        ${linea ? `<span class="tag">${linea}</span>` : ''}
                        ${grupo ? `<span class="tag">${grupo}</span>` : ''}
                    </div>
                    <ul>
                        <li><strong>SAP:</strong> ${result.SAP ?? 'N/A'}
                            <i class="material-icons copy-icon" role="button" tabindex="0" aria-label="Copiar SAP" onclick="copyToClipboard('${result.SAP}', 'SAP')">content_copy</i>
                        </li>
                        <li><strong>EAN / UPC:</strong> ${ean}
                            <i class="material-icons copy-icon" role="button" tabindex="0" aria-label="Copiar EAN" onclick="copyToClipboard('${ean}', 'EAN')">content_copy</i>
                        </li>
                        <li><strong>Línea:</strong> ${linea || 'N/A'}</li>
                        <li><strong>Grupo / Subgrupo:</strong> ${grupo || 'N/A'} - ${result['Nombre SubGrupo'] || 'N/A'}</li>
                    </ul>
                </div>
            `;
        });
    } else {
        output += '<p>No se encontraron resultados.</p>';
    }

    document.getElementById('results').innerHTML = output;
}

function copyToClipboard(text, label = 'Código') {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert(`${label} copiado al portapapeles`);
        })
        .catch(err => {
            alert(`Error al copiar el ${label}`);
            console.error('Error:', err);
        });
}

function toggleDarkMode() {
    const isDark = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

window.onload = () => {
    const darkModeSetting = localStorage.getItem('darkMode');
    const isDark = darkModeSetting === 'enabled';
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeToggle').checked = isDark;
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
};

loadData();
