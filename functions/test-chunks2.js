const admin = require("firebase-admin");
admin.initializeApp({ projectId: "plataforma-cosmica" });
const db = admin.firestore();

async function check() {
    const usersSnap = await db.collection("users").limit(10).get();
    for (const userDoc of usersSnap.docs) {
        const recsSnap = await db.collection("users").doc(userDoc.id).collection("recordings").orderBy("startTime", "desc").limit(3).get();
        for (const recDoc of recsSnap.docs) {
            const chunksSnap = await db.collection("users").doc(userDoc.id).collection("recordings").doc(recDoc.id).collection("chunks").get();
            let totalEvents = 0;
            console.log(`User ${userDoc.id} Rec ${recDoc.id} Chunks: ${chunksSnap.size}`);
            for (const chunk of chunksSnap.docs) {
                const data = chunk.data();
                if (data.eventsString) {
                    const parsed = JSON.parse(data.eventsString);
                    console.log(`- chunk ${chunk.id}: eventString parsed len ${parsed.length} isArray ${Array.isArray(parsed)}`);
                    totalEvents += parsed.length;
                } else if (data.events) {
                    console.log(`- chunk ${chunk.id}: events len ${data.events.length}`);
                    totalEvents += data.events.length;
                } else {
                    console.log(`- chunk ${chunk.id}: No events! keys:`, Object.keys(data));
                }
            }
            console.log("Total:", totalEvents);
        }
    }
}
check().catch(console.error);
