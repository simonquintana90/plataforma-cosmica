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
const PDFDocument = require("pdfkit");

initializeApp();

const ADMIN_UID = "SFYFi9u8uZYJHSNEEyGQaigIyip1";
const ADMIN_EMAIL = "simonquintana90@gmail.com";
// URL de Producción
const WOMPI_API_BASE = "https://production.wompi.co/v1";

const wompiApi = axios.create({
  baseURL: WOMPI_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ... (existing code)
// ... (existing code)

exports.createWompiSubscription = onCall(
  {
    secrets: ["WOMPI_PRIVATE_KEY"], // Correcto: Mayúsculas
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const { paymentToken, acceptanceToken, planInterval = 'monthly', couponCode } = request.data;
    if (!paymentToken || !acceptanceToken) {
      throw new functions.https.HttpsError('invalid-argument', 'Faltan el token de pago o el token de aceptación.');
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;
    const userName = request.auth.token.name || userEmail;

    // Usar clave de PRODUCCIÓN directamente
    const wompiPrivateKey = 'prv_prod_9iyGRlZiXjzuRC7OeWGrLTdg1uVi5RhC';
    console.log("DEBUG: Usando Private Key:", wompiPrivateKey);

    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    const headers = {
      Authorization: `Bearer ${wompiPrivateKey}`
    };

    try {
      // 1. Crear Fuente de Pago (la tarjeta tokenizada)
      console.log(`Creando fuente de pago para ${userEmail}`);
      const paymentSourceResponse = await wompiApi.post('/payment_sources', {
        type: "CARD",
        token: paymentToken,
        customer_email: userEmail,
        acceptance_token: acceptanceToken,
      }, { headers });
      const paymentSource = paymentSourceResponse.data.data;
      console.log(`Fuente de pago creada: ${paymentSource.id}`);

      // 2. Realizar el PRIMER COBRO inmediatamente (Suscripción Manual)
      let amountInCents = 8990000; // Default: Mensual 89.900 COP
      let nextPaymentDays = 30;
      let planDescription = "Suscripción Mensual";

      if (planInterval === 'yearly') {
        amountInCents = 100000000; // Anual 1.000.000 COP
        nextPaymentDays = 365;
        planDescription = "Suscripción Anual";
      }

      // --- LÓGICA DE CUPONES ---
      let appliedCoupon = null;
      if (couponCode) {
        console.log(`Verificando cupón: ${couponCode}`);
        const couponRef = db.collection('coupons').doc(couponCode.toUpperCase());
        const couponDoc = await couponRef.get();

        if (couponDoc.exists) {
          const couponData = couponDoc.data();
          if (couponData.active) {
            // Validar si el cupón aplica al plan seleccionado
            const applicablePlan = couponData.applicablePlan || 'all'; // 'all', 'monthly', 'yearly'

            if (applicablePlan !== 'all' && applicablePlan !== planInterval) {
              console.log(`El cupón ${couponCode} no aplica para el plan ${planInterval} (Solo ${applicablePlan}).`);
              // No aplicamos descuento, pero no fallamos la transacción.
            } else {
              appliedCoupon = { code: couponCode, ...couponData };
              console.log("Cupón válido encontrado:", appliedCoupon);

              // Calcular descuento
              if (couponData.type === 'percent') {
                const discountAmount = Math.floor(amountInCents * (couponData.value / 100)); // Usar Math.floor para enteros
                amountInCents -= discountAmount;
              } else if (couponData.type === 'amount') {
                amountInCents -= (couponData.value * 100); // Asumiendo value en pesos, convertir a centavos
              }

              // Seguridad: El monto no puede ser menor a 1500 pesos (mínimo Wompi aprox)
              if (amountInCents < 150000) amountInCents = 150000;

              planDescription += ` (Cupón ${couponCode} aplicado)`;
            }
          } else {
            console.log("El cupón existe pero no está activo.");
            // Opcional: Lanzar error si el cupón es inválido, o ignorarlo y cobrar full. 
            // Mejor ignorar para no romper el flujo si el usuario escribió mal, pero en el front ya debió validarse.
          }
        }
      }
      // --- FIN LÓGICA DE CUPONES ---

      const currency = "COP";
      const reference = `sub_${planInterval}_${userId}_${Date.now()}`;

      // Generar firma de integridad
      const wompiIntegritySecret = 'prod_integrity_5arGHVwweUk0dR7WcmKebKvuLGUIUEcU';
      const signatureString = `${reference}${amountInCents}${currency}${wompiIntegritySecret}`;
      const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

      console.log(`Iniciando cobro de suscripción manual (${planInterval}): ${reference}`);
      const transactionResponse = await wompiApi.post('/transactions', {
        amount_in_cents: amountInCents,
        currency: currency,
        customer_email: userEmail,
        payment_source_id: paymentSource.id,
        reference: reference,
        signature: signature, // Firma obligatoria
        payment_method: {
          installments: 1 // 1 cuota
        }
      }, { headers });

      const transaction = transactionResponse.data.data;
      console.log(`Transacción creada: ${transaction.id}, Estado: ${transaction.status}`);

      // 3. Guardar info en Firestore y activar usuario
      await userRef.set({
        wompiPaymentSourceId: paymentSource.id,
        subscriptionId: "manual_managed",
        lastTransactionId: transaction.id,
        subscriptionProvider: "wompi_manual",
        subscriptionStatus: "active",
        subscriptionInterval: planInterval, // 'monthly' or 'yearly'
        initialPaymentStatus: "completed",
        subscriptionStartDate: admin.firestore.Timestamp.now(),
        nextPaymentDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + nextPaymentDays * 24 * 60 * 60 * 1000)),
        // Store recurring coupon if applicable
        recurringCoupon: (appliedCoupon && appliedCoupon.duration === 'forever') ? appliedCoupon.code : null
      }, { merge: true });

      // Guardar registro del pago
      await userRef.collection('payments').doc(transaction.id).set({
        paymentId: transaction.id,
        date: admin.firestore.Timestamp.now(),
        amount: amountInCents / 100,
        description: `${planDescription} (Primer Pago)`,
        status: transaction.status,
        reference: reference,
        type: 'subscription_initial',
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        originalAmount: appliedCoupon ? (appliedCoupon.type === 'percent' ? amountInCents / (1 - appliedCoupon.value / 100) : amountInCents + appliedCoupon.value * 100) : amountInCents // Aprox reverse calculation just for logs/record if needed, or simply don't store original.
      });

      console.log(`Usuario ${userId} activado. Transacción: ${transaction.id}`);
      return { status: "success", transactionId: transaction.id, paymentSourceId: paymentSource.id };

    } catch (error) {
      console.error("Error al procesar el pago en Wompi:", error.response ? error.response.data : error.message);
      if (error.response && error.response.data && error.response.data.error) {
        throw new functions.https.HttpsError('internal', JSON.stringify(error.response.data.error.messages) || 'Error de Wompi.');
      }
      throw new functions.https.HttpsError('internal', 'No se pudo procesar el pago.');
    }
  }
);

/**
 * Crea una suscripción ADICIONAL para Landing Pages.
 * Reutiliza la fuente de pago existente del usuario.
 */
/**
 * Valida un cupón antes del pago.
 * Retorna detalles del descuento si es válido.
 */
exports.validateCoupon = onCall(
  {},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado.');
    }
    const { couponCode } = request.data;
    if (!couponCode) return { valid: false, message: 'Código vacío' };

    const db = getFirestore();
    try {
      const couponDoc = await db.collection('coupons').doc(couponCode.toUpperCase()).get();
      if (!couponDoc.exists) {
        return { valid: false, message: 'Cupón no existe' };
      }
      const data = couponDoc.data();
      if (!data.active) {
        return { valid: false, message: 'Cupón inactivo' };
      }
      return {
        valid: true,
        type: data.type,
        value: data.value,
        code: couponCode.toUpperCase(),
        applicablePlan: data.applicablePlan || 'all'
      };
    } catch (error) {
      console.error("Error validando cupón:", error);
      throw new functions.https.HttpsError('internal', 'Error al validar cupón');
    }
  }
);

