function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('section-' + id).classList.remove('hidden');
    document.getElementById('btn-' + id).classList.add('active');
    document.getElementById('page-title').innerText = id.charAt(0).toUpperCase() + id.slice(1);
    if(id === 'dashboard') fetchServers();
    if(id === 'nodes') fetchNodes();
}

async function fetchServers() {
    const list = document.getElementById('server-list');
    list.innerHTML = '<div class="text-blue-500 animate-pulse">Syncing with Pterodactyl...</div>';
    const res = await fetch('/api/servers');
    const data = await res.json();
    
    list.innerHTML = data.map(srv => `
        <div class="card-server">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3 bg-blue-600/20 rounded-lg text-blue-500">
                    <i class="fas fa-cube text-xl"></i>
                </div>
                <span class="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-md font-bold">RUNNING</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-1">${srv.name}</h3>
            <p class="text-xs text-gray-500 font-mono mb-4">${srv.uuid}</p>
            <div class="flex items-center text-xs text-gray-400">
                <i class="fas fa-memory mr-2"></i> ${srv.memory} MB
            </div>
        </div>
    `).join('');
}

async function fetchNodes() {
    const list = document.getElementById('node-list');
    const res = await fetch('/api/nodes');
    const data = await res.json();
    
    list.innerHTML = data.map(n => `
        <tr class="border-t border-gray-800 hover:bg-gray-800/30 transition">
            <td class="p-4 font-bold text-white">${n.name}</td>
            <td class="p-4 font-mono text-blue-400 text-sm">${n.scheme}://${n.fqdn}</td>
            <td class="p-4"><span class="text-green-500 text-xs">● Connected</span></td>
        </tr>
    `).join('');
}

function openModal() { document.getElementById('modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

async function handleSubmit() {
    const name = document.getElementById('srv-name').value;
    const memory = document.getElementById('srv-memory').value;

    const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, memory })
    });

    if(res.ok) {
        alert("Server created successfully!");
        closeModal();
        fetchServers();
    } else {
        alert("Failed to create server. Check backend console.");
    }
}

// Init
fetchServers();
