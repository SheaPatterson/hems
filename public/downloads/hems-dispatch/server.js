const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;

// Azure API Management base URL — configurable via environment variable
const AZURE_API_BASE_URL = process.env.AZURE_API_BASE_URL || 'https://hems-apim.azure-api.net';

app.use(cors());
app.use(express.json());
// Use path.join(__dirname, 'ui') to correctly serve static files from the packaged location
app.use(express.static(path.join(__dirname, 'ui')));

let currentTelemetry = null;
let lastHeartbeat = 0;
let cloudReachable = false;

// Periodically check Azure API reachability (every 30s)
async function checkAzureReachability() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${AZURE_API_BASE_URL}/api/status`, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timeout);
        cloudReachable = res.ok;
    } catch {
        cloudReachable = false;
    }
}

// Initial check + interval
checkAzureReachability();
setInterval(checkAzureReachability, 30000);

// 1. RECEIVE TELEMETRY FROM SIMULATOR PLUGINS (X-Plane / MSFS)
app.post('/telemetry', (req, res) => {
    currentTelemetry = {
        ...req.body,
        timestamp: Date.now(),
    };
    lastHeartbeat = Date.now();
    res.status(200).send('OK');
});

// 2. STATUS ENDPOINT — reports sim + cloud connectivity
app.get('/api/status', (req, res) => {
    res.json({
        simConnected: (Date.now() - lastHeartbeat) < 5000,
        cloudConnected: cloudReachable,
        telemetry: currentTelemetry,
        missionState: null,
    });
});

// 3. TELEMETRY RELAY — forwards telemetry to Azure API Management
app.post('/api/telemetry-relay', async (req, res) => {
    const { apiKey, mission_id, ...telemetryData } = req.body;
    if (!apiKey || !mission_id) {
        return res.status(400).json({ error: 'API Key and Mission ID required.' });
    }

    try {
        const response = await fetch(`${AZURE_API_BASE_URL}/api/update-telemetry`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mission_id, ...telemetryData }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[RELAY] Telemetry relay failed: ${response.status}`, errorText);
            return res.status(response.status).send(errorText);
        }

        const responseText = await response.text();
        res.status(200).send(responseText);
    } catch (error) {
        console.error('[RELAY] Network error during telemetry relay:', error);
        res.status(500).send('Network error during telemetry relay.');
    }
});

// 4. CHAT RELAY — forwards crew messages to Azure dispatch agent
app.post('/api/chat-relay', async (req, res) => {
    const { apiKey, mission_id, crew_message } = req.body;
    if (!apiKey || !mission_id || !crew_message) {
        return res.status(400).json({ error: 'API Key, Mission ID, and Message required.' });
    }

    try {
        const response = await fetch(`${AZURE_API_BASE_URL}/api/dispatch-agent`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mission_id, crew_message }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[CHAT] Chat relay failed: ${response.status}`, errorData);
            return res.status(response.status).json({ error: errorData.error || 'Azure API Error' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('[CHAT] Network error during chat relay:', error);
        res.status(500).json({ error: 'Network error during chat relay.' });
    }
});

// 5. MISSION CONTEXT — fetches active missions from Azure
app.post('/api/mission-context', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ error: 'API Key required.' });
    }

    try {
        const response = await fetch(`${AZURE_API_BASE_URL}/api/active-missions`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[PROXY] Azure fetch error: ${response.status}`, errorData);
            return res.status(response.status).json({ error: errorData.error || 'Azure API Error' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('[PROXY] Network error fetching mission context:', error);
        res.status(500).json({ error: 'Network error or Azure API unreachable.' });
    }
});

app.listen(port, () => {
    // Send a message back to the Electron main process upon successful startup
    if (process.send) {
        process.send('Server started successfully on port 8080.');
    }
    console.log(`\n========================================`);
    console.log(`[SUCCESS] HEMS COMMAND CENTER IS ONLINE`);
    console.log(`[LOCAL] http://localhost:${port}`);
    console.log(`[UPLINK] Awaiting Simulator Data Link...`);
    console.log(`========================================\n`);
});
