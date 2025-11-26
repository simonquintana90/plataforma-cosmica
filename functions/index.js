const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { Resend } = require("resend");
const { onCall, onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");
const crypto = require("crypto"); // Necesario para verificar webhooks

const cors = require("cors")({ origin: true });
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

initializeApp();

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";
const ADMIN_EMAIL = "simonquintana90@gmail.com";
const WOMPI_API_BASE = "https://api.wompi.co/v1";

// --- NOTIFICACIONES Y LÓGICA DE LA APP (TUS FUNCIONES) ---

exports.notifyAdminOnNewUser = onDocumentCreated(
  {
    document: "users/{userId}",
    secrets: ["RESEND_API_KEY"], // Correcto: Mayúsculas
  },
  async (event) => {
    const user = event.data.data();
    console.log(`Nuevo perfil de usuario creado en Firestore: ${user.email}`);

    // if (user.status !== 'pending_approval') { return; } // Eliminado: Ya no requerimos aprobación manual

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmailHtml = `
        <div style="font-family: 'Archivo', Arial, sans-serif; max-width: 600px; margin: auto;">
          <h1 style="font-size: 22px;">Nuevo Usuario Registrado</h1>
          <p>Un nuevo usuario se ha registrado en la plataforma.</p>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>Email:</strong> ${user.email}</li>
            <li style="padding: 5px 0;"><strong>Nombre:</strong> ${user.displayName || "No proporcionado"}</li>
          </ul>
          <p>El usuario ha sido aprobado automáticamente y puede proceder al pago.</p>
        </div>
      `;
      const adminEmail = {
        from: "Plataforma Cósmica <notificaciones@send.cosmicaweb.com>",
        to: ADMIN_EMAIL,
        subject: "Nuevo Usuario Registrado",
        html: adminEmailHtml,
      };

      await resend.emails.send(adminEmail);
      console.log(`Notificación de nuevo usuario enviada a ${ADMIN_EMAIL}.`);
    } catch (error) {
      console.error("Error al enviar notificación de nuevo usuario:", error);
    }
  }
);

