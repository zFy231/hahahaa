// --- DATABASE SIMULASI ---
let database = {
    // Struktur: { "username": { target: {nama, nominal}, transactions: [] } }
    users: {
        "Budi": {
            target: { nama: "Beli Sepatu", nominal: 1000000 },
            transactions: [
                { type: 'Masuk', amount: 2000000, desc: 'Gaji Pokok', date: '18/12/2025' },
                { type: 'Keluar', amount: 500000, desc: 'Belanja Bulanan', date: '18/12/2025' }
            ]
        }
    }
};

let currentUser = null;

// --- FUNGSI AUTH ---
function login() {
    const userVal = document.getElementById('login-username').value.trim();
    if (!userVal) return alert("Isi username!");

    currentUser = {
        name: userVal,
        role: userVal.toLowerCase() === 'admin' ? 'admin' : 'user'
    };

    // Inisialisasi data jika user baru
    if (currentUser.role === 'user' && !database.users[currentUser.name]) {
        database.users[currentUser.name] = { target: null, transactions: [] };
    }

    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('display-name').innerText = currentUser.name;

    renderSidebar();
    showPage('dashboard');
}

function logout() {
    currentUser = null;
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
}

// --- RENDER MENU ---
function renderSidebar() {
    const menu = document.getElementById('sidebar-menu');
    if (currentUser.role === 'admin') {
        menu.innerHTML = `
            <button onclick="showPage('admin-monitor')" class="nav-link"><i class="fas fa-users-cog mr-3"></i> Monitor Semua User</button>
        `;
    } else {
        menu.innerHTML = `
            <button onclick="showPage('dashboard')" class="nav-link"><i class="fas fa-home mr-3"></i> Dashboard</button>
            <button onclick="showPage('pemasukan')" class="nav-link"><i class="fas fa-plus-circle mr-3"></i> Pemasukan</button>
            <button onclick="showPage('pengeluaran')" class="nav-link"><i class="fas fa-minus-circle mr-3"></i> Pengeluaran</button>
            <button onclick="showPage('target')" class="nav-link"><i class="fas fa-bullseye mr-3"></i> Atur Target</button>
            <button onclick="showPage('laporan')" class="nav-link"><i class="fas fa-file-invoice-dollar mr-3"></i> Laporan Saya</button>
        `;
    }
}

