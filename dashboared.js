import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";


// 🔥 CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyBVgzkGtL0fZ9HogTXrsFuUg0QGS-XZUT8",
    authDomain: "taj-loyality.firebaseapp.com",
    projectId: "taj-loyality",
    storageBucket: "taj-loyality.appspot.com",
    messagingSenderId: "23994370093",
    appId: "1:23994370093:web:d11393abd2768513e490a4"
};


// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// 🎯 TARGET
function getTarget(plan) {
    switch (plan) {
        case "silver": return 25;
        case "gold": return 50;
        case "platinum": return 100;
        default: return 25;
    }
}


// 🎨 UI RENDER (YOUR DESIGN)
function renderBranchCard(branch, fuel, target, bars = []) {
function getBarColor(plan) {
    switch (plan) {
        case "silver": return "#c0c0c0";   // silver
        case "gold": return "#f5d37a";     // light gold
        case "platinum": return "#a9e9e9"; // your platinum color
        default: return "#c0c0c0";
    }
}
    fuel = Number(fuel) || 0;
    target = Number(target) || 1;

    let percent = (fuel / target) * 100;
    percent = Math.min(percent, 100);

return `
    <div class="card">
        <h2>Your Reward Progress</h2>
        <h3>Taj ${branch}</h3>

        <div class="progress">

            ${(bars || []).map(plan => {

                const planTarget = getTarget(plan);

                const percent = Math.min((fuel / planTarget) * 100, 100);
                const remaining = Math.max(planTarget - fuel, 0);

                return `
                    <div style="margin-bottom:10px;">

                      

 <div style="margin-bottom:10px;">

        

        <div class="ProgressBar">
            <div class="colourArea"
                 style="width:${percent}%;
                        background:${getBarColor(plan)};">
            </div>
        </div>

        <small>
            ${percent.toFixed(1)}% completed | Remaining: ${(planTarget - fuel).toFixed(2)}L
        </small>

    </div>

                    </div>
                `;
            }).join("")}

        </div>

        <div style="display:flex;justify-content:space-between;margin-top:15px;">
            <span>Total Fuel</span>
            <span>${fuel.toFixed(2)}L</span>
        </div>
    </div>
`;
}


// 🚀 MAIN DASHBOARD
(async () => {

    const container = document.getElementById("cardsContainer");
    if (!container) return;

    container.innerHTML = "<p>Loading dashboard...</p>";

    await setPersistence(auth, browserLocalPersistence);

   onAuthStateChanged(auth, async (user) => {

    if (!user) {
        container.innerHTML = "<p>Please login first</p>";
        return;
    }

    const q = query(
        collection(db, "loyalty_progress"),
        where("userId", "==", user.uid)
    );

    let snap;

    try {
        snap = await getDocs(q);
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading data</p>";
        return;
    }

    if (snap.empty) {
        container.innerHTML = "<p>No progress found</p>";
        return;
    }

    const branchMap = {};
    const history = []; // ✅ MOVE HERE (IMPORTANT FIX)

    snap.forEach(doc => {
        const data = doc.data();

        const branch = data.branch || "Unknown";
        const fuel = Number(data.meter) || 0;

        history.push({
            branch,
            stamp: fuel
        });

        if (!branchMap[branch]) {
            branchMap[branch] = {
                fuel: 0,
                plan: data.plan || "silver",
                bars: []
            };
        }

        if (!branchMap[branch].bars.includes(data.plan || "silver")) {
            branchMap[branch].bars.push(data.plan || "silver");
        }

        branchMap[branch].fuel += fuel;
    });

    history.reverse();

    let html = "";
    let html1 = "";

    Object.keys(branchMap).forEach(branch => {
        const data = branchMap[branch];
        const target = getTarget(data.plan);

        html += renderBranchCard(
            branch,
            data.fuel,
            target,
            data.bars
        );
    });

    // ✅ RECENT ACTIVITY (NOW SAFE)
    html1 += `
        <div class="activity">
            <h3>Recent Activity</h3>

            ${history.slice(0, 3).map(item => `
                <div class="item">
                    <span>${item.branch}</span>
                    <span style="color:green;">+${item.stamp}L</span>
                </div>
            `).join("")}

        </div>
    `;
const recentHistory = document.getElementById("histroy")
recentHistory.innerHTML = html1;
    container.innerHTML = html;
});

})();



// const history = [];

// snap.forEach(doc => {
//     const data = doc.data();

//     history.push({
//         branch: data.branch || "Unknown",
//         stamp: Number(data.meter) || 0
//     });
// });

// history.reverse();

// const recentActivityHTML = `
//     <div class="activity">
//         <h3>Recent Activity</h3>

//         ${history.slice(0, 3).map(item => `
//             <div class="item">
//                 <span>${item.branch}</span>
//                 <span>+1 Stamp</span>
//             </div>
//         `).join("")}

//     </div>
// `;
// const recentHistory = document.getElementById("histroy")
// recentHistory.innerHTML += recentActivityHTML;