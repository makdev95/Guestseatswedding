// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

const firebaseConfig = {
    // REPLACE WITH YOUR FIREBASE CONFIG HERE
    apiKey: "AIzaSyDQkrNxF0szmPs1_gHBG8_mSGEz8YYTZyQ",
    authDomain: "wedding-seating-1b780.firebaseapp.com",
    projectId: "wedding-seating-1b780",
    storageBucket: "wedding-seating-1b780.firebasestorage.app",
    messagingSenderId: "289305825351",
    appId: "1:289305825351:web:664cc0e94c4bbdb0fce162",
    measurementId: "G-C5CHGR12KR"
};

  // Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);
const auth = firebase.auth(app);
const analytics = getAnalytics(app);

// Guest View Logic
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');
    if (guestId) {
        db.collection('guests').doc(guestId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('table-info').innerHTML = `
                    <p>Hello, ${data.name}!</p>
                    <p>You are seated at: <strong>${data.table}</strong></p>
                `;
            } else {
                document.getElementById('table-info').innerHTML = 'Guest not found.';
            }
        }).catch(error => {
            console.error('Error fetching guest:', error);
        });
    } else {
        document.getElementById('table-info').innerHTML = 'Please access via your unique link.';
    }
}

// Admin Logic
if (window.location.pathname.includes('admin.html')) {
    function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.signInWithEmailAndPassword(email, password).then(user => {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            loadGuests();
        }).catch(error => {
            alert('Login failed: ' + error.message);
        });
    }

    function logout() {
        auth.signOut().then(() => {
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('admin-content').style.display = 'none';
        });
    }

    function addGuest() {
        const name = document.getElementById('guest-name').value;
        const table = document.getElementById('table-title').value;
        if (name && table) {
            db.collection('guests').add({
                name: name,
                table: table
            }).then(docRef => {
                alert('Guest added with ID: ' + docRef.id);
                loadGuests();
            }).catch(error => {
                console.error('Error adding guest:', error);
            });
        }
    }

    function loadGuests() {
        const guestList = document.getElementById('guest-list');
        guestList.innerHTML = '';
        db.collection('guests').get().then(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                    ${data.name} - ${data.table}
                    <button onclick="editGuest('${doc.id}', '${data.table}')">Edit Table</button>
                    <button onclick="deleteGuest('${doc.id}')">Delete</button>
                    <div class="qr-code" id="qr-${doc.id}"></div>
                `;
                guestList.appendChild(li);

                // Generate QR
                const qrUrl = ${window.location.origin}/?id=${doc.id};
                new QRCode(document.getElementById(qr-${doc.id}), {
                    text: qrUrl,
                    width: 100,
                    height: 100
                });
            });
        });
    }

    window.editGuest = function(id, currentTable) {
        const newTable = prompt('Edit Table:', currentTable);
        if (newTable) {
            db.collection('guests').doc(id).update({ table: newTable }).then(() => {
                loadGuests();
            });
        }
    }

    window.deleteGuest = function(id) {
        if (confirm('Delete guest?')) {
            db.collection('guests').doc(id).delete().then(() => {
                loadGuests();
            });
        }
    }

    window.login = login;
    window.logout = logout;
    window.addGuest = addGuest;

    // Auto-load if already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            loadGuests();
        }
    });

}

