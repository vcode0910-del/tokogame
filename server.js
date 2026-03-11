require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ptero = axios.create({
    baseURL: process.env.PTERO_DOMAIN,
    headers: {
        'Authorization': `Bearer ${process.env.PTERO_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json',
    }
});

// Ambil Daftar Server
app.get('/api/servers', async (req, res) => {
    try {
        const response = await ptero.get('/api/application/servers');
        const servers = response.data.data.map(s => ({
            id: s.attributes.id,
            uuid: s.attributes.identifier,
            name: s.attributes.name,
            status: 'Active',
            memory: s.attributes.limits.memory
        }));
        res.json(servers);
    } catch (err) {
        res.status(500).json({ error: "Gagal ambil data server" });
    }
});

// Ambil Daftar Node (IP Andreas)
app.get('/api/nodes', async (req, res) => {
    try {
        const response = await ptero.get('/api/application/nodes');
        const nodes = response.data.data.map(n => ({
            id: n.attributes.id,
            name: n.attributes.name,
            fqdn: n.attributes.fqdn,
            scheme: n.attributes.scheme
        }));
        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: "Gagal ambil data node" });
    }
});

// Create Server
app.post('/api/servers', async (req, res) => {
    try {
        const { name, memory } = req.body;
        const payload = {
            name: name,
            user: 1, // Default user ID 1
            egg: 1,  // Default egg ID 1
            docker_image: "ghcr.io/pterodactyl/yolks:java_17",
            startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
            limits: { memory: memory, swap: 0, disk: 1024, io: 500, cpu: 100 },
            feature_limits: { databases: 0, backups: 0 },
            allocation: { default: 1 } // Pastikan ID Allocation ini ada di Ptero
        };
        const response = await ptero.post('/api/application/servers', payload);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || "Gagal membuat server" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Andreas Panel running on http://localhost:${PORT}`));        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Ambil Daftar Server dari Pterodactyl
app.get('/api/servers', async (req, res) => {
    try {
        const response = await pteroClient.get('/api/application/servers');
        const servers = response.data.data.map(s => ({
            id: s.attributes.identifier,
            name: s.attributes.name,
            ip: s.attributes.uuid, // Ptero menggunakan UUID
            status: 'Active',
            node: s.attributes.node
        }));
        res.json(servers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Buat Server Baru di Pterodactyl
app.post('/api/servers', async (req, res) => {
    const { name, user_id, egg_id, location_id } = req.body;
    
    // Payload standar Pterodactyl untuk membuat server
    const payload = {
        name: name,
        user: user_id || 1, // ID User di panel Ptero
        egg: egg_id || 1,   // ID Egg (misal Minecraft/Nginx)
        docker_image: "ghcr.io/pterodactyl/yolks:java_17",
        startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
        limits: { memory: 1024, swap: 0, disk: 5120, io: 500, cpu: 100 },
        feature_limits: { databases: 0, backups: 1 },
        environment: { SERVER_JARFILE: "server.jar" },
        allocation: { default: 1 } // ID Allocation/IP yang tersedia
    };

    try {
        const response = await pteroClient.post('/api/application/servers', payload);
        res.json(response.data);
    } catch (err) {
        console.error(err.response.data);
        res.status(500).json({ error: "Gagal membuat server di Pterodactyl" });
    }
});

app.listen(3000, () => console.log('Andreas Panel Bridge running on port 3000'));
