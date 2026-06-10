import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBVgzkGtL0fZ9HogTXrsFuUg0QGS-XZUT8",
  authDomain: "taj-loyality.firebaseapp.com",
  projectId: "taj-loyality",
  storageBucket: "taj-loyality.appspot.com",
  messagingSenderId: "23994370093",
  appId: "1:23994370093:web:d11393abd2768513e490a4"
};


// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;


//
// ✅ LOGIN (REDIRECT)
//
window.login = () => {
  signInWithRedirect(auth, provider);
};


//
// ✅ AUTH STATE + REDIRECT CONTROL
//
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;

  if (user) {
    currentUser = user;

    console.log("Logged in:", user.email);

    // 👉 If on login page → go to dashboard
    if (path.includes("index.html") || path === "/") {
      window.location.replace("dashboard.html");
      return;
    }

    // 👉 If on dashboard → load user data
    if (path.includes("dashboard.html")) {
      const userNameEl = document.getElementById("userName");
      if (userNameEl) {
        userNameEl.innerText = "Hi, " + user.displayName + " 👋";
      }

      await loadUser();
    }

  } else {
    console.log("Not logged in");

    // 👉 Block dashboard if not logged in
    if (path.includes("dashboard.html")) {
      window.location.replace("index.html");
    }
  }
});


//
// ✅ LOAD USER
//
async function loadUser() {
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      stamps: 0,
      lastStamp: 0
    });
  }

  updateUI();
}


//
// ✅ UPDATE UI
//
async function updateUI() {
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  const data = snap.data();

  const stamps = data.stamps || 0;

  let bar = "";
  for (let i = 0; i < 6; i++) {
    bar += `<span style="
      display:inline-block;
      width:20px;
      height:20px;
      border-radius:50%;
      margin:5px;
      background:${i < stamps ? "green" : "#ccc"}
    "></span>`;
  }

  document.getElementById("progress")?.innerHTML = bar;
  document.getElementById("count")?.innerText = `${stamps}/6 Stamps`;

  if (stamps >= 6) {
    const code = generateCode();
    document.getElementById("reward")?.innerText = "Reward Code: " + code;

    await updateDoc(ref, { stamps: 0 });
  }
}


//
// ✅ ADD STAMP
//
window.addStamp = async () => {
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  const data = snap.data();

  const now = Date.now();

  if (now - data.lastStamp < 86400000) {
    alert("Already claimed today!");
    return;
  }

  await updateDoc(ref, {
    stamps: (data.stamps || 0) + 1,
    lastStamp: now
  });

  updateUI();
};


//
// ✅ LOGOUT
//
window.logout = async () => {
  await signOut(auth);
  window.location.replace("index.html");
};


//
// ✅ GENERATE CODE
//
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}
