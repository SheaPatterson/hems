const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Cache for live theater status
let activeFleet = new Map();

io.on('connection', (socket) => {
  console.log('[RECON] New connection established:', socket.id);

  // Pilot Telemetry Uplink
  socket.on('telemetry_push', (data) => {
    // Standardize data and broadcast to all observers (Instructors/Map)
    const packet = {
        ...data,
        vps_timestamp: Date.now(),
        latency: Date.now() - (data.timestamp || Date.now())
    };
    
    activeFleet.set(data.user_id, packet);
    socket.broadcast.emit('fleet_update', packet);
  });

  socket.on('disconnect', () => {
    console.log('[RECON] Connection lost:', socket.id);
  });
});

// REST API for large asset metadata
app.get('/health', (req, res) => {
  res.json({ status: 'nominal', fleet_count: activeFleet.size });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`[VPS] HEMS TACTICAL RELAY ACTIVE`);
  console.log(`[PORT] ${PORT}`);
  console.log(`[NODE] 4 vCore / 8GB RAM UTILIZED`);
  console.log(`========================================\n`);
});