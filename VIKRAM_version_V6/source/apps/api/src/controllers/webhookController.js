/**
 * ===================================================================
 * WEBHOOK CONTROLLER — OTP-Style Lightweight Delivery
 * ===================================================================
 *
 * The SIMPLEST, most reliable webhook handler possible.
 * Uses the exact same nodemailer pattern as the working Email OTP flow.
 *
 * Flow:
 *   1. Verify crypto signature (HMAC SHA256)
 *   2. Filter for payment.captured only
 *   3. Idempotency check (PocketBase)
 *   4. Extract customer_email from notes
 *   5. Send product email via Gmail SMTP (static download URL)
 *   6. ALWAYS return 200 OK immediately
 *
 * Zero heavy SDKs. Zero firebase-admin. Pure nodemailer.
 *
 * ===================================================================
 */

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import pb, { authenticateAdmin } from '../lib/pocketbaseAdmin.js';

// ─── Gmail SMTP Transporter (Singleton) ──────────────────────────────
// Exact same config as the working Email OTP flow
let gmailTransporter = null;

const getGmailTransporter = () => {
    if (gmailTransporter) return gmailTransporter;

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
        logger.error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
        throw new Error('Gmail SMTP credentials not configured.');
    }

    gmailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    });

    logger.info('✅ Gmail SMTP transporter initialized (webhook delivery)');
    return gmailTransporter;
};


// ═══════════════════════════════════════════════════════════════════════
// RAZORPAY WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════════════

