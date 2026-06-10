let currentStep = "QR";
// ✅ FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { saveLoyalty } from "./complitation-logic.js";
import {
    getAuth,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
                                                                                                                                                                                


import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// import {
// collection,
// addDoc,
// query,
// where,
// getDocs,
// updateDoc,
// deleteDoc,
// doc
// } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
// ✅ FIREBASE CONFIG (must be REAL)
const firebaseConfig = {
    apiKey: "AIzaSyBVgzkGtL0fZ9HogTXrsFuUg0QGS-XZUT8",
    authDomain: "taj-loyality.firebaseapp.com",
    projectId: "taj-loyality",
    storageBucket: "taj-loyality.appspot.com",
    messagingSenderId: "23994370093",
    appId: "1:23994370093:web:d11393abd2768513e490a4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("User ready:", user.email);
    } else {
        console.log("No user");
    }
});


// =======================
// 1. START SCANNER
// =======================
function startScanner() {
    const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 250
    });

    scanner.render(onScanSuccess);

    function onScanSuccess(decodedText) {
        if (currentStep === "QR") {

            localStorage.setItem("selectedBranch", decodedText);

            currentStep = "METER";



            scanner.clear();
            showMeterUI();
        }
    }
}


// =======================
// 2. METER UI
// =======================
function showMeterUI() {
    document.getElementById("box").innerHTML = `
    <div style="display: flex;    flex-direction: column;    align-items: center;">

    <div>

        <input type="file" id="meterPhoto" accept="image/*" capture="environment">

        <button id="readBtn">
            🔍 Read Meter
        </button>

        <p>Petrol In Liters Detected: <b id="detected">---</b></p>
    </div>
  <h1 style="text-aling=left;">Select Category</h1>
    <select id="plan">
        <option value="silver">Silver ~ 25 liters (Smart Watch) </option>
        <option value="gold">Gold ~ 50 liters (Mobile) </option>
        <option value="platinum">Platinum ~ 150 liters (Refrigerator) </option>
    </select>

    <br><br>

    <button id="saveBtn">
        💾 Save
    </button>
</div>`;

    document.getElementById("readBtn").addEventListener("click", readMeter);
    document.getElementById("saveBtn").addEventListener("click", saveData);
}


// =======================
// 3. BASE64 CONVERT
// =======================
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            resolve({
                data: reader.result.split(",")[1],
                mimeType: file.type
            });
        };

        reader.onerror = reject;
    });
}


// =======================
// 4. GEMINI OCR
// =======================
// async function readMeter() {
//     const file = document.getElementById("meterPhoto").files[0];
//     if (!file) return alert("Upload image first");

//     const statusEl = document.getElementById("detected");
//     statusEl.innerText = "Processing...";

//     try {
//         const imageData = await toBase64(file);

//         const apiKey = "AIzaSyAmakFBvwb9UamLGMRwCN8AQiWZ8UqLMew";

//         // const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
//         const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

//         const response = await fetch(url, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 contents: [{
//                     parts: [
//                         { text: "Extract ONLY the number from this meter image and this number is buyed petrol liter so very carefull give it perfect" },
//                         {
//                             inline_data: {
//                                 mime_type: imageData.mimeType,
//                                 data: imageData.data
//                             }
//                         }
//                     ]
//                 }]
//             })
//         });

//         const result = await response.json();

//         const text =
//             result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//         const meterValue = text.replace(/[^0-9.]/g, "");

//         if (meterValue) {
//             statusEl.innerText = meterValue;
//             localStorage.setItem("meterReading", meterValue);
//         } else {
//             statusEl.innerText = "Not found";
//         }

//     } catch (err) {
//         console.error(err);
//         statusEl.innerText = "Error";
//     }
// }




// =======================
// 4. READ METER (FIXED)
// =======================



async function readMeter() {
    const file = document.getElementById("meterPhoto").files[0];
    if (!file) return alert("Upload image first");

    const statusEl = document.getElementById("detected");
    statusEl.innerText = "Processing...";

    try {
        const imageData = await toBase64(file);

        const apiKey = "AIzaSyBSLcWsZKayKivnAci9ND0Hh5cp-7-GSU4";

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        // const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Extract ONLY the number from this meter image and this number is buyed petrol liter so very carefull give it perfect" },
                        {
                            inline_data: {
                                mime_type: imageData.mimeType,
                                data: imageData.data
                            }
                        }
                    ]
                }]
            })
        });

        const result = await response.json();

        const text =
            result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const meterValue = text.replace(/[^0-9.]/g, "");

        if (meterValue) {
            statusEl.innerText = meterValue;
            localStorage.setItem("meterReading", meterValue);
        } else {
            statusEl.innerText = "Not found";
        }

    } catch (err) {
        console.error(err);
        statusEl.innerText = "Error";
    }
}

/**
 * Helper: Load image from File / URL / element
 */
function loadImage(source) {
    return new Promise((resolve, reject) => {
        if (source instanceof HTMLImageElement) {
            resolve(source);
        } else {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;

            if (source instanceof File) {
                img.src = URL.createObjectURL(source);
            } else {
                img.src = source;
            }
        }
    });
}



function showLoader() {
    document.getElementById("pageLoader").classList.add("active");
}

function hideLoader() {
    document.getElementById("pageLoader").classList.remove("active");
}


// =======================
// 5. SAVE TO FIRESTORE
// =======================
// async function saveData() {

//     if (!currentUser) {
//         alert("User not ready yet");
//         return;
//     }

//     const branch = localStorage.getItem("selectedBranch");
//     const meter = localStorage.getItem("meterReading");
//     const plan = document.getElementById("plan").value;

//     if (!branch) return alert("No branch selected");
//     if (!meter) return alert("Scan meter first");

//     const liters = parseFloat(meter) * 0.1;
//  showLoader();
//     try {
//         await addDoc(collection(db, "loyalty_progress"), {
//             branch,
//             plan,
//             meter: parseFloat(meter),
//             liters,
//             time: new Date().toISOString(),

//             // ✅ USER DATA
//             userEmail: currentUser.email,
//             userName: currentUser.displayName || "User",
//             userId: currentUser.uid
//         });

//         alert("Saved successfully!");
//         window.location.href = "dhashboard.html";

//     } catch (e) {
//         console.error("Firestore error:", e);
//         // alert("Error saving data");
//         hideLoader()
//     }
// }
async function saveData() {

    if (!currentUser) return alert("User not ready");

    const branch = localStorage.getItem("selectedBranch");
    const meter = localStorage.getItem("meterReading");
    const plan = document.getElementById("plan").value;

    const result = await saveLoyalty(
        db,
        currentUser,
        branch,
        meter,
        plan,
        showLoader,
        hideLoader
    );

    console.log("Result:", result);

    if (result.status === "completed") {
        alert("🎉 Reward Completed!");
        window.location.href = "dhashboard.html";
    }

    if (result.status === "updated") {
        alert("Progress Updated!");
        window.location.href = "dhashboard.html";
    }

    if (result.status === "new") {
        alert("New Progress Started!");
    }
}

// =======================
// START
// =======================
startScanner()
console.log(currentUser);