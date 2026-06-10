// ================= FIREBASE =================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBVgzkGtL0F9HogTXrsFuUg0QGS-XZUT8",
    authDomain: "taj-loyality.firebaseapp.com",
    projectId: "taj-loyality",
    storageBucket: "taj-loyality.appspot.com",
    messagingSenderId: "23994370093",
    appId: "1:23994370093:web:d11393abd2768513e490a4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= ELEMENTS =================

const usersContainer = document.getElementById("usersContainer");
const searchInput = document.getElementById("searchInput");
const branchNameEl = document.getElementById("branchName");

const selectedBranchRaw = localStorage.getItem("adminBranch") || "";
branchNameEl.innerText = selectedBranchRaw;

// ================= HELPERS =================

function normalizeBranch(value) {
    if (!value) return "";
    return value.toString().replace(/[^0-9]/g, "").trim();
}

// ================= DATA =================

let allUsers = [];

// ================= LOAD USERS =================

async function loadUsers() {

    usersContainer.innerHTML = `<div class="loading">Loading users...</div>`;

    const snapshot = await getDocs(collection(db, "loyalty_progress"));

    const localBranch = normalizeBranch(selectedBranchRaw);

    const userMap = {};

    snapshot.forEach(doc => {
        const data = doc.data();

        const firestoreBranch = normalizeBranch(data.branch);

        if (firestoreBranch !== localBranch) return;

        const userId = data.userId;

        if (!userMap[userId]) {
            userMap[userId] = {
                userId: userId,
                userName: data.userName,
                userEmail: data.userEmail,
                plan: data.plan,
                time: data.time,
                meter: 0
            };
        }

        // 🔥 SUM METER
        userMap[userId].meter += Number(data.meter || 0);
    });

    allUsers = Object.values(userMap);

    renderUsers(allUsers);
}

// ================= RENDER CARDS =================

function renderUsers(users) {

    if (!users.length) {
        usersContainer.innerHTML = `
            <div class="empty-state">
                <h2>No Users Found</h2>
                <p>No users available for this branch.</p>
            </div>
        `;
        return;
    }

    let html = `<div class="card-grid">`;

    users.forEach(user => {

        const plan = (user.plan || "no").toLowerCase();

        html += `
        <div class="user-card">

            <div class="user-header">
                <div class="avatar">
                    ${(user.userName || "U").charAt(0).toUpperCase()}
                </div>

                <div>
                    <h2>${user.userName || "-"}</h2>
                    <p class="email">${user.userEmail || "-"}</p>
                </div>
            </div>

            <div class="user-body">


                <div class="row">
                    <span>Total Liters</span>
                    <b class="meter">${user.meter.toFixed(2)} L</b>
                </div>

                <div class="row">
                    <span>Plan</span>
                    <b class="plan ${plan}">${user.plan || "No Plan"}</b>
                </div>

                <div class="row">
                    <span>Date</span>
                    <small>${user.time ? new Date(user.time).toLocaleString() : "-"}</small>
                </div>

            </div>

        </div>
        `;
    });

    html += `</div>`;

    usersContainer.innerHTML = html;
}

// ================= SEARCH =================

if (searchInput) {
    searchInput.addEventListener("input", (e) => {

        const value = e.target.value.toLowerCase();

        const filtered = allUsers.filter(user => {
            return (
                (user.userName || "").toLowerCase().includes(value) ||
                (user.userEmail || "").toLowerCase().includes(value)
            );
        });

        renderUsers(filtered);
    });
}

// ================= INIT =================

loadUsers();