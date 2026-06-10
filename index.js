// import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// async function updateBranchProgress(branch, silver, gold, platinum) {

//     await setDoc(doc(db, "branches", branch), {
//         branch: branch,
//         silver: silver,
//         gold: gold,
//         platinum: platinum,
//         emailSent: false   // only first time
//     }, { merge: true });

// }
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const nodemailer = require("nodemailer");

// admin.initializeApp();

// exports.sendRewardEmail = functions.firestore
//   .document("branches/{branchId}")
//   .onUpdate(async (change, context) => {

//     const before = change.before.data();
//     const after = change.after.data();

//     const silver = after.silver || 0;
//     const gold = after.gold || 0;
//     const platinum = after.platinum || 0;

//     // 🎯 TARGET CONDITION
//     const allDone =
//       silver >= 5 &&
//       gold >= 1 &&
//       platinum >= 1;

//     // ✅ CHECK PREVIOUS STATE (VERY IMPORTANT)
//     const wasDoneBefore =
//       (before.silver >= 5 &&
//        before.gold >= 1 &&
//        before.platinum >= 1);

//     // ❌ STOP IF:
//     // - not completed
//     // - already completed before
//     // - email already sent
//     if (!allDone || wasDoneBefore || after.emailSent === true) {
//       return null;
//     }

//     // =========================
//     // BREVO SMTP
//     // =========================
//     const transporter = nodemailer.createTransport({
//       host: "smtp-relay.brevo.com",
//       port: 587,
//       auth: {
//         user: functions.config().brevo.user,
//         pass: functions.config().brevo.key
//       }
//     });

//     const mailOptions = {
//       from: "TAJ SYSTEM <no-reply@taj.com>",
//       to: "hammadazizkhan50@gmail.com",
//       subject: `🎉 Target Achieved - ${after.branch}`,
//       html: `
//         <h2>🎉 Reward Completed</h2>
//         <p><b>Branch:</b> ${after.branch}</p>

//         <p>Silver: ${silver}</p>
//         <p>Gold: ${gold}</p>
//         <p>Platinum: ${platinum}</p>

//         <hr>
//         <p>Status: Reward Unlocked ✅</p>
//       `
//     };

//     try {
//       await transporter.sendMail(mailOptions);

//       // ✅ MARK EMAIL SENT
//       await change.after.ref.update({
//         emailSent: true
//       });

//       console.log("✅ Email Sent");

//     } catch (err) {
//       console.error("❌ Email Error:", err);
//     }

//     return null;
//   });