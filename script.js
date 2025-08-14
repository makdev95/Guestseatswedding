// Hardcoded admin credentials (change before deployment!)
const ADMIN_CREDENTIALS = {
    email: 'makdev47@gmail.com',
    password: 'M@kdev95'
};

// Generate unique ID from name+table
function generateId(name, table) {
    return btoa(name + table).slice(0, 10); // Simple base64 hash, truncated
}

// Guest View Logic
const urlParams = new URLSearchParams(window.location.search);
const guestId = urlParams.get('id');
if (guestId) {
    const guests = JSON.parse(localStorage.getItem('guests') || '[]');
    const guest = guests.find(function(g) { return generateId(g.name, g.table) === guestId; });
    const tableInfo = document.getElementById('table-info');
    if (guest) {
        tableInfo.innerHTML = '<p>Hello, ' + guest.name + '!</p><p>You are seated at: <strong>' + guest.table + '</strong></p>';
    } else {
        tableInfo.innerHTML = 'Guest not found. Please check your link.';
    }
} else {
    document.getElementById('table-info').innerHTML = 'Welcome! Please use your unique link.';
}

// Admin Modal Logic
function openAdminModal() {
    document.getElementById('admin-modal').style.display = 'block';
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

function adminLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        loadGuests();
    } else {
        alert('Invalid credentials. Try again.');
    }
}

function logout() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function loadCSV() {
    const csv = document.getElementById('csv-input').value;
    const guests = [];
    const lines = csv.split('\n').map(function(line) { return line.trim(); }).filter(function(line) { return line; });
    if (lines[0].toLowerCase().includes('name,table')) lines.shift(); // Skip header
    lines.forEach(function(line) {
        const parts = line.split(',').map(function(item) { return item.trim(); });
        const name = parts[0];
        const table = parts[1];
        if (name && table) {
            guests.push({ name: name, table: table });
        }
    });
    localStorage.setItem('guests', JSON.stringify(guests));
    loadGuests();
}

function loadGuests() {
    const guestList = document.getElementById('guest-list');
    guestList.innerHTML = '';
    const guests = JSON.parse(localStorage.getItem('guests') || '[]');
    guests.forEach(function(guest) {
        const id = generateId(guest.name, guest.table);
        const li = document.createElement('li');
        li.innerHTML = guest.name + ' - ' + guest.table +
            '<button onclick="deleteGuest(\'' + id + '\')">Delete</button>' +
            '<div class="qr-code" id="qr-' + id + '"></div>';
        guestList.appendChild(li);
        new QRCode(document.getElementById('qr-' + id), {
            text: window.location.origin + '/?id=' + id,
            width: 100,
            height: 100
        });
    });
}

function deleteGuest(id) {
    if (confirm('Delete guest?')) {
        let guests = JSON.parse(localStorage.getItem('guests') || '[]');
        guests = guests.filter(function(g) { return generateId(g.name, g.table) !== id; });
        localStorage.setItem('guests', JSON.stringify(guests));
        loadGuests();
    }
}

// Attach event listener for Admin button
document.addEventListener('DOMContentLoaded', function() {
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminModal);
    }
});

// Expose functions for other onclick handlers
window.closeAdminModal = closeAdminModal;
window.adminLogin = adminLogin;
window.logout = logout;
window.loadCSV = loadCSV;
window.deleteGuest = deleteGuest;