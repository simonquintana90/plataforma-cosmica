const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore"); 
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {Resend} = require("resend");
const {onCall, onRequest} = require("firebase-functions/v2/https");
const axios = require("axios");

const cors = require("cors")({origin: true});
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

initializeApp();

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";
const ADMIN_EMAIL = "simonquintana90@gmail.com";

exports.notifyAdminOnNewUser = onDocumentCreated(
  {
    document: "users/{userId}",
    secrets: ["RESEND_API_KEY"],
  },
  async (event) => {
    const user = event.data.data();
    console.log(`Nuevo perfil de usuario creado en Firestore: ${user.email}`);

    if (user.status !== 'pending_approval') {
      return;
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmailHtml = `
        <div style="font-family: 'Archivo', Arial, sans-serif; max-width: 600px; margin: auto;">
          <h1 style="font-size: 22px;">Nuevo Usuario Pendiente de Aprobación</h1>
          <p>Un nuevo usuario se ha registrado en la plataforma y requiere tu aprobación.</p>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>Email:</strong> ${user.email}</li>
            <li style="padding: 5px 0;"><strong>Nombre:</strong> ${user.displayName || "No proporcionado"}</li>
          </ul>
          <p>Puedes aprobarlo desde el panel de administrador en la aplicación.</p>
        </div>
      `;
      const adminEmail = {
        from: "Plataforma Cósmica <notificaciones@send.cosmicaweb.com>",
        to: ADMIN_EMAIL,
        subject: "Nuevo Usuario Registrado - Requiere Aprobación",
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

exports.createInitialPaymentPreference = onCall(
  {
    secrets: ["MERCADOPAGO_ACCESS_TOKEN"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    const preferenceData = {
      items: [
        {
          id: "inicial_web",
          title: "Pago Inicial Plataforma Cósmica",
          description: "Creación de página web informativa (2-4 semanas).",
          quantity: 1,
          unit_price: 800000,
          currency_id: "COP",
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: "https://app.cosmicaweb.com",
        failure: "https://app.cosmicaweb.com",
        pending: "https://app.cosmicaweb.com",
      },
      external_reference: userId,
      payment_methods: {
        installments: 1,
      },
    };

    try {
      const response = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        preferenceData,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return { preferenceId: response.data.id };

    } catch (error) {
      console.error("Error al crear la preferencia de pago inicial en Mercado Pago:", error.response ? error.response.data : error.message);
      throw new functions.https.HttpsError('internal', 'No se pudo crear la preferencia de pago.');
    }
  }
);


exports.createSubscriptionPreference = onCall(
  {
    secrets: ["MERCADOPAGO_ACCESS_TOKEN"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    const preferenceData = {
      items: [
        {
          id: "plan_mensual",
          title: "Suscripción Mensual Cósmica",
          description: "Acceso a cambios ilimitados y soporte prioritario",
          quantity: 1,
          unit_price: 300000,
          currency_id: "COP",
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: "https://app.cosmicaweb.com",
        failure: "https://app.cosmicaweb.com",
        pending: "https://app.cosmicaweb.com",
      },
      external_reference: userId,
      payment_methods: {
        installments: 1,
      },
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 300000,
        currency_id: "COP",
      },
    };

    try {
      const response = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        preferenceData,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return { preferenceId: response.data.id };

    } catch (error) {
      console.error("Error al crear la preferencia en Mercado Pago:", error.response ? error.response.data : error.message);
      throw new functions.https.HttpsError('internal', 'No se pudo crear la preferencia de pago.');
    }
  }
);

exports.cancelSubscription = onCall(
  {
    secrets: ["MERCADOPAGO_ACCESS_TOKEN"],
  },
  async(request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const userId = request.auth.uid;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    try {
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists || !userDoc.data().subscriptionId) {
        throw new functions.https.HttpsError('not-found', 'No se encontró una suscripción para este usuario.');
      }
      
      const subscriptionId = userDoc.data().subscriptionId;

      await axios.put(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        { status: 'cancelled' },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log(`Solicitud de cancelación enviada para la suscripción ${subscriptionId}`);
      return { success: true, message: 'La suscripción ha sido cancelada.' };

    } catch (error) {
      console.error("Error al cancelar la suscripción:", error.response ? error.response.data : error.message);
      throw new functions.https.HttpsError('internal', 'No se pudo cancelar la suscripción.');
    }
  }
);

exports.mercadopagoWebhook = onRequest(
  { secrets: ["MERCADOPAGO_ACCESS_TOKEN"] },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const notification = req.body;
    console.log("Notificación de Mercado Pago recibida:", notification);

    try {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      const db = getFirestore();

      if (notification.type === 'preapproval' && notification.data && notification.data.id) {
          const subscriptionId = notification.data.id;
          const subDetails = await axios.get(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
              headers: { "Authorization": `Bearer ${accessToken}` }
          });
          
          const { external_reference, status, payer_email } = subDetails.data;
          const userId = external_reference;

          if (userId) {
              await db.collection('users').doc(userId).set({
                  subscriptionId: subscriptionId,
                  subscriptionStatus: status,
                  email: payer_email,
              }, { merge: true });
              console.log(`Usuario (suscripción) ${userId} actualizado con estado: ${status}`);
          }
      } else if (notification.type === 'payment' && notification.data && notification.data.id) {
          const paymentId = notification.data.id;
          const paymentDetails = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
              headers: { "Authorization": `Bearer ${accessToken}` }
          });
          
          const { external_reference, status, description, transaction_amount } = paymentDetails.data;
          const userId = external_reference;

          const item = paymentDetails.data.additional_info?.items?.[0];

          if (userId && status === 'approved' && item) {
              const userRef = db.collection('users').doc(userId);
              const paymentRef = userRef.collection('payments').doc(paymentId.toString());

              await paymentRef.set({
                  paymentId: paymentId.toString(),
                  date: admin.firestore.FieldValue.serverTimestamp(),
                  amount: transaction_amount,
                  description: description,
                  status: status,
                  type: item.id === 'inicial_web' ? 'initial' : 'subscription',
              });
              
              if (item.id === 'inicial_web') {
                  await userRef.set({ initialPaymentStatus: 'completed' }, { merge: true });
                  console.log(`Usuario (pago inicial) ${userId} actualizado a 'completed'`);
              }
              console.log(`Registro de pago ${paymentId} guardado para el usuario ${userId}.`);
          }
      }
    } catch (error) {
        console.error("Error al procesar el webhook de Mercado Pago:", error.response ? error.response.data : error.message);
    }
    
    res.status(200).send("OK");
  }
);

exports.getPaymentHistory = onCall(async (request) => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const callerUid = request.auth.uid;
    // CORRECCIÓN: Usar optional chaining para evitar error si request.data es undefined
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


exports.uploadFile = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).json({message: "Método no permitido"});
    }
    
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({message: "Falta el ID del usuario."});
    }

    const busboy = Busboy({headers: req.headers});
    const uploads = {};
    const tmpdir = os.tmpdir();
    let fileWrites = [];

    busboy.on("file", (fieldname, file, filename) => {
      const filepath = path.join(tmpdir, filename.filename);
      uploads[fieldname] = {filepath, filename: filename.filename};

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
      const {filepath, filename} = uploads[fileField];

      const destination = `requests/${userId}/${Date.now()}-${filename}`;

      try {
        const [uploadedFile] = await bucket.upload(filepath, {
          destination: destination,
          resumable: false,
        });

        await uploadedFile.makePublic();
        const downloadURL = uploadedFile.publicUrl();

        fs.unlinkSync(filepath);

        res.status(200).json({
          fileURL: downloadURL,
          fileName: filename,
        });
      } catch (error) {
        console.error("Error al subir el archivo a Storage:", error);
        res.status(500).json({message: "Error al subir el archivo."});
      }
    });

    busboy.end(req.rawBody);
  });
});