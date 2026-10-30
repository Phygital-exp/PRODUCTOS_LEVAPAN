const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

// ---------------------------------------
// Variables

const CONFIG = {
    
    PROXY_ROUTE: "/api/levapan/productos",

    TARGET_API_URL: "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/productos_tickets_levapan",

    API_TOKEN: process.env.API_TOKEN || "9b7661d9292aab2c339b95bf251063791c2a62ff",
};
// ---------------------------------------

const PORT = process.env.PORT || 3000;

const AUTH_HEADERS = {
    Authorization: `Token ${CONFIG.API_TOKEN}`,
    "Content-Type": "application/json",
};

app.use(cors());

app.get(CONFIG.PROXY_ROUTE, async (req, res) => {
    try {
        const response = await fetch(
            CONFIG.TARGET_API_URL,
            { headers: AUTH_HEADERS }
        );

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Error HTTP ${response.status}:`, text);
            return res.status(response.status).json({ error: `Error ${response.status}: ${text.substring(0, 200)}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Error en el proxy:", err);
        res.status(500).json({ error: "Error al obtener datos de productos", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor proxy escuchando en http://localhost:${PORT}`);
});
