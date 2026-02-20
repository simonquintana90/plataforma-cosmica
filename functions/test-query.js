const admin = require("firebase-admin");
try {
    admin.initializeApp();
} catch (e) { }
const db = admin.firestore();

async function run() {
    try {
        console.log("Checking Firestore...");
        const users = await db.collection("users").limit(5).get();
        console.log("Users:", users.size);
        for (let user of users.docs) {
            console.log("User:", user.id);
            const recs = await db.collection("users").doc(user.id).collection("recordings").limit(2).get();
            for (let rec of recs.docs) {
                console.log("  Rec:", rec.id, rec.data());
                const chunks = await db.collection("users").doc(user.id).collection("recordings").doc(rec.id).collection("chunks").get();
                console.log("    Chunks size:", chunks.size);
                for (let chunk of chunks.docs) {
                    const data = chunk.data();
                    if (data.eventsString) {
                        try {
                            const p = JSON.parse(data.eventsString);
                            console.log("      chunk", chunk.id, "eventsString len:", p.length);
                        } catch (err) {
                            console.log("      parse error:", err.message);
                        }
                    } else if (data.events) {
                        console.log("      chunk", chunk.id, "events array len:", data.events.length);
                    } else {
                        console.log("      chunk", chunk.id, "NO EVENTS. keys:", Object.keys(data));
                    }
                }
            }
        }
    } catch (e) {
        console.error("error:", e);
    }
}
run();