exports.sendEmailOnNewRequest = onDocumentCreated(
  {
    document: "requests/{requestId}",
    secrets: ["RESEND_API_KEY"], // Correcto: Mayúsculas
  },
  async (event) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const newRequest = snapshot.data();

    const fileLinkHtml = newRequest.fileUrl
      ? `<tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Archivo Adjunto:</td><td style="padding: 12px 0;"><a href="${newRequest.fileUrl}" target="_blank" style="color: #3e6cff; text-decoration: none;">Ver Archivo Adjunto</a></td></tr>`
      : '';

    const adminEmailHtml = `
    <div style="font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <img src="https://app.cosmicaweb.com/Logo.png" alt="Logo Cósmica" style="height: 30px; width: auto;">
      </div>
      <div style="padding: 20px 30px;">
        <h1 style="color: #0D0D0D; font-size: 24px; font-weight: 700;">Nueva Solicitud de Cambio Recibida</h1>
        <p>Un cliente ha enviado una nueva solicitud a través de la plataforma.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <h2 style="color: #0D0D0D; font-size: 18px; border-bottom: 2px solid #3e6cff; padding-bottom: 5px; font-weight: 700;">Detalles de la Solicitud</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold; width: 120px;">Cliente:</td><td style="padding: 12px 0;">${newRequest.userName || newRequest.userEmail}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Email:</td><td style="padding: 12px 0;">${newRequest.userEmail}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Título:</td><td style="padding: 12px 0;">${newRequest.title}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Tipo de Cambio:</td><td style="padding: 12px 0;">${newRequest.type}</td></tr>
            ${fileLinkHtml}
          </tbody>
        </table>
        <h3 style="color: #0D0D0D; font-size: 16px; margin-top: 25px; font-weight: 700;">Descripción:</h3>
        <div style="background-color: #fdfdfd; border: 1px solid #e9e9e9; border-radius: 4px; padding: 15px; margin-top: 5px; font-size: 14px;"><p style="margin: 0;">${newRequest.description}</p></div>
        <div style="text-align: center; margin-top: 30px;"><a href="https://console.firebase.google.com/project/plataforma-cosmica/firestore/data/~2Frequests" style="background-color: #3e6cff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver en Firebase</a></div>
      </div>
    </div>
  `;

    const clientEmailHtml = `
    <div style="font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <img src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/680535faac041774d1d2256c_CO%CC%81SMICA_Logo_FAV.png?alt=media&token=e40ee3c1-c85c-4967-a814-e8dc3197353a" alt="Logo Cósmica" style="height: 30px; width: auto;">
      </div>
      <div style="padding: 20px 30px;">
        <h1 style="color: #0D0D0D; font-size: 24px; font-weight: 700;">¡Hemos recibido tu solicitud!</h1>
        <p>Hola, <strong>${newRequest.userName || ''}</strong>.</p>
        <p>Te confirmamos que hemos recibido tu solicitud. Muy pronto verás los cambios reflejados en tu web.</p>
      </div>
    </div>
  `;

    const adminEmail = { from: "Plataforma Cósmica <notificaciones@send.cosmicaweb.com>", to: ADMIN_EMAIL, subject: `Nueva Solicitud de Cambio: ${newRequest.title}`, html: adminEmailHtml };
    const clientEmail = { from: "Cósmica Web <notificaciones@send.cosmicaweb.com>", to: newRequest.userEmail, subject: `Confirmación de tu solicitud: ${newRequest.title}`, html: clientEmailHtml };

    try {
      await Promise.all([resend.emails.send(adminEmail), resend.emails.send(clientEmail)]);
      console.log("Correos de notificación (admin y cliente) enviados con éxito.");
    } catch (error) {
      console.error("Error al enviar los correos:", error);
    }
  });

exports.sendCompletionEmail = onDocumentUpdated(
  {
    document: "requests/{requestId}",
    secrets: ["RESEND_API_KEY"], // Correcto: Mayúsculas
  },
  async (event) => {
    const dataBefore = event.data.before.data();
    const dataAfter = event.data.after.data();

    if (dataBefore.status !== "completed" && dataAfter.status === "completed") {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const completionEmailHtml = `
        <div style="font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
            <img src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/680535faac041774d1d2256c_CO%CC%81SMICA_Logo_FAV.png?alt=media&token=e40ee3c1-c85c-4967-a814-e8dc3197353a" alt="Logo Cósmica" style="height: 30px; width: auto;">
          </div>
          <div style="padding: 20px 30px;">
            <h1 style="color: #0D0D0D; font-size: 24px; font-weight: 700;">¡Tu solicitud ha sido completada!</h1>
            <p>Hola, <strong>${dataAfter.userName || ''}</strong>.</p>
            <p>Nos complace informarte que tu solicitud de cambio titulada "<strong>${dataAfter.title}</strong>" ya ha sido implementada en tu sitio web.</p>
            <p>Por favor, revisa tu página para confirmar que todo se vea como esperabas. Si tienes alguna duda, no dudes en crear una nueva solicitud.</p>
          </div>
        </div>
      `;

      const clientEmail = {
        from: "Cósmica Web <notificaciones@send.cosmicaweb.com>",
        to: dataAfter.userEmail,
        subject: `¡Cambio completado! Tu solicitud "${dataAfter.title}" está lista`,
        html: completionEmailHtml,
      };

      try {
        await resend.emails.send(clientEmail);
        console.log(`Correo de completado enviado a ${dataAfter.userEmail}`);
      } catch (error) {
        console.error("Error al enviar el correo de completado:", error);
      }
    }
  },
);

