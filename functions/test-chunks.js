const admin = require("firebase-admin");
const serviceAccount = require("./firebase.json"); // Or default
admin.initializeApp();
const db = admin.firestore();

async function check() {
    try {
        const usersSnap = await db.collection("users").limit(10).get();
        console.log("Found users:", usersSnap.size);
        for (const userDoc of usersSnap.docs) {
            const recsSnap = await db.collection("users").doc(userDoc.id).collection("recordings").limit(3).get();
            if (!recsSnap.empty) {
                console.log(`Found recordings for user ${userDoc.id}: ${recsSnap.size}`);
                for (const recDoc of recsSnap.docs) {
                    const recId = recDoc.id;
                    const chunksSnap = await db.collection("users").doc(userDoc.id).collection("recordings").doc(recId).collection("chunks").get();
                    console.log(`Recording ${recId} -> Chunks count: ${chunksSnap.size}`);

                    let totalEvents = 0;
                    for (const chunk of chunksSnap.docs) {
                        const data = chunk.data();
                        if (data.eventsString) {
                            try {
                                const parsed = JSON.parse(data.eventsString);
                                console.log("   - eventsString parsed length:", parsed.length, "isArray:", Array.isArray(parsed));
                                totalEvents += parsed.length;
                            } catch (e) { console.error("Parse error", e); }
                        } else if (data.events) {
                            console.log("   - events length:", data.events.length, "isArray:", Array.isArray(data.events));
                            totalEvents += data.events.length;
                        }
                    }
                    console.log("   - Total Events in recording:", totalEvents);
                }
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
check();