exports.createLandingPageSubscription = onCall(
  {
    secrets: ["WOMPI_PRIVATE_KEY"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const { planInterval = 'monthly' } = request.data;
    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;

    // Usar clave de PRODUCCIÓN
    const wompiPrivateKey = 'prv_prod_9iyGRlZiXjzuRC7OeWGrLTdg1uVi5RhC';

    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    try {
      // 1. Obtener la fuente de pago existente
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Usuario no encontrado.');
      }
      const userData = userDoc.data();

      const paymentSourceId = userData.wompiPaymentSourceId || userData.paymentSourceId;

      if (!paymentSourceId) {
        throw new functions.https.HttpsError('failed-precondition', 'No tienes una tarjeta guardada. Por favor actualiza tu suscripción principal primero.');
      }

      // 2. Definir montos
      let amountInCents = 2000000; // Default: Mensual 20.000 COP
      let nextPaymentDays = 30;
      let planDescription = "Landing Page Adicional (Mensual)";

      if (planInterval === 'yearly') {
        amountInCents = 20000000; // Anual 200.000 COP
        nextPaymentDays = 365;
        planDescription = "Landing Page Adicional (Anual)";
      }

      const currency = "COP";
      const reference = `sub_landing_${planInterval}_${userId}_${Date.now()}`;

      // 3. Generar firma de integridad
      const wompiIntegritySecret = 'prod_integrity_5arGHVwweUk0dR7WcmKebKvuLGUIUEcU';
      const signatureString = `${reference}${amountInCents}${currency}${wompiIntegritySecret}`;
      const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

      // 4. Realizar el cobro
      console.log(`Iniciando cobro Landing Page (${planInterval}) para ${userEmail}: ${reference}`);

      const headers = {
        Authorization: `Bearer ${wompiPrivateKey}`
      };

      const transactionResponse = await wompiApi.post('/transactions', {
        amount_in_cents: amountInCents,
        currency: currency,
        customer_email: userEmail,
        payment_source_id: paymentSourceId,
        reference: reference,
        signature: signature,
        payment_method: {
          installments: 1
        }
      }, { headers });

      const transaction = transactionResponse.data.data;
      console.log(`Transacción Landing Page creada: ${transaction.id}, Estado: ${transaction.status}`);

      // 5. Guardar estado de la suscripción ADICIONAL (Multi-Landing Page)
      if (transaction.status === 'APPROVED' || transaction.status === 'PENDING') {
        // Create a new document in the landingPages subcollection
        const landingPageRef = await userRef.collection('landingPages').add({
          status: 'active',
          interval: planInterval,
          startDate: admin.firestore.Timestamp.now(),
          nextPaymentDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + nextPaymentDays * 24 * 60 * 60 * 1000)),
          lastTransactionId: transaction.id,
          detailsProvided: false, // New landing page needs details
          createdAt: admin.firestore.Timestamp.now()
        });

        // Guardar en el historial de pagos GENERAL
        await userRef.collection('payments').doc(transaction.id).set({
          paymentId: transaction.id,
          date: admin.firestore.Timestamp.now(),
          amount: amountInCents / 100,
          description: planDescription,
          status: transaction.status,
          reference: reference,
          type: 'landing_page_subscription',
          landingPageId: landingPageRef.id // Link payment to specific LP
        });

        return { status: "success", transactionId: transaction.id, landingPageId: landingPageRef.id };
      } else {
        throw new functions.https.HttpsError('aborted', `El pago fue rechazado: ${transaction.status_message || transaction.status}`);
      }

    } catch (error) {
      console.error("Error al procesar pago Landing Page:", error.response ? error.response.data : error.message);
      if (error.response && error.response.data && error.response.data.error) {
        throw new functions.https.HttpsError('internal', JSON.stringify(error.response.data.error.messages) || 'Error de Wompi.');
      }
      throw new functions.https.HttpsError('internal', error.message || 'No se pudo procesar el pago de la Landing Page.');
    }
  }
);