exports.sendChatMessageNotification = onDocumentCreated(
  {
    document: "requests/{requestId}/messages/{messageId}",
    secrets: ["RESEND_API_KEY"], // Correcto: Mayúsculas
  },
  async (event) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const messageData = event.data.data();
    const requestId = event.params.requestId;

    const requestDoc = await getFirestore().collection("requests").doc(requestId).get();
    const requestData = requestDoc.data();

    if (!requestData) {
      console.log("No se encontró la solicitud padre.");
      return;
    }

    const appUrl = `https.app.cosmicaweb.com/solicitud/${requestId}`;
    let emailToSend;

    if (messageData.senderId === ADMIN_UID) {
      const clientEmailHtml = `
            <div style="font-family: 'Archivo', Arial, sans-serif; max-width: 600px; margin: auto;">
                <h1 style="font-size: 22px;">Tienes un nuevo mensaje de Cósmica</h1>
                <p>Hola, ${requestData.userName || ''}.</p>
                <p>Nuestro equipo ha dejado un comentario sobre tu solicitud "<strong>${requestData.title}</strong>".</p>
                <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;"><em>"${messageData.text}"</em></p>
                <a href="${appUrl}" style="display: inline-block; padding: 12px 20px; background-color: #3e6cff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver la conversación</a>
            </div>`;

      emailToSend = {
        from: "Cósmica Web <notificaciones@send.cosmicaweb.com>",
        to: requestData.userEmail,
        subject: `Nuevo mensaje sobre tu solicitud: ${requestData.title}`,
        html: clientEmailHtml,
      };
    }
    else {
      const adminEmailHtml = `
            <div style="font-family: 'Archivo', Arial, sans-serif; max-width: 600px; margin: auto;">
                <h1 style="font-size: 22px;">Nuevo mensaje de un cliente</h1>
                <p>El cliente <strong>${requestData.userName}</strong> ha respondido en la solicitud "<strong>${requestData.title}</strong>".</p>
                <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;"><em>"${messageData.text}"</em></p>
                <a href="${appUrl}" style="display: inline-block; padding: 12px 20px; background-color: #3e6cff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a la solicitud</a>
            </div>`;

      emailToSend = {
        from: "Plataforma Cósmica <notificaciones@send.cosmicaweb.com>",
        to: ADMIN_EMAIL,
        subject: `Nuevo mensaje de ${requestData.userName} en: ${requestData.title}`,
        html: adminEmailHtml,
      };
    }

    try {
      await resend.emails.send(emailToSend);
      console.log(`Notificación de chat enviada a ${emailToSend.to}`);
    } catch (error) {
      console.error("Error al enviar notificación de chat:", error);
    }
  }
);

