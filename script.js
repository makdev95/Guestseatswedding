// Hardcoded admin credentials (change before deployment!)
const ADMIN_CREDENTIALS = {
    email: 'makdev47@gmail.com',
    password: 'sara95'
};

// Hardcoded trivia questions (customize as needed)
const triviaQuestions = [
    {
        question: "Sarah et Devilliers ont combien d'enfants🤩 ?",
        options: ["10", "3", "0", "1"],
        answer: 3 // Index of correct answer (0-based)
    },
    {
        question: "Qui est le plus tetu(e) 🤦‍♂️ ?",
        options: ["Sarah", "Devilliers", "Les deux"],
        answer: 1
    },
    {
        question: "Qui est le plus gourmand (e) 🤣 ?",
        options: ["Devilliers", "Sarah", "Les deux", "Personne"],
        answer: 3
    },
    {
        question: "Depuis combien d'années sont-ils ensemble 😊?",
        options: ["2", "4", "5", "7"],
        answer: 2
    },
    {
        question: "Comment s'appelle leur premiere fille 😁?",
        options: ["Dev Kimya", "Kimya", "Mak Dev", "Dev"],
        answer: 0
    }
];

// Generate unique ID by encoding name|table in base64
function generateId(name, table) {
    const combined = name + '|' + table;
    return btoa(combined);
}

// Guest View Logic: Decode the ID to get name and table directly
const urlParams = new URLSearchParams(window.location.search);
const guestId = urlParams.get('id');
if (guestId) {
    const tableInfo = document.getElementById('table-info');
    try {
        const decoded = atob(guestId);
        const [name, table] = decoded.split('|');
        if (name && table) {
            tableInfo.innerHTML = '<p>Hello, ' + name + '!</p><p>Vous êtes assis(e) à la: <strong>' + table + '</strong></p>';
            document.getElementById('game-section').style.display = 'block'; // Show game after table info
        } else {
            tableInfo.innerHTML = 'Invité introuvable. Veuillez vérifier votre lien.';
        }
    } catch (e) {
        tableInfo.innerHTML = 'Invité introuvable. Veuillez vérifier votre lien.';
    }
} else {
    document.getElementById('table-info').innerHTML = 'Bienvenue ! Veuillez utiliser votre lien unique.';
}

// Trivia Game Logic
let currentQuestion = 0;
let score = 0;

function startGame() {
    currentQuestion = 0;
    score = 0;
    showQuestion();
}

function showQuestion() {
    const quizDiv = document.getElementById('quiz');
    const scoreDiv = document.getElementById('score');
    scoreDiv.innerHTML = '';
    if (currentQuestion < triviaQuestions.length) {
        const q = triviaQuestions[currentQuestion];
        quizDiv.innerHTML = '<p>' + q.question + '</p>';
        q.options.forEach(function(option, index) {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.onclick = function() { checkAnswer(index); };
            quizDiv.appendChild(btn);
        });
    } else {
        quizDiv.innerHTML = '';
        scoreDiv.innerHTML = 'Voici ton score et profite de la soirée : ' + score + '/' + triviaQuestions.length;
    }
}

function checkAnswer(selected) {
    const q = triviaQuestions[currentQuestion];
    if (selected === q.answer) {
        score++;
        alert('Mmm tu nous connais hein 🤣!');
    } else {
        alert('Haha faux ! La bonne réponse est ' + q.options[q.answer]);
    }
    currentQuestion++;
    showQuestion();
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
            '<a href="' + window.location.origin + '/?id=' + id + '" target="_blank">Share Link</a>' +
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
window.startGame = startGame;



