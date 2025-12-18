// --- DATABASE SIMULASI ---
let currentUser = null;
let database = {
    transactions: [], // Format: { username, tipe, nominal, keterangan, tanggal }
    targets: {}       // Format: { username: { namaTarget, nominalTarget, terkumpul } }
};

// --- FUNGSI AUTH ---
function toggleAuth(type) {
    document.getElementById('login-form').classList.toggle('hidden', type === 'register');
    document.getElementById('register-form').classList.toggle('hidden', type === 'login');
}

function login() {
    const userVal = document.querySelector('#login-form input[type="text"]').value;
    if (!userVal) return alert("Isi username!");

    currentUser = {
        name: userVal,
        role: userVal.toLowerCase() === 'admin' ? 'admin' : 'user'
    };

    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    document.querySelector('main header b').innerText = currentUser.name;
    
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
            <button onclick="showPage('dashboard')" class="nav-link"><i class="fas fa-chart-line mr-3"></i> Ringkasan Global</button>
            <button onclick="showPage('admin-monitor')" class="nav-link"><i class="fas fa-users-cog mr-3"></i> Monitor User</button>
        `;
    } else {
        menu.innerHTML = `
            <button onclick="showPage('dashboard')" class="nav-link"><i class="fas fa-home mr-3"></i> Dashboard</button>
            <button onclick="showPage('pemasukan')" class="nav-link"><i class="fas fa-plus-circle mr-3"></i> Pemasukan</button>
            <button onclick="showPage('pengeluaran')" class="nav-link"><i class="fas fa-minus-circle mr-3"></i> Pengeluaran</button>
            <button onclick="showPage('target')" class="nav-link"><i class="fas fa-bullseye mr-3"></i> Atur Target</button>
            <button onclick="showPage('laporan')" class="nav-link"><i class="fas fa-file-alt mr-3"></i> Laporan Saya</button>
        `;
    }
}

// --- LOGIKA HALAMAN ---
function showPage(page, targetUser = null) {
    const display = document.getElementById('content-display');
    const title = document.getElementById('page-title');
    const userToView = targetUser || currentUser.name; // Jika admin klik user, tampilkan data user tersebut

    title.innerText = page.toUpperCase();
    let html = '';

    // Data Filtered
    const userTrans = database.transactions.filter(t => t.username === userToView);
    const userTarget = database.targets[userToView] || null;
    const totalMasuk = userTrans.filter(t => t.tipe === 'Masuk').reduce((a, b) => a + b.nominal, 0);
    const totalKeluar = userTrans.filter(t => t.tipe === 'Keluar').reduce((a, b) => a + b.nominal, 0);
    const saldo = totalMasuk - totalKeluar;

    switch(page) {
        case 'dashboard':
            html = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
                        <p class="text-gray-500">Saldo saat ini (${userToView})</p>
                        <h3 class="text-2xl font-bold">Rp ${saldo.toLocaleString()}</h3>
                    </div>
                </div>`;
            break;

        case 'pemasukan':
        case 'pengeluaran':
            const isMasuk = page === 'pemasukan';
            html = `
                <div class="bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <h3 class="font-bold text-xl mb-4 text-${isMasuk ? 'green' : 'red'}-600">Isi ${page}</h3>
                    <input type="number" id="form-nominal" class="input-field" placeholder="Nominal (Rp)">
                    <input type="text" id="form-ket" class="input-field" placeholder="Keterangan (Contoh: Gaji)">
                    <button onclick="saveTransaction('${isMasuk ? 'Masuk' : 'Keluar'}')" class="btn-primary ${isMasuk ? 'bg-green-600' : 'bg-red-600'}">Simpan Data</button>
                </div>`;
            break;

        case 'target':
            html = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-xl shadow">
                        <h3 class="font-bold mb-4">Set Target Baru</h3>
                        <input type="text" id="t-nama" class="input-field" placeholder="Nama Target (Contoh: Beli Sepatu)">
                        <input type="number" id="t-nominal" class="input-field" placeholder="Target Nominal (Rp)">
                        <button onclick="saveTarget()" class="btn-primary">Pasang Target</button>
                    </div>
                    <div class="bg-purple-50 p-6 rounded-xl border border-purple-200">
                        <h3 class="font-bold mb-4">Progres Target</h3>
                        ${userTarget ? `
                            <p class="font-bold text-purple-700">${userTarget.namaTarget}</p>
                            <div class="w-full bg-gray-200 h-4 rounded-full my-2">
                                <div class="bg-purple-600 h-4 rounded-full" style="width: ${Math.min((saldo/userTarget.nominalTarget)*100, 100)}%"></div>
                            </div>
                            <p class="text-sm">Terkumpul: Rp ${saldo.toLocaleString()} / Rp ${parseInt(userTarget.nominalTarget).toLocaleString()}</p>
                        ` : '<p class="text-gray-400 italic">Belum ada target.</p>'}
                    </div>
                </div>`;
            break;

        case 'laporan':
            html = `
                <div class="bg-white rounded-xl shadow overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-gray-100">
                            <tr><th class="p-4">Tanggal</th><th class="p-4">Tipe</th><th class="p-4">Ket</th><th class="p-4">Nominal</th></tr>
                        </thead>
                        <tbody>
                            ${userTrans.map(t => `
                                <tr class="border-b">
                                    <td class="p-4">${t.tanggal}</td>
                                    <td class="p-4 ${t.tipe === 'Masuk' ? 'text-green-600' : 'text-red-600'} font-bold">${t.tipe}</td>
                                    <td class="p-4">${t.keterangan}</td>
                                    <td class="p-4">Rp ${t.nominal.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                            ${userTrans.length === 0 ? '<tr><td colspan="4" class="p-10 text-center text-gray-400">Belum ada data. Silakan isi pemasukan/pengeluaran.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>`;
            break;

        case 'admin-monitor':
            // Cari semua user unik dari transaksi
            const allUsers = [...new Set(database.transactions.map(t => t.username))];
            html = `
                <div class="bg-white p-6 rounded-xl shadow">
                    <h3 class="font-bold mb-4">Daftar Aktivitas Keuangan User</h3>
                    <div class="grid grid-cols-1 gap-4">
                        ${allUsers.map(u => `
                            <div class="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <span class="font-bold text-lg">${u}</span>
                                    <p class="text-sm text-gray-500">Memiliki data transaksi</p>
                                </div>
                                <button onclick="showPage('laporan', '${u}')" class="text-blue-600 font-bold underline">Lihat Laporan User</button>
                            </div>
                        `).join('')}
                        ${allUsers.length === 0 ? '<p class="text-gray-400">Belum ada user yang mengisi data.</p>' : ''}
                    </div>
                </div>`;
            break;
    }
    display.innerHTML = html;
}

// --- FUNGSI SIMPAN DATA ---
function saveTransaction(tipe) {
    const nominal = document.getElementById('form-nominal').value;
    const ket = document.getElementById('form-ket').value;
    if (!nominal || !ket) return alert("Isi semua data!");

    database.transactions.push({
        username: currentUser.name,
        tipe: tipe,
        nominal: parseInt(nominal),
        keterangan: ket,
        tanggal: new Date().toLocaleDateString('id-ID')
    });

    alert("Data berhasil disimpan!");
    showPage('laporan');
}

function saveTarget() {
    const nama = document.getElementById('t-nama').value;
    const nominal = document.getElementById('t-nominal').value;
    if (!nama || !nominal) return alert("Isi target!");

    database.targets[currentUser.name] = {
        namaTarget: nama,
        nominalTarget: nominal
    };

    alert("Target dipasang!");
    showPage('target');
}