const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// KONFIGURASI PTERODACTYL ANDA
const PTERO_CONFIG = {
    domain: 'https://panel.domainanda.com', // Ganti dengan domain panel Anda
    apiKey: 'ptla_XXXXXXXXXXXXXX'           // Ganti dengan Application API Key Anda
};

const pteroClient = axios.create({
    baseURL: PTERO_CONFIG.domain,
    headers: {
        'Authorization': `Bearer ${PTERO_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json',
    }
});

// API: Ambil Daftar Node dari Pterodactyl
app.get('/api/nodes', async (req, res) => {
    try {
        const response = await pteroClient.get('/api/application/nodes');
        // Kita petakan agar sesuai dengan format frontend kita
        const nodes = response.data.data.map(n => ({
            id: n.attributes.id,
            name: n.attributes.name,
            ip: n.attributes.fqdn,
            status: n.attributes.maintenance_mode ? 'Maintenance' : 'Online'
        }));
        res.json(nodes);
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
