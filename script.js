import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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


// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBVgzkGtL0fZ9HogTXrsFuUg0QGS-XZUT8",
  authDomain: "taj-loyality.firebaseapp.com",
  projectId: "taj-loyality",
  storageBucket: "taj-loyality.appspot.com",
  messagingSenderId: "23994370093",
  appId: "1:23994370093:web:d11393abd2768513e490a4"
};


// INIT (ONLY ONCE)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;


//
// ✅ LOGIN (REDIRECT ONLY)
//
window.login = function () {
  signInWithRedirect(auth, provider);
};


//
// ✅ HANDLE REDIRECT RESULT
//
getRedirectResult(auth)
  .then((result) => {
    if (result && result.user) {
      console.log("Login success:", result.user);
    }
  })
  .catch((err) => {
    console.error("Redirect error:", err.message);
  });


//
// ✅ AUTH STATE
//
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    localStorage.setItem("userName", user.displayName);

    if (
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/"
    ) {
      window.location.href = "dashboard.html";
      return;
    }

    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
      userNameEl.innerText = "Hi, " + user.displayName + " 👋";
    }

    await loadUser();
  } else {
    if (window.location.pathname.includes("dashboard.html")) {
      window.location.href = "index.html";
    }
  }
});


//
// ✅ LOAD USER
//
async function loadUser() {
  try {
    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        stamps: 0,
        lastStamp: 0
      });
    }

    updateUI();
  } catch (err) {
    console.error("Load error:", err.message);
  }
}


//
// ✅ UPDATE UI
//
async function updateUI() {
  try {
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

    const progressEl = document.getElementById("progress");
    const countEl = document.getElementById("count");

    if (progressEl) progressEl.innerHTML = bar;
    if (countEl) countEl.innerText = `${stamps}/6 Stamps`;

    if (stamps >= 6) {
      const code = generateCode();

      const rewardEl = document.getElementById("reward");
      if (rewardEl) rewardEl.innerText = "Reward Code: " + code;

      await updateDoc(ref, { stamps: 0 });
    }
  } catch (err) {
    console.error("UI error:", err.message);
  }
}


//
// ✅ ADD STAMP
//
window.addStamp = async function () {
  try {
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
  } catch (err) {
    console.error("Stamp error:", err.message);
  }
};


//
// ✅ LOGOUT
//
window.logout = async function () {
  await signOut(auth);
};


//
// ✅ CODE GENERATOR
//
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}
