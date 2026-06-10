
// FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBVgzkGtL0F9HogTXrsFuUg0QGS-XZUT8",
  authDomain: "taj-loyality.firebaseapp.com",
  projectId: "taj-loyality",
  storageBucket: "taj-loyality.appspot.com",
  messagingSenderId: "23994370093",
  appId: "1:23994370093:web:d11393abd2768513e490a4"
};


// INIT FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ELEMENTS
const branchSelect = document.getElementById("branchSelect");
const loginBtn = document.getElementById("adminLoginBtn");
const passwordInput = document.getElementById("adminPassword");
const loginMsg = document.getElementById("loginMsg");
const loader = document.getElementById("pageLoader");


// STORE PASSWORDS
let branchPasswords = {};


// LOAD BRANCHES
async function loadBranches() {

  branchSelect.innerHTML = `<option value="">Select Branch</option>`;

  const querySnapshot = await getDocs(collection(db, "branches"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    const branchName = data.branch.trim();
    const password = data.password.trim();

    branchPasswords[branchName] = password;

    const option = document.createElement("option");
    option.value = branchName;
    option.textContent = branchName;

    branchSelect.appendChild(option);
  });
}

loadBranches();


// LOGIN CLICK
loginBtn.addEventListener("click", () => {

  const selectedBranch = branchSelect.value.trim();
  const enteredPassword = passwordInput.value.trim();

  // EMPTY CHECK
  if (!selectedBranch || !enteredPassword) {
    loginMsg.style.color = "red";
    loginMsg.innerText = "Fill all fields";
    return;
  }

  // VERIFY PASSWORD
  if (branchPasswords[selectedBranch] === enteredPassword) {

    // DISABLE BUTTON
    loginBtn.disabled = true;

    // SHOW LOADER (IMPORTANT FIX)
    if (loader) loader.classList.add("active");

    // STATUS TEXTa
    loginMsg.style.color = "#2f6b1f";
    loginMsg.innerText = "Logging in...";

    // SAVE DATA
    localStorage.setItem("adminBranch", selectedBranch);
    localStorage.setItem("adminPassword", enteredPassword);

    // REDIRECT
    setTimeout(() => {
      window.location.href = "admin-dashboard.html";
    }, 1800);

  } else {

    // WRONG PASSWORD
    loginMsg.style.color = "red";
    loginMsg.innerText = "Wrong Password";

    // HIDE LOADER
    if (loader) loader.classList.remove("active");
  }

});