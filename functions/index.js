const functions = require("firebase-functions");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {Resend} = require("resend");
const {defineString} = require('firebase-functions/params');
const {onCall} = require("firebase-functions/v2/https");
const axios = require("axios");

initializeApp();

// --- Definición de Secretos y Parámetros ---
const resendApiKey = defineString("RESEND_API_KEY");
const googleClientId = defineString("GOOGLE_CLIENT_ID");
const googleClientSecret = defineString("GOOGLE_CLIENT_SECRET");

// --- Función para Notificaciones por Correo ---
exports.sendEmailOnNewRequest = onDocumentCreated(
  {
    document: "requests/{requestId}",
    secrets: ["RESEND_API_KEY"],
  },
  async (event) => {
    const resend = new Resend(resendApiKey.value());
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const newRequest = snapshot.data();

    const adminEmailHtml = `
    <div style="font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/plataforma-cosmica.appspot.com/o/Logo.png?alt=media&token=e40ee3c1-c85c-4967-a814-e8dc3197353a" alt="Logo Cósmica" style="height: 30px; width: auto;">
      </div>
      <div style="padding: 20px 30px;">
        <h1 style="color: #0D0D0D; font-size: 24px; font-weight: 700;">Nueva Solicitud de Cambio Recibida</h1>
        <p>Un cliente ha enviado una nueva solicitud a través de la plataforma. A continuación se muestran los detalles:</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <h2 style="color: #0D0D0D; font-size: 18px; border-bottom: 2px solid #3e6cff; padding-bottom: 5px; font-weight: 700;">Detalles de la Solicitud</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold; width: 120px;">Cliente:</td><td style="padding: 12px 0;">${newRequest.userName || newRequest.userEmail}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Email:</td><td style="padding: 12px 0;">${newRequest.userEmail}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Título:</td><td style="padding: 12px 0;">${newRequest.title}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Tipo de Cambio:</td><td style="padding: 12px 0;">${newRequest.type}</td></tr>
          </tbody>
        </table>
        <h3 style="color: #0D0D0D; font-size: 16px; margin-top: 25px; font-weight: 700;">Descripción:</h3>
        <div style="background-color: #fdfdfd; border: 1px solid #e9e9e9; border-radius: 4px; padding: 15px; margin-top: 5px; font-size: 14px;"><p style="margin: 0;">${newRequest.description}</p></div>
        <div style="text-align: center; margin-top: 30px;"><a href="https://console.firebase.google.com/project/plataforma-cosmica/firestore/data/~2Frequests" style="background-color: #3e6cff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver en Firebase</a></div>
      </div>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #888;"><p>Este es un correo automático de la Plataforma de Clientes Cósmica.</p></div>
    </div>
  `;

  const clientEmailHtml = `
    <div style="font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/plataforma-cosmica.appspot.com/o/Logo.png?alt=media&token=e40ee3c1-c85c-4967-a814-e8dc3197353a" alt="Logo Cósmica" style="height: 30px; width: auto;">
      </div>
      <div style="padding: 20px 30px;">
        <h1 style="color: #0D0D0D; font-size: 24px; font-weight: 700;">¡Hemos recibido tu solicitud!</h1>
        <p>Hola, <strong>${newRequest.userName || ''}</strong>.</p>
        <p>Te confirmamos que hemos recibido tu solicitud de cambio y nuestro equipo se pondrá a trabajar en ella a la brevedad. Aquí tienes un resumen de los detalles:</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <h2 style="color: #0D0D0D; font-size: 18px; border-bottom: 2px solid #3e6cff; padding-bottom: 5px; font-weight: 700;">Resumen de tu Solicitud</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold; width: 120px;">Título:</td><td style="padding: 12px 0;">${newRequest.title}</td></tr>
            <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 12px 0; font-weight: bold;">Tipo de Cambio:</td><td style="padding: 12px 0;">${newRequest.type}</td></tr>
          </tbody>
        </table>
        <h3 style="color: #0D0D0D; font-size: 16px; margin-top: 25px; font-weight: 700;">Descripción enviada:</h3>
        <div style="background-color: #fdfdfd; border: 1px solid #e9e9e9; border-radius: 4px; padding: 15px; margin-top: 5px; font-size: 14px;"><p style="margin: 0;">${newRequest.description}</p></div>
        <p style="margin-top: 20px;">Muy pronto verás los cambios reflejados en tu web. Si tenemos alguna duda, te contactaremos.</p>
      </div>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #888;"><p>Gracias por confiar en Cósmica.</p></div>
    </div>
  `;

  const adminEmail = { from: "Plataforma Cósmica <notificaciones@send.cosmicaweb.com>", to: "simonquintana90@gmail.com", subject: `Nueva Solicitud de Cambio: ${newRequest.title}`, html: adminEmailHtml };
  const clientEmail = { from: "Cósmica Web <notificaciones@send.cosmicaweb.com>", to: newRequest.userEmail, subject: `Confirmación de tu solicitud: ${newRequest.title}`, html: clientEmailHtml };

  try {
    await Promise.all([resend.emails.send(adminEmail), resend.emails.send(clientEmail)]);
    console.log("Correos de notificación (admin y cliente) enviados con éxito.");
  } catch (error) {
    console.error("Error al enviar los correos:", error);
  }
});


// --- NUEVA FUNCIÓN para Conexión con GMB ---
exports.exchangeCodeForTokens = onCall(
  {
    secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], // Declara explícitamente los secretos
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
        client_id: googleClientId.value(),
        client_secret: googleClientSecret.value(),
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