// --- LOGIKA HALAMAN ---
function showPage(page, viewUser = null) {
    const display = document.getElementById('content-display');
    const title = document.getElementById('page-title');
    const targetName = viewUser || currentUser.name;
    const userData = database.users[targetName];

    title.innerText = (viewUser ? `Memantau: ${viewUser}` : page).toUpperCase();
    let html = '';

    // Hitung Saldo
    const totalMasuk = userData?.transactions.filter(t => t.type === 'Masuk').reduce((a, b) => a + b.amount, 0) || 0;
    const totalKeluar = userData?.transactions.filter(t => t.type === 'Keluar').reduce((a, b) => a + b.amount, 0) || 0;
    const saldo = totalMasuk - totalKeluar;

    if (currentUser.role === 'admin' && page === 'admin-monitor') {
        // HALAMAN UTAMA ADMIN
        const userList = Object.keys(database.users);
        html = `
            <div class="bg-white p-6 rounded-xl shadow">
                <h3 class="font-bold mb-4">Daftar Aktivitas Keuangan User</h3>
                <div class="grid grid-cols-1 gap-4">
                    ${userList.map(u => `
                        <div class="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition">
                            <div>
                                <p class="font-bold text-lg">${u}</p>
                                <p class="text-sm text-gray-500">${database.users[u].transactions.length} Aktivitas Tercatat</p>
                            </div>
                            <button onclick="showPage('detail-admin', '${u}')" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">Lihat Detail Keuangan</button>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    } 
    else if (page === 'detail-admin' || (currentUser.role === 'user' && page === 'laporan')) {
        // HALAMAN LAPORAN (Bisa dilihat User sendiri atau Admin)
        html = `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-green-100 p-4 rounded-lg">
                        <p class="text-sm text-green-700">Total Pemasukan</p>
                        <p class="text-xl font-bold">Rp ${totalMasuk.toLocaleString()}</p>
                    </div>
                    <div class="bg-red-100 p-4 rounded-lg">
                        <p class="text-sm text-red-700">Total Pengeluaran</p>
                        <p class="text-xl font-bold">Rp ${totalKeluar.toLocaleString()}</p>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow border">
                    <h4 class="font-bold mb-3"><i class="fas fa-bullseye mr-2 text-purple-600"></i> Status Target</h4>
                    ${userData.target ? `
                        <div class="flex justify-between mb-1">
                            <span>${userData.target.nama}</span>
                            <span>${Math.min(Math.round((saldo/userData.target.nominal)*100), 100)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                            <div class="bg-purple-600 h-full" style="width: ${(saldo/userData.target.nominal)*100}%"></div>
                        </div>
                        <p class="text-xs mt-2 text-gray-500">Kekurangan: Rp ${Math.max(userData.target.nominal - saldo, 0).toLocaleString()}</p>
                    ` : '<p class="text-gray-400 italic text-sm">User belum mengatur target.</p>'}
                </div>

                <div class="bg-white rounded-xl shadow border overflow-hidden">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50">
                            <tr><th class="p-4">Tanggal</th><th class="p-4">Tipe</th><th class="p-4">Keterangan</th><th class="p-4">Nominal</th></tr>
                        </thead>
                        <tbody>
                            ${userData.transactions.map(t => `
                                <tr class="border-b">
                                    <td class="p-4">${t.date}</td>
                                    <td class="p-4 font-bold ${t.type === 'Masuk' ? 'text-green-600' : 'text-red-600'}">${t.type}</td>
                                    <td class="p-4">${t.desc}</td>
                                    <td class="p-4">Rp ${t.amount.toLocaleString()}</td>
                                </tr>
                            `).reverse().join('')}
                        </tbody>
                    </table>
                </div>
                ${currentUser.role === 'admin' ? `<button onclick="showPage('admin-monitor')" class="text-purple-600 font-bold"><i class="fas fa-arrow-left mr-2"></i> Kembali ke Daftar User</button>` : ''}
            </div>`;
    }
    else {
        // HALAMAN INPUT USER (Pemasukan, Pengeluaran, Target)
        // ... (Logika input sama seperti sebelumnya)
        if(page === 'pemasukan' || page === 'pengeluaran') {
            html = `
                <div class="bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <h3 class="font-bold text-xl mb-4 text-${page === 'pemasukan' ? 'green' : 'red'}-600">Input ${page}</h3>
                    <input type="number" id="amt" class="input-field" placeholder="Nominal Rp">
                    <input type="text" id="desc" class="input-field" placeholder="Keterangan (e.g. Beli Makan)">
                    <button onclick="saveData('${page === 'pemasukan' ? 'Masuk' : 'Keluar'}')" class="btn-primary">Simpan Data</button>
                </div>`;
        } else if(page === 'target') {
            const t = userData.target;
            html = `
                <div class="bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <h3 class="font-bold text-xl mb-4">Set Target Tabungan</h3>
                    <input type="text" id="t-name" class="input-field" placeholder="Nama Target" value="${t ? t.nama : ''}">
                    <input type="number" id="t-nominal" class="input-field" placeholder="Nominal Target Rp" value="${t ? t.nominal : ''}">
                    <button onclick="saveTarget()" class="btn-primary">Pasang Target</button>
                </div>`;
        } else if(page === 'dashboard') {
            html = `<div class="bg-white p-6 rounded-xl shadow border-l-4 border-purple-600">
                        <p class="text-gray-500">Saldo Anda</p>
                        <h3 class="text-3xl font-bold">Rp ${saldo.toLocaleString()}</h3>
                    </div>`;
        }
    }
    display.innerHTML = html;
}

// --- FUNGSI SAVE ---
function saveData(type) {
    const amount = parseInt(document.getElementById('amt').value);
    const desc = document.getElementById('desc').value;
    if (!amount || !desc) return alert("Isi lengkap!");

    database.users[currentUser.name].transactions.push({
        type, amount, desc, date: new Date().toLocaleDateString('id-ID')
    });
    alert("Berhasil!");
    showPage('laporan');
}

function saveTarget() {
    const nama = document.getElementById('t-name').value;
    const nominal = parseInt(document.getElementById('t-nominal').value);
    if (!nama || !nominal) return alert("Isi lengkap!");

    database.users[currentUser.name].target = { nama, nominal };
    alert("Target disimpan!");
    showPage('laporan');
}
