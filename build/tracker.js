// Cósmica Analytics & Session Recording Tracker

(function () {
    // Ensure configuration exists
    if (!window.CosmicaConfig || !window.CosmicaConfig.clientId) {
        console.error("Cosmica Tracker: Missing CosmicaConfig.clientId");
        return;
    }

    const uid = window.CosmicaConfig.clientId;
    // Replace with your actual Firebase Functions Domain if hosted elsewhere
    const baseUrl = "https://us-central1-plataforma-cosmica.cloudfunctions.net";

    // Generate a unique session ID for this visitor
    const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    let events = [];

    // --- 1. Basic Analytics (Visits & Clicks) ---
    // Record page visit
    fetch(`${baseUrl}/trackVisit?userId=${uid}`, { method: 'GET', keepalive: true, mode: 'no-cors' })
        .catch(e => console.error("Cosmica Tracking Error [Visit]:", e));

    // Record CTA Clicks
    document.addEventListener("click", function (e) {
        const target = e.target.closest(".cta"); // Elements with 'cta' class
        if (target) {
            fetch(`${baseUrl}/trackClick?userId=${uid}&t=${Date.now()}`, { method: 'GET', keepalive: true, mode: 'no-cors' })
                .catch(e => console.error("Cosmica Tracking Error [Click]:", e));
        }
    });


    // --- 2. Advanced Session Recording (rrweb) ---
    // Function to start recording after rrweb is loaded
    function startRecording() {
        if (typeof rrweb === 'undefined') {
            console.error("Cosmica Tracker: rrweb library didn't load.");
            return;
        }

        console.log("Cosmica Tracker: Session recording started ->", sessionId);

        // Notify backend that a new session started to store metadata
        const metadata = {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        fetch(`${baseUrl}/startSessionRecording`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid, sessionId: sessionId, metadata: metadata }),
            keepalive: true
        }).catch(e => console.error("Cosmica Tracking Error [Start Session]:", e));


        // Start recording DOM events
        rrweb.record({
            emit(event) {
                events.push(event);
            },
        });

        // Send chunks to server every 10 seconds
        setInterval(function () {
            if (events.length > 0) {
                const chunkData = [...events];
                events = []; // Clear array for next batch

                // Send in smaller batches of max 50 events to avoid 'Failed to fetch' due to large payloads
                const MAX_EVENTS_PER_REQ = 50;
                for (let i = 0; i < chunkData.length; i += MAX_EVENTS_PER_REQ) {
                    const batch = chunkData.slice(i, i + MAX_EVENTS_PER_REQ);
                    const bodyString = JSON.stringify({
                        userId: uid,
                        sessionId: sessionId,
                        events: batch
                    });

                    console.log(`[Cosmica Tracker] Sending sub-chunk ${i / MAX_EVENTS_PER_REQ + 1} of ${batch.length} events... Size: ${Math.round(bodyString.length / 1024)} KB`);

                    fetch(`${baseUrl}/saveRecordingChunk`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: bodyString
                    }).then(res => {
                        if (!res.ok) console.error(`[Cosmica Tracker] Server returned ${res.status}`);
                        else console.log(`[Cosmica Tracker] Sub-chunk saved OK`);
                    }).catch(e => {
                        console.error("[Cosmica Tracker] Fetch Error [Save Chunk]:", e.message || e);
                        // Push back just the failed batch
                        events = events.concat(batch);
                    });
                }
            }
        }, 10000); // 10 seconds
    }


    // Inject rrweb script dynamically to keep the snippet small
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js";
    script.onload = startRecording;
    document.head.appendChild(script);

})();