exports.getWompiAcceptanceToken = onCall(
  {},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    // Usar clave pública de PRODUCCIÓN
    const wompiPublicKey = 'pub_prod_t98LASUQBr0VyCiCw3f4VWVkoBrBh4JX';
    console.log("DEBUG: Usando Public Key:", wompiPublicKey);

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

exports.cancelWompiSubscription = onCall(
  {}, // Eliminar secrets si no se usan para evitar errores de configuración
  async (request) => {
    console.log("Iniciando cancelación de suscripción...");

    if (!request.auth) {
      console.error("Usuario no autenticado.");
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const userId = request.auth.uid;
    console.log(`Usuario autenticado: ${userId}`);

    // Usar clave de PRODUCCIÓN directamente
    // const wompiPrivateKey = 'prv_prod_9iyGRlZiXjzuRC7OeWGrLTdg1uVi5RhC'; // No se usa en este flujo manual

    const db = getFirestore();

    try {
      console.log("Consultando Firestore...");
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        console.log("El documento del usuario no existe.");
      } else {
        console.log("Datos del usuario:", JSON.stringify(userDoc.data()));
      }

      console.log("Actualizando estado en Firestore...");
      await db.collection('users').doc(userId).set({
        subscriptionStatus: 'canceled',
      }, { merge: true });

      console.log(`Suscripción cancelada exitosamente para usuario ${userId}`);
      return { success: true, message: 'La suscripción ha sido cancelada.' };

    } catch (error) {
      console.error("Error CRÍTICO al cancelar la suscripción:", error);
      throw new functions.https.HttpsError('internal', `No se pudo cancelar la suscripción: ${error.message}`);
    }
  }
);

exports.wompiWebhook = onRequest(
  { secrets: ["WOMPI_EVENT_TOKEN"] },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    // Usar token de eventos de PRODUCCIÓN
    const eventsToken = 'prod_events_EA8U2uHfINkWRNIyWcSzOjtpmWNi9hLj';
    const requestBody = req.rawBody.toString();

    // TODO: Implementar la verificación de firma HMAC si Wompi la envía.

    console.log("Webhook de Wompi recibido:", JSON.stringify(req.body));

    const event = req.body;
    const db = getFirestore();

    try {
      const { data, event: eventType } = event;

      if (eventType === 'transaction.updated') {
        const { transaction } = data;
        // Solo nos interesan transacciones aprobadas con referencia de suscripción
        if (transaction.status === 'APPROVED' && transaction.reference && transaction.reference.startsWith('sub_')) {
          // Buscar usuario por referencia o email si es posible, o guardar el pago suelto.
          // En este caso, la referencia tiene el userId: sub_initial_${userId}_...
          const parts = transaction.reference.split('_');
          if (parts.length >= 3) {
            const userId = parts[2];

            // Guardar en el historial de pagos
            const paymentRef = db.collection('users').doc(userId).collection('payments').doc(transaction.id);
            await paymentRef.set({
              paymentId: transaction.id,
              date: admin.firestore.Timestamp.fromDate(new Date(transaction.created_at)),
              amount: transaction.amount_in_cents / 100, // Almacenar en COP
              description: "Pago de suscripción mensual (Webhook)",
              status: 'approved',
              type: 'subscription',
              reference: transaction.reference,
            });
            console.log(`Pago ${transaction.id} registrado para usuario ${userId} vía Webhook`);
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

/**
 * (NUEVO) Notifica al usuario que su sitio web está listo.
 * Se llama desde el Panel de Admin.
 */
exports.notifyUserSiteReady = onCall(
  {
    secrets: ["RESEND_API_KEY"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    // Verificar si es Admin
    if (request.auth.uid !== ADMIN_UID) {
      throw new functions.https.HttpsError('permission-denied', 'Solo el administrador puede realizar esta acción.');
    }

    const { userId, provisionalUrl, dnsInstructions } = request.data;
    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'Falta el ID del usuario.');
    }

    const db = getFirestore();
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Usuario no encontrado.');
      }

      const userData = userDoc.data();
      const userEmail = userData.email;
      const userName = userData.displayName || "Cliente";

      // Guardar información en Firestore para el Dashboard del usuario
      await db.collection('users').doc(userId).update({
        siteReady: true,
        provisionalUrl: provisionalUrl || null,
        dnsInstructions: dnsInstructions || null,
        siteReadyDate: admin.firestore.FieldValue.serverTimestamp()
      });

      const emailHtml = `
        <div style="font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
            <img src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/680535faac041774d1d2256c_CO%CC%81SMICA_Logo_FAV.png?alt=media&token=e40ee3c1-c85c-4967-a814-e8dc3197353a" alt="Logo Cósmica" style="height: 30px; width: auto;">
          </div>
          <div style="padding: 20px 30px;">
            <h1 style="color: #0D0D0D; font-size: 24px; font-weight: 700;">¡Tu sitio web está listo! 🚀</h1>
            <p>Hola, <strong>${userName}</strong>.</p>
            <p>Nos complace informarte que hemos terminado la construcción de tu sitio web.</p>
            
            ${provisionalUrl ? `
            <div style="background-color: #f0f7ff; border-left: 4px solid #3e6cff; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #3e6cff;">Link Provisional:</p>
                <p style="margin: 5px 0 0;"><a href="${provisionalUrl}" target="_blank" style="color: #333; text-decoration: underline;">${provisionalUrl}</a></p>
            </div>` : ''}

            ${dnsInstructions ? `
            <h3 style="color: #0D0D0D; font-size: 18px; margin-top: 25px;">Pasos para conectar tu dominio:</h3>
            <p>Para finalizar la conexión con tu dominio propio, por favor <strong>comunícate con tu proveedor de dominio</strong> (donde compraste tu .com) e infórmales que deseas cambiar los registros DNS por los siguientes:</p>
            
            <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #b78a00;">Registros DNS:</p>
                <p style="margin: 5px 0 0; white-space: pre-wrap; font-family: monospace;">${dnsInstructions}</p>
            </div>
            
            <p>Una vez realices este cambio, avísanos para activar el certificado SSL final.</p>` : ''}

            <p style="margin-top: 30px;">Por favor, ingresa a tu cuenta para ver todos los detalles.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://app.cosmicaweb.com" style="background-color: #3e6cff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a mi cuenta</a>
            </div>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: "Cósmica Web <notificaciones@send.cosmicaweb.com>",
        to: userEmail,
        subject: "¡Tu sitio web está listo! 🚀",
        html: emailHtml,
      });

      console.log(`Notificación de sitio listo enviada a ${userEmail}`);
      return { success: true, message: 'Notificación enviada.' };

    } catch (error) {
      console.error("Error al enviar notificación de sitio listo:", error);
      throw new functions.https.HttpsError('internal', 'No se pudo enviar la notificación.');
    }
  }
);

/**
 * Registra una nueva visita a la página web de un cliente.
 * Se llama desde un Pixel o Script en el frontend del cliente.
 * URL: https://us-central1-plataforma-cosmica.cloudfunctions.net/trackVisit?userId=XXX
 */
exports.trackVisit = onRequest(
  { cors: true }, // Habilita CORS automáticamente para cualquier origen
  async (req, res) => {
    const userId = req.query.userId;
    // Pixel transparente 1x1 GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    if (!userId) {
      res.status(200).set('Content-Type', 'image/gif').send(pixel);
      return;
    }

    try {
      const db = getFirestore();
      const userRef = db.collection('users').doc(userId);
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

      const batch = db.batch();

      // 1. Update Global Total
      batch.update(userRef, {
        visitCount: admin.firestore.FieldValue.increment(1),
        lastVisit: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Update Monthly Stat
      const monthRef = userRef.collection('analytics_monthly').doc(monthKey);
      batch.set(monthRef, {
        visitCount: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await batch.commit();

      res.set('Content-Type', 'image/gif');
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.status(200).send(pixel);

    } catch (error) {
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.warn(`TrackVisit: Usuario no encontrado (${userId})`);
      } else {
        console.error(`Error tracking visit for user ${userId}:`, error);
      }
      res.status(200).set('Content-Type', 'image/gif').send(pixel);
    }
  }
);

/**
 * Registra un nuevo clic en la página web de un cliente.
 * Se llama desde el Script en el frontend del cliente.
 * URL: https://us-central1-plataforma-cosmica.cloudfunctions.net/trackClick?userId=XXX
 */
exports.trackClick = onRequest(
  { cors: true },
  async (req, res) => {
    const userId = req.query.userId;
    // Pixel transparente
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    if (!userId) {
      res.status(200).set('Content-Type', 'image/gif').send(pixel);
      return;
    }

    try {
      const db = getFirestore();
      const userRef = db.collection('users').doc(userId);
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

      const batch = db.batch();

      // 1. Update Global Total
      batch.update(userRef, {
        clickCount: admin.firestore.FieldValue.increment(1),
        lastClick: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Update Monthly Stat
      const monthRef = userRef.collection('analytics_monthly').doc(monthKey);
      batch.set(monthRef, {
        clickCount: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await batch.commit();

      res.set('Content-Type', 'image/gif');
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.status(200).send(pixel);

    } catch (error) {
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.warn(`TrackClick: Usuario no encontrado (${userId})`);
      } else {
        console.error(`Error tracking click for user ${userId}:`, error);
      }
      res.status(200).set('Content-Type', 'image/gif').send(pixel);
    }
  }
);

/**
 * Notifica al Admin cuando un usuario envía los detalles de su Landing Page.
 * Trigger: Update en users/{userId}/landingPages/{landingPageId}
 */
exports.notifyLandingPageSubmission = onDocumentUpdated(
  { document: "users/{userId}/landingPages/{landingPageId}" },
  async (event) => {
    const newData = event.data.after.data();
    const previousData = event.data.before.data();
    const userId = event.params.userId;
    const landingPageId = event.params.landingPageId;

    // Verificar si detalles ("details") cambió o fue agregado
    const newDetails = newData.details;
    const oldDetails = previousData.details;

    // Solo notificar si hay nuevos detalles y son diferentes a los anteriores (o no existían)
    if (newDetails && (!oldDetails || JSON.stringify(newDetails) !== JSON.stringify(oldDetails))) {

      const adminEmail = "simonquintana90@gmail.com";
      const db = getFirestore();

      // Obtener info del usuario para el email
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data() || {};

      const mailOptions = {
        from: '"Plataforma Cósmica" <hola@cosmica.agency>',
        to: adminEmail,
        subject: `🚀 Nueva Solicitud de Landing Page - ${userData.displayName || 'Usuario'}`,
        html: `
          <h1>¡Nueva Landing Page Solicitada!</h1>
          <p>El usuario <strong>${userData.displayName}</strong> (${userData.email}) ha enviado los detalles para su Landing Page adicional (ID: ${landingPageId}).</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Objetivo:</strong> ${newDetails.goal}</p>
            <p><strong>Título Sugerido:</strong> ${newDetails.title}</p>
            <p><strong>Descripción:</strong><br/>${newDetails.description}</p>
            ${newDetails.fileUrl ? `<p><strong>Archivo adjunto:</strong> <a href="${newDetails.fileUrl}">Ver Archivo</a></p>` : ''}
          </div>

          <p>
            <a href="https://plataforma-cosmica.web.app/admin/user/${userId}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Ver Usuario en Admin
            </a>
          </p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Notificación de Landing Page enviada para ${landingPageId} (User: ${userId})`);
      } catch (error) {
        console.error("Error al enviar email de notificación:", error);
      }
    }
  }
);

/**
 * Cancela SUBCRIPCIÓN DE LANDING PAGE ADICIONAL.
 * Recibe: landingPageId
 */
exports.cancelLandingPageSubscription = onCall(
  {},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'El usuario debe estar autenticado.');
    }

    const { landingPageId } = request.data;
    if (!landingPageId) {
      throw new functions.https.HttpsError('invalid-argument', 'Falta el ID de la Landing Page.');
    }

    const userId = request.auth.uid;
    const db = getFirestore();
    const landingPageRef = db.collection('users').doc(userId).collection('landingPages').doc(landingPageId);

    try {
      await landingPageRef.update({
        status: "cancelled",
        cancelledAt: admin.firestore.Timestamp.now()
      });
      return { status: 'success', message: 'Suscripción cancelada.' };
    } catch (error) {
      console.error("Error cancelando landing page:", error);
      throw new functions.https.HttpsError('internal', 'No se pudo cancelar la suscripción.');
    }
  }
);

/**
 * Genera una Cuenta de Cobro (PDF) para un pago específico.
 * Retorna el PDF en base64 para descarga directa.
 */
exports.generateInvoice = onCall(
  {},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado.');
    }

    const { paymentId } = request.data;
    if (!paymentId) throw new functions.https.HttpsError('invalid-argument', 'Falta el ID del pago.');

    const userId = request.auth.uid;
    const db = getFirestore();

    try {
      // 1. Obtener datos del pago
      const paymentRef = db.collection('users').doc(userId).collection('payments').doc(paymentId);
      const paymentDoc = await paymentRef.get();
      if (!paymentDoc.exists) throw new functions.https.HttpsError('not-found', 'Pago no encontrado.');
      const payment = paymentDoc.data();

      // 2. Obtener datos del usuario (Cliente)
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const userProfile = userData.profile || {};

      // 3. Generar PDF
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve({
            pdfBase64: pdfData.toString('base64'),
            filename: `Factura_Cosmica_${paymentId.substring(0, 8)}.pdf`
          });
        });

        doc.on('error', (err) => {
          console.error("Error PDFKit:", err);
          reject(new functions.https.HttpsError('internal', 'Error generando PDF'));
        });

        // --- DISEÑO DE LA FACTURA ---

        // Encabezado
        // Encabezado
        doc.fillColor('#0f172a') // Slate-900 like
          .font('Helvetica-Bold')
          .fontSize(24)
          .text('CÓSMICA', 50, 50)
          .fontSize(10)
          .font('Helvetica')
          .text('Software & Design Agency', 50, 75)
          .moveDown();

        doc.fillColor('#444444')
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('FACTURA DE VENTA', 350, 50, { align: 'right' })
          .font('Helvetica')
          .fontSize(9)
          .text('Simón Quintana Sanabria', 200, 80, { align: 'right' })
          .text('NIT: 1020756190-1', 200, 92, { align: 'right' })
          .text('Régimen: Persona Natural no responsable de IVA', 200, 104, { align: 'right' })
          .text('3183929342', 200, 116, { align: 'right' })
          .text('Vereda Pozo Hondo Tabio Casa 57A', 200, 128, { align: 'right' })
          .text('simonquintana90@gmail.com', 200, 140, { align: 'right' })
          .text('Tabio, Cundinamarca', 200, 152, { align: 'right' })
          .moveDown();

        // Separador
        doc.moveTo(50, 170).lineTo(550, 170).stroke();

        // Datos del Cliente
        doc.text(`Cliente: ${userData.displayName || userData.contactName || 'Cliente'}`, 50, 190)
          .text(`NIT/CC: ${userProfile.nit || 'N/A'}`, 50, 205)
          .text(`Dirección: ${userProfile.address || 'N/A'}`, 50, 220)
          .text(`Teléfono: ${userProfile.phone || 'N/A'}`, 50, 235)
          .moveDown();

        // Detalles de la Factura
        const invoiceDate = payment.date ? payment.date.toDate().toLocaleDateString('es-CO') : new Date().toLocaleDateString('es-CO');

        doc.text(`No. Documento: ${paymentId.substring(0, 8).toUpperCase()}`, 350, 190, { align: 'right' })
          .text(`Fecha: ${invoiceDate}`, 350, 205, { align: 'right' })
          .text(`Estado: PAGADO`, 350, 220, { align: 'right' })
          .moveDown();

        // Tabla de Items
        const invoiceTableTop = 280;
        doc.font('Helvetica-Bold');
        doc.text('Descripción', 50, invoiceTableTop)
          .text('Valor', 450, invoiceTableTop, { width: 90, align: 'right' });
        doc.moveTo(50, invoiceTableTop + 15).lineTo(550, invoiceTableTop + 15).stroke();
        doc.font('Helvetica');

        // Item 1
        const amount = payment.amount || 0;
        const baseDescription = payment.description || 'Servicios Digitales';
        const description = `${baseDescription} | Cloud Computing Service`;

        doc.text(description, 50, invoiceTableTop + 30, { width: 380 })
          .text(`$ ${amount.toLocaleString('es-CO')}`, 450, invoiceTableTop + 30, { width: 90, align: 'right' });

        // Total
        const totalPosition = invoiceTableTop + 60;
        doc.moveTo(50, totalPosition - 10).lineTo(550, totalPosition - 10).stroke();
        doc.font('Helvetica-Bold');
        doc.text('Total a Pagar:', 350, totalPosition, { width: 90, align: 'right' })
          .text(`$ ${amount.toLocaleString('es-CO')}`, 450, totalPosition, { width: 90, align: 'right' });

        // Pie de página / Términos
        doc.font('Helvetica')
          .fontSize(9)
          .text('El numeral 21 del artículo 476 del estatuto tributario establece que los servicios de computación en la nube se encuentran excluidos de IVA.', 50, 680, { align: 'center', width: 500 })
          .font('Helvetica-Bold')
          .text('Gracias por confiar en Cósmica.', 50, 715, { align: 'center', width: 500 });

        doc.end();
      });

    } catch (error) {
      console.error("Error generando factura:", error);
      throw new functions.https.HttpsError('internal', 'No se pudo generar la factura.');
    }
  }
);

// --- RECURRING PAYMENTS SCHEDULER ---

/**
 * Core Logic to Process Recurring Paymets
 * This function is shared by the Scheduled Trigger and the Manual Trigger.
 */
async function runRecurringPaymentsLogic() {
  const db = getFirestore();
  const now = admin.firestore.Timestamp.now();

  // 1. Get Active Users with Due Payments
  // Note: Firestore requires a composite index for 'subscriptionStatus' and 'nextPaymentDate'.
  // If it fails, check the Firebase Console logs for the index creation link.
  const usersQuery = db.collection('users')
    .where('subscriptionStatus', '==', 'active')
    .where('nextPaymentDate', '<=', now);

  const snapshot = await usersQuery.get();
  const results = { processed: 0, success: 0, failed: 0, errors: [] };

  if (snapshot.empty) {
    console.log("No subscriptions due for renewal.");
    return results;
  }

  console.log(`Found ${snapshot.size} subscriptions due for renewal.`);

  // Process sequentially to avoid rate limits or memory issues
  for (const doc of snapshot.docs) {
    const user = doc.data();
    const userId = doc.id;
    const userEmail = user.email;

    results.processed++;
    console.log(`Processing renewal for user: ${userEmail} (${userId})`);

    try {
      const paymentSourceId = user.wompiPaymentSourceId;
      if (!paymentSourceId) {
        throw new Error("No payment source (card) found for user.");
      }

      // Determine Amount
      const interval = user.subscriptionInterval || 'monthly';
      let amountInCents = (interval === 'yearly') ? 100000000 : 8990000; // Default prices
      let nextPaymentDays = (interval === 'yearly') ? 365 : 30;
      let description = (interval === 'yearly') ? "Renovación Suscripción Anual" : "Renovación Suscripción Mensual";

      // Apply Recurring Coupon (if logic allows)
      // Simplify for now: Use base price. 
      // TODO: Logic to check 'recurringCoupon' field and apply discount again if valid.

      const currency = "COP";
      const reference = `renew_${userId}_${Date.now()}`;

      // Generate Signature
      const wompiIntegritySecret = 'prod_integrity_5arGHVwweUk0dR7WcmKebKvuLGUIUEcU';
      const signatureString = `${reference}${amountInCents}${currency}${wompiIntegritySecret}`;
      const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

      // Charge Wompi
      // Usar Private Key de PROD
      const wompiPrivateKey = 'prv_prod_9iyGRlZiXjzuRC7OeWGrLTdg1uVi5RhC';

      const response = await axios.post(`${WOMPI_API_BASE}/transactions`, {
        amount_in_cents: amountInCents,
        currency: currency,
        customer_email: userEmail,
        payment_source_id: paymentSourceId,
        reference: reference,
        signature: signature,
        payment_method: { installments: 1 }
      }, {
        headers: { Authorization: `Bearer ${wompiPrivateKey}` }
      });

      const transaction = response.data.data;

      if (transaction.status === 'APPROVED' || transaction.status === 'PENDING') {
        // Success
        results.success++;

        // Update User's Next Payment Date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + nextPaymentDays);

        await db.collection('users').doc(userId).update({
          nextPaymentDate: admin.firestore.Timestamp.fromDate(nextDate),
          lastTransactionId: transaction.id
        });

        // Record Payment
        await db.collection('users').doc(userId).collection('payments').doc(transaction.id).set({
          paymentId: transaction.id,
          date: admin.firestore.Timestamp.now(),
          amount: amountInCents / 100,
          description: description,
          status: transaction.status,
          reference: reference,
          type: 'subscription_renewal'
        });

        console.log(`Renewal SUCCESS for ${userEmail}. Trans: ${transaction.id}`);

      } else {
        // Failed / Declined
        results.failed++;
        console.error(`Renewal DECLINED for ${userEmail}. Status: ${transaction.status}`);
        results.errors.push({ userId, error: `Declined: ${transaction.status}` });

        // Optional: Mark subscription as past_due or failed
        // await db.collection('users').doc(userId).update({ subscriptionStatus: 'past_due' });
      }

    } catch (error) {
      console.error(`Error renewing user ${userId}:`, error.message);
      results.failed++;
      results.errors.push({ userId, error: error.message });
    }
  }

  return results;
}

/**
 * Scheduled Function: Runs every day to check for due payments.
 */
exports.processRecurringPayments = onSchedule("every 24 hours", async (event) => {
  console.log("Starting Scheduled Recurring Payments Check...");
  await runRecurringPaymentsLogic();
  console.log("Finished Scheduled Recurring Payments Check.");
});

/**
 * Manual Trigger: Allows Admin to force the check (e.g. to catch up missed payments).
 */
exports.forceRecurringPayments = onCall(
  { secrets: ["WOMPI_PRIVATE_KEY"] }, // Optional secrets if needed
  async (request) => {
    if (!request.auth || request.auth.uid !== ADMIN_UID) {
      throw new functions.https.HttpsError('permission-denied', 'Solo el admin puede forzar pagos.');
    }

    console.log("Admin forced recurring payments check.");
    const result = await runRecurringPaymentsLogic();
    return { message: "Proceso completado", result };
  }
);