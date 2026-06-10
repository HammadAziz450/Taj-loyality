import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function saveLoyalty(
    db,
    currentUser,
    branch,
    meter,
    plan,
    showLoader,
    hideLoader
) {

    const newLiters = parseFloat(meter);

    const target =
        plan === "silver" ? 25 :
        plan === "gold" ? 50 : 150;

    showLoader();

    try {

        // 🔍 CHECK EXISTING PROGRESS
        const q = query(
            collection(db, "loyalty_progress"),
            where("userId", "==", currentUser.uid),
            where("branch", "==", branch),
            where("plan", "==", plan)
        );

        const snap = await getDocs(q);

        // =========================
        // 🆕 CREATE NEW PROGRESS
        // =========================
        if (snap.empty) {

            await addDoc(collection(db, "loyalty_progress"), {
                branch,
                plan,
                meter: newLiters,

                userEmail: currentUser.email,
                userName: currentUser.displayName || "User",
                userId: currentUser.uid,

                time: new Date().toISOString()
            });

            hideLoader();
            return { status: "new" };
        }

        // =========================
        // 🔄 UPDATE EXISTING
        // =========================
        const docSnap = snap.docs[0];
        const oldData = docSnap.data();

        const updated = Number(oldData.meter || 0) + newLiters;

        // =========================
        // 🎯 COMPLETION CHECK
        // =========================
        if (updated >= target) {

            try {
                console.log("🔥 Creating reward...");

                const rewardRef = await addDoc(
                    collection(db, "complete_reward"),
                    {
                        branch,
                        plan,
                        meter: updated,

                        userEmail: currentUser.email,
                        userName: currentUser.displayName || "User",
                        userId: currentUser.uid,

                        completedAt: new Date().toISOString()
                    }
                );

                console.log("✅ Reward created:", rewardRef.id);

            } catch (err) {
                console.error("❌ Reward creation failed:", err);
                hideLoader();
                return { status: "error", error: err };
            }

            // 🗑️ DELETE ONLY AFTER SUCCESS
            await deleteDoc(doc(db, "loyalty_progress", docSnap.id));

            hideLoader();
            return { status: "completed" };
        }

        // =========================
        // 🔄 STILL IN PROGRESS
        // =========================
        await updateDoc(doc(db, "loyalty_progress", docSnap.id), {
            meter: updated
        });

        hideLoader();
        return { status: "updated" };

    } catch (err) {
        console.error("🔥 FULL ERROR:", err);
        hideLoader();
        return { status: "error", error: err };
    }
}