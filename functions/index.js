const functions = require("firebase-functions");
// AÑADIDO: Importamos el disparador para funciones programadas
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore"); 
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {Resend} = require("resend");
const {onCall} = require("firebase-functions/v2/https");
const axios = require("axios");

initializeApp();

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";
const ADMIN_EMAIL = "simonquintana90@gmail.com";

exports.sendEmailOnNewRequest = onDocumentCreated(
  {
    document: "requests/{requestId}",
    secrets: ["RESEND_API_KEY"],
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
    secrets: ["RESEND_API_KEY"],
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
    secrets: ["RESEND_API_KEY"],
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

    const appUrl = `https://app.cosmicaweb.com/solicitud/${requestId}`;
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

exports.exchangeCodeForTokens = onCall(
  {
    secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario no está autenticado.');
    }

    const code = request.data.code;
    const redirectUri = 'https://app.cosmicaweb.com';

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token, refresh_token } = response.data;
      
      const db = getFirestore();
      await db.collection('users').doc(request.auth.uid).set({
        gmb_access_token: access_token,
        gmb_refresh_token: refresh_token,
      }, { merge: true });

      return { success: true, message: "Tokens guardados correctamente." };

    } catch (error) {
      console.error("Error al intercambiar el código por tokens:", error.response ? error.response.data : error.message);
      throw new functions.https.HttpsError('internal', 'No se pudieron obtener los tokens de Google.');
    }
});

// --- NUEVA FUNCIÓN PROGRAMADA: Limpieza automática de solicitudes antiguas ---
exports.cleanupOldRequests = onSchedule("every 24 hours", async (event) => {
  console.log("Ejecutando la limpieza de solicitudes antiguas...");

  const db = getFirestore();
  const requestsRef = db.collection("requests");

  // Calcular la fecha de hace 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Crear la consulta para encontrar documentos completados y más antiguos de 30 días
  const oldCompletedRequestsQuery = requestsRef
    .where("status", "==", "completed")
    .where("createdAt", "<=", thirtyDaysAgo);

  try {
    const snapshot = await oldCompletedRequestsQuery.get();
    if (snapshot.empty) {
      console.log("No se encontraron solicitudes antiguas para eliminar.");
      return null;
    }

    // Usar un batch para eliminar los documentos de forma eficiente
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