export const handleRazorpayWebhook = async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
        logger.error('RAZORPAY_WEBHOOK_SECRET not configured in .env');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // ──────────────────────────────────────────────────────────────────
    // STEP 1: CRYPTO SIGNATURE VALIDATION
    // ──────────────────────────────────────────────────────────────────
    const receivedSignature = req.headers['x-razorpay-signature'];

    if (!receivedSignature) {
        logger.error('🚫 Webhook rejected — missing x-razorpay-signature');
        return res.status(400).json({ error: 'Missing signature header' });
    }

    const rawBody = typeof req.body === 'string' ? req.body : req.body.toString('utf8');

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

    if (expectedSignature !== receivedSignature) {
        logger.error('🚫 Webhook rejected — INVALID SIGNATURE');
        return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    logger.info('✅ Webhook signature verified');

    // ──────────────────────────────────────────────────────────────────
    // STEP 2: PARSE & FILTER EVENT
    // ──────────────────────────────────────────────────────────────────
    let payload;
    try {
        payload = JSON.parse(rawBody);
    } catch (err) {
        logger.error('🚫 Invalid JSON body:', err.message);
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    if (payload.event !== 'payment.captured') {
        logger.info(`⏭️  Ignoring event: ${payload.event}`);
        return res.status(200).json({ status: 'ignored' });
    }

    const paymentEntity = payload.payload?.payment?.entity;
    if (!paymentEntity) {
        logger.error('🚫 Missing payment entity in payload');
        return res.status(200).json({ status: 'error' });
    }

    const paymentId = paymentEntity.id;
    const orderId = paymentEntity.order_id;
    const amountPaid = paymentEntity.amount / 100;
    const notes = paymentEntity.notes || {};

    logger.info(`💰 Payment captured: ${paymentId} | ₹${amountPaid}`);

    // ──────────────────────────────────────────────────────────────────
    // STEP 3: IDEMPOTENCY CHECK (prevent duplicate emails)
    // ──────────────────────────────────────────────────────────────────
    try {
        if (!pb.authStore.isValid) await authenticateAdmin();

        const existing = await pb.collection('webhook_events').getFullList({
            filter: `payment_id="${paymentId}"`,
            $autoCancel: false,
        });

        if (existing.length > 0) {
            logger.warn(`⚠️  Duplicate — ${paymentId} already processed. Skipping.`);
            return res.status(200).json({ status: 'duplicate' });
        }

        await pb.collection('webhook_events').create({
            payment_id: paymentId,
            order_id: orderId,
            event_type: 'payment.captured',
            amount: amountPaid,
            status: 'processing',
        }, { $autoCancel: false });

        logger.info(`✅ Idempotency passed — ${paymentId} recorded`);
    } catch (dbErr) {
        logger.error(`⚠️  Idempotency DB error: ${dbErr.message}. Proceeding anyway.`);
    }

    // ──────────────────────────────────────────────────────────────────
    // STEP 4: EXTRACT DATA FROM NOTES
    // ──────────────────────────────────────────────────────────────────
    const customerEmail = notes.customer_email || '';
    const productTitle = notes.productTitle || 'Your Digital Product';
    const downloadUrl = process.env.PRODUCT_DOWNLOAD_URL || '';

    if (!customerEmail) {
        logger.error(`🚫 No customer_email in notes for ${paymentId}`);
        return res.status(200).json({ status: 'error', message: 'No email in notes' });
    }

    // ──────────────────────────────────────────────────────────────────
    // STEP 5: SEND EMAIL (Non-blocking, then return 200 immediately)
    // ──────────────────────────────────────────────────────────────────
    // Fire-and-forget: send the email but return 200 to Razorpay NOW
    // This prevents Razorpay retry storms even if email is slow

    // Return 200 to Razorpay IMMEDIATELY
    res.status(200).json({ status: 'processed', paymentId });
    logger.info(`✅ 200 OK sent to Razorpay for ${paymentId}`);

    // Now send email in background (non-blocking)
    try {
        const transporter = getGmailTransporter();
        const gmailUser = process.env.GMAIL_USER;

        await transporter.sendMail({
            from: `Vikram Presence <${gmailUser}>`,
            to: customerEmail,
            subject: `Your ${productTitle} is Ready! 🎉 — Vikram Presence`,
            html: buildDeliveryEmail({ productTitle, paymentId, downloadUrl, amountPaid }),
        });

        logger.info(`✅ Delivery email sent to ${customerEmail}`);

        // Update webhook event status
        try {
            if (!pb.authStore.isValid) await authenticateAdmin();
            const events = await pb.collection('webhook_events').getFullList({
                filter: `payment_id="${paymentId}"`, $autoCancel: false,
            });
            if (events.length > 0) {
                await pb.collection('webhook_events').update(events[0].id, { status: 'completed' }, { $autoCancel: false });
            }
        } catch (e) { /* non-critical */ }

        // Update purchase record
        try {
            if (!pb.authStore.isValid) await authenticateAdmin();
            const purchases = await pb.collection('purchases').getFullList({
                filter: `orderId="${orderId}"`, $autoCancel: false,
            });
            if (purchases.length > 0) {
                await pb.collection('purchases').update(purchases[0].id, {
                    status: 'SUCCESS', paymentId,
                }, { $autoCancel: false });
                logger.info(`✅ Purchase marked SUCCESS for order ${orderId}`);
            }
        } catch (e) { /* non-critical */ }

    } catch (emailError) {
        logger.error(`❌ EMAIL FAILED for ${customerEmail}: ${emailError.message}`);
        logger.error(`   Payment: ${paymentId} | Product: ${productTitle}`);
        logger.error(`   ⚠️  MANUAL ACTION: Resend product to ${customerEmail}`);
    }
};


// ─── Premium Delivery Email ──────────────────────────────────────────
const buildDeliveryEmail = ({ productTitle, paymentId, downloadUrl, amountPaid }) => {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;padding:30px 0;border-bottom:1px solid #222;">
      <h1 style="color:#FFD700;font-size:28px;margin:0;letter-spacing:2px;">VIKRAM PRESENCE</h1>
      <p style="color:#666;font-size:11px;margin:8px 0 0;letter-spacing:3px;text-transform:uppercase;">Digital Product Delivery</p>
    </div>

    <!-- Success Badge -->
    <div style="padding:40px 0;text-align:center;">
      <div style="background:#111;border:2px solid #FFD700;border-radius:16px;padding:30px;margin-bottom:30px;">
        <div style="font-size:48px;margin-bottom:10px;">✅</div>
        <p style="color:#FFD700;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Payment Successful</p>
        <h2 style="color:#ffffff;font-size:24px;margin:0 0 5px;">${productTitle}</h2>
        <p style="color:#888;font-size:13px;margin:5px 0 0;">Amount Paid: ₹${amountPaid}</p>
        ${paymentId ? `<p style="color:#555;font-size:10px;margin:8px 0 0;font-family:monospace;">Payment ID: ${paymentId}</p>` : ''}
      </div>

      <p style="color:#cccccc;font-size:16px;line-height:1.6;margin:0 0 30px;">
        Thank you for your purchase! Click the button below to access your product.
      </p>

      ${downloadUrl ? `
      <!-- Download Button -->
      <a href="${downloadUrl}" 
         style="display:inline-block;background:linear-gradient(135deg, #FFD700, #FFA500);color:#000000;padding:18px 48px;font-size:16px;font-weight:800;text-decoration:none;border-radius:50px;letter-spacing:2px;text-transform:uppercase;box-shadow:0 4px 15px rgba(255,215,0,0.4);">
        ACCESS YOUR PRODUCT →
      </a>

      <p style="color:#666;font-size:12px;margin:20px 0 0;line-height:1.5;">
        Direct link:<br>
        <a href="${downloadUrl}" style="color:#FFD700;word-break:break-all;font-size:11px;">${downloadUrl}</a>
      </p>
      ` : `
      <div style="background:#1a1a00;border:1px solid #333300;border-radius:12px;padding:20px;margin:10px 0;">
        <p style="color:#FFD700;font-size:14px;margin:0;">
          📬 Your download link will be sent separately. Reply to this email if you don't receive it within 1 hour.
        </p>
      </div>
      `}
    </div>

    <!-- Support -->
    <div style="background:#0a0a0a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="color:#999;font-size:12px;margin:0;text-align:center;">
        Need help? Reply to this email or contact<br>
        <a href="mailto:vikramyeragadindla@gmail.com" style="color:#FFD700;">vikramyeragadindla@gmail.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #222;padding:25px 0;text-align:center;">
      <p style="color:#444;font-size:11px;margin:0;letter-spacing:1px;">Save this email — it's your purchase confirmation.</p>
      <p style="color:#333;font-size:10px;margin:10px 0 0;">© Vikram Presence. All rights reserved.</p>
    </div>

  </div>
</body>
</html>`;
};