exports.cleanupOldRequests = onSchedule("every 24 hours", async (event) => {
  console.log("Ejecutando la limpieza de solicitudes antiguas...");

  const db = getFirestore();
  const requestsRef = db.collection("requests");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldCompletedRequestsQuery = requestsRef
    .where("status", "==", "completed")
    .where("createdAt", "<=", thirtyDaysAgo);

  try {
    const snapshot = await oldCompletedRequestsQuery.get();
    if (snapshot.empty) {
      console.log("No se encontraron solicitudes antiguas para eliminar.");
      return null;
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Se eliminaron ${snapshot.size} solicitudes antiguas.`);
    return null;
  } catch (error) {
    console.error("Error al limpiar solicitudes antiguas:", error);
    return null;
  }
});

// --- FUNCIONES DE MERCADOPAGO ELIMINADAS ---


// --- (NUEVO) FUNCIONES DE WOMPI ---

const wompiApi = axios.create({
  baseURL: WOMPI_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * (NUEVO) Obtiene el token de aceptación de Wompi.
 * Se llama ANTES de renderizar el formulario de pago.
 */
exports.getWompiAcceptanceToken = onCall(
  {
    secrets: ["WOMPI_PUBLIC_KEY"], // Correcto: Mayúsculas
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const wompiPublicKey = process.env.WOMPI_PUBLIC_KEY;

    try {
      // 1. Obtenemos el "token de aceptación" del comerciante
      const merchantResponse = await axios.get(`${WOMPI_API_BASE}/merchants/${wompiPublicKey}`);
      const acceptanceToken = merchantResponse.data.data.presigned_acceptance.acceptance_token;

      if (!acceptanceToken) {
        throw new Error('No se pudo obtener el token de aceptación del comerciante.');
      }

      return { acceptance_token: acceptanceToken };

    } catch (error) {
      console.error("Error al obtener token de aceptación de Wompi:", error.response ? error.response.data : error.message);
      throw new functions.https.HttpsError('internal', 'No se pudo inicializar el pago.');
    }
  }
);


/**
 * (NUEVO) Crea la suscripción en Wompi y activa al usuario.
 * Recibe tokens desde el frontend.
 */
exports.createWompiSubscription = onCall(
  {
    secrets: ["WOMPI_PRIVATE_KEY"], // Correcto: Mayúsculas
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const { paymentToken, acceptanceToken } = request.data;
    if (!paymentToken || !acceptanceToken) {
      throw new functions.https.HttpsError('invalid-argument', 'Faltan el token de pago o el token de aceptación.');
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;
    const userName = request.auth.token.name || userEmail;

    const wompiPrivateKey = process.env.WOMPI_PRIVATE_KEY;
    wompiApi.defaults.headers.common['Authorization'] = `Bearer ${wompiPrivateKey}`;
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    try {
      // 1. Crear Fuente de Pago (la tarjeta tokenizada)
      console.log(`Creando fuente de pago para ${userEmail}`);
      const paymentSourceResponse = await wompiApi.post('/payment_sources', {
        type: "CARD",
        token: paymentToken,
        customer_email: userEmail,
        acceptance_token: acceptanceToken,
      });
      const paymentSource = paymentSourceResponse.data.data;
      console.log(`Fuente de pago creada: ${paymentSource.id}`);

      // 2. Crear Cliente en Wompi
      console.log(`Creando cliente para ${userEmail}`);
      const customerResponse = await wompiApi.post('/customers', {
        email: userEmail,
        full_name: userName,
        payment_source_id: paymentSource.id,
      });
      const customer = customerResponse.data.data;
      console.log(`Cliente creado: ${customer.id}`);

      // 3. Crear la Suscripción
      console.log(`Creando suscripción para ${customer.id}`);
      const subscriptionResponse = await wompiApi.post('/subscriptions', {
        customer_id: customer.id,
        payment_source_id: paymentSource.id,
        // Datos de la suscripción (¡Importante!)
        plan_name: "Suscripción Mensual Cósmica", // Puedes cambiar esto
        interval: "month", // "day", "week", "month", "year"
        interval_count: 1, // Cada 1 mes
        amount_in_cents: 8990000, // 89.900 COP en centavos
        currency: "COP",
      });

      const subscription = subscriptionResponse.data.data;
      console.log(`Suscripción creada: ${subscription.id}`);

      // 4. Guardar info en Firestore y activar usuario
      await userRef.set({
        wompiCustomerId: customer.id,
        wompiPaymentSourceId: paymentSource.id,
        subscriptionId: subscription.id,
        subscriptionProvider: "wompi",
        subscriptionStatus: "active", // Wompi lo crea como 'pending' pero lo activamos de inmediato
        initialPaymentStatus: "completed", // ¡Clave para el flujo de la app!
      }, { merge: true });

      console.log(`Usuario ${userId} activado con suscripción ${subscription.id}`);
      return { status: "success", subscriptionId: subscription.id, paymentSourceId: paymentSource.id };

    } catch (error) {
      console.error("Error al crear la suscripción en Wompi:", error.response ? error.response.data : error.message);

      if (error.response && error.response.data && error.response.data.error) {
        throw new functions.https.HttpsError('internal', error.response.data.error.messages || 'Error de Wompi.');
      }
      throw new functions.https.HttpsError('internal', 'No se pudo crear la suscripción.');
    }
  }
);

/**
 * (NUEVO) Cancela la suscripción en Wompi.
 */
exports.cancelWompiSubscription = onCall(
  {
    secrets: ["WOMPI_PRIVATE_KEY"], // Correcto: Mayúsculas
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const userId = request.auth.uid;
    const wompiPrivateKey = process.env.WOMPI_PRIVATE_KEY;
    wompiApi.defaults.headers.common['Authorization'] = `Bearer ${wompiPrivateKey}`;
    const db = getFirestore();

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists || !userDoc.data().subscriptionId || userDoc.data().subscriptionProvider !== 'wompi') {
        throw new functions.https.HttpsError('not-found', 'No se encontró una suscripción de Wompi para este usuario.');
      }

      const subscriptionId = userDoc.data().subscriptionId;

      console.log(`Cancelando suscripción de Wompi: ${subscriptionId}`);
      await wompiApi.post(`/subscriptions/${subscriptionId}/cancel`);

      // El webhook actualizará el estado, pero podemos forzarlo aquí
      await db.collection('users').doc(userId).set({
        subscriptionStatus: 'canceled',
      }, { merge: true });

      console.log(`Suscripción ${subscriptionId} cancelada para usuario ${userId}`);
      return { success: true, message: 'La suscripción ha sido cancelada.' };

    } catch (error) {
      console.error("Error al cancelar la suscripción de Wompi:", error.response ? error.response.data : error.message);
      throw new functions.https.HttpsError('internal', 'No se pudo cancelar la suscripción.');
    }
  }
);


/**
 * (NUEVO) Escucha los eventos de Wompi (pagos, fallos, etc.).
 */
exports.wompiWebhook = onRequest(
  { secrets: ["WOMPI_EVENT_TOKEN"] }, // Correcto: Mayúsculas
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const eventsToken = process.env.WOMPI_EVENT_TOKEN;
    const requestBody = req.rawBody.toString();

    // TODO: Implementar la verificación de firma HMAC si Wompi la envía.
    // Por ahora, procesamos el evento.

    console.log("Webhook de Wompi recibido:", JSON.stringify(req.body));

    const event = req.body;
    const db = getFirestore();

    try {
      const { data, event: eventType } = event;

      if (eventType === 'subscription.updated') {
        const { subscription } = data;
        const subscriptionId = subscription.id;
        const newStatus = subscription.status; // ej: 'active', 'past_due', 'canceled'

        const usersQuery = db.collection('users').where('subscriptionId', '==', subscriptionId);
        const userSnapshot = await usersQuery.get();

        if (userSnapshot.empty) {
          console.warn(`No se encontró usuario para subscriptionId ${subscriptionId}`);
          return res.status(200).send("OK (usuario no encontrado)");
        }

        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.update({
          subscriptionStatus: newStatus,
        });

        console.log(`Estado de suscripción actualizado a "${newStatus}" para el usuario ${userDoc.id}`);
      }

      if (eventType === 'transaction.updated') {
        const { transaction } = data;
        // Solo nos interesan transacciones aprobadas de suscripciones
        if (transaction.status === 'APPROVED' && transaction.subscription_id) {

          const subscriptionId = transaction.subscription_id;
          const usersQuery = db.collection('users').where('subscriptionId', '==', subscriptionId);
          const userSnapshot = await usersQuery.get();

          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userId = userDoc.id;

            // Guardar en el historial de pagos
            const paymentRef = db.collection('users').doc(userId).collection('payments').doc(transaction.id);
            await paymentRef.set({
              paymentId: transaction.id,
              date: admin.firestore.Timestamp.fromDate(new Date(transaction.created_at)),
              amount: transaction.amount_in_cents / 100, // Almacenar en COP
              description: "Pago de suscripción mensual",
              status: 'approved',
              type: 'subscription',
              reference: transaction.reference,
            });
            console.log(`Pago ${transaction.id} registrado para usuario ${userId}`);
          }
        }
      }

    } catch (error) {
      console.error("Error al procesar el webhook de Wompi:", error.message);
      return res.status(500).send("Error interno");
    }

    res.status(200).send("OK");
  }
);


// --- OTRAS FUNCIONES (SIN CAMBIOS) ---

exports.getPaymentHistory = onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
  }

  const callerUid = request.auth.uid;
  const targetUserId = request.data?.userId;

  if (targetUserId && callerUid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para ver este historial.');
  }

  const finalUserId = targetUserId || callerUid;

  try {
    const db = getFirestore();
    const paymentsRef = db.collection('users').doc(finalUserId).collection('payments');
    const snapshot = await paymentsRef.orderBy('date', 'desc').get();

    if (snapshot.empty) {
      return [];
    }

    const payments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date ? data.date.toDate().toISOString() : null,
      };
    });

    return payments;

  } catch (error) {
    console.error("Error al obtener el historial de pagos:", error);
    throw new functions.https.HttpsError('internal', 'No se pudo obtener el historial de pagos.');
  }
});


// --- FUNCIÓN PARA SUBIR ARCHIVOS DE SOLICITUDES ---
exports.uploadFile = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Método no permitido" });
    }

    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario." });
    }

    const busboy = Busboy({ headers: req.headers });
    const uploads = {};
    const tmpdir = os.tmpdir();
    let fileWrites = [];

    busboy.on("file", (fieldname, file, filename) => {
      const filepath = path.join(tmpdir, filename.filename);
      uploads[fieldname] = { filepath, filename: filename.filename };
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
      const promise = new Promise((resolve, reject) => {
        file.on("end", () => writeStream.end());
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });
      fileWrites.push(promise);
    });

    busboy.on("finish", async () => {
      await Promise.all(fileWrites);
      const bucket = admin.storage().bucket();
      const fileField = Object.keys(uploads)[0];
      const { filepath, filename } = uploads[fileField];
      const destination = `requests/${userId}/${Date.now()}-${filename}`;
      try {
        const [uploadedFile] = await bucket.upload(filepath, { destination: destination, resumable: false });
        await uploadedFile.makePublic();
        const downloadURL = uploadedFile.publicUrl();
        fs.unlinkSync(filepath);
        res.status(200).json({ fileURL: downloadURL, fileName: filename });
      } catch (error) {
        console.error("Error al subir el archivo a Storage:", error);
        res.status(500).json({ message: "Error al subir el archivo." });
      }
    });

    busboy.end(req.rawBody);
  });
});

// --- NUEVA FUNCIÓN PARA SUBIR LOGOTIPOS ---
exports.uploadLogo = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Método no permitido" });
    }

    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario." });
    }

    const busboy = Busboy({ headers: req.headers });
    const uploads = {};
    const tmpdir = os.tmpdir();
    let fileWrites = [];

    busboy.on("file", (fieldname, file, filename) => {
      const filepath = path.join(tmpdir, filename.filename);
      uploads[fieldname] = { filepath, filename: filename.filename };
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
      const promise = new Promise((resolve, reject) => {
        file.on("end", () => writeStream.end());
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });
      fileWrites.push(promise);
    });

    busboy.on("finish", async () => {
      await Promise.all(fileWrites);
      const bucket = admin.storage().bucket();
      const fileField = Object.keys(uploads)[0];
      const { filepath, filename } = uploads[fileField];
      // Guardamos en una carpeta diferente para logos
      const destination = `logos/${userId}/${Date.now()}-${filename}`;
      try {
        const [uploadedFile] = await bucket.upload(filepath, { destination: destination, resumable: false });
        await uploadedFile.makePublic();
        const downloadURL = uploadedFile.publicUrl();
        fs.unlinkSync(filepath);
        res.status(200).json({ fileURL: downloadURL, fileName: filename });
      } catch (error) {
        console.error("Error al subir el logo a Storage:", error);
        res.status(500).json({ message: "Error al subir el logo." });
      }
    });

    busboy.end(req.rawBody);
  });
});