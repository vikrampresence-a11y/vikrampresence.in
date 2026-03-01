/**
 * ===================================================================
 * WEBHOOK CONTROLLER — Bulletproof Razorpay Webhook Handler
 * ===================================================================
 *
 * This is the MOST CRITICAL security & fulfillment component.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │  Razorpay fires `payment.captured` webhook              │
 * │         ↓                                               │
 * │  1. Verify crypto signature (HMAC SHA256)              │
 * │         ↓                                               │
 * │  2. Idempotency check (PocketBase webhook_events)      │
 * │         ↓                                               │
 * │  3. Extract notes (email, phone, product_id)           │
 * │         ↓                                               │
 * │  4. Generate Firebase signed URL (48h expiry)          │
 * │         ↓                                               │
 * │  5. Send premium email via Gmail SMTP                  │
 * │         ↓                                               │
 * │  6. Update purchase record → SUCCESS                   │
 * │         ↓                                               │
 * │  7. ALWAYS return 200 OK to Razorpay                   │
 * └─────────────────────────────────────────────────────────┘
 *
 * Security:
 * - Cryptographic HMAC SHA256 signature validation
 * - Idempotency via payment_id deduplication
 * - Firebase signed URLs (anti-piracy, 48h expiry)
 * - Never exposes permanent download links
 * - Always returns 200 to prevent Razorpay retry storms
 *
 * ===================================================================
 */

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import pb, { authenticateAdmin } from '../lib/pocketbaseAdmin.js';
import { generateSignedUrl } from '../lib/firebaseAdmin.js';

// ─── Gmail SMTP Transporter (Singleton) ──────────────────────────────
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

    logger.info('Gmail SMTP transporter initialized for webhook delivery');
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

    // ══════════════════════════════════════════════════════════════════
    // STEP 1: CRYPTOGRAPHIC SIGNATURE VALIDATION
    // ══════════════════════════════════════════════════════════════════
    // Razorpay signs the raw request body with your webhook secret.
    // We regenerate the HMAC and compare. If mismatch → hacker/tampering.

    const receivedSignature = req.headers['x-razorpay-signature'];

    if (!receivedSignature) {
        logger.error('🚫 Webhook rejected — missing x-razorpay-signature header');
        return res.status(400).json({ error: 'Missing signature header' });
    }

    // req.body is a Buffer because we use express.raw() for this route
    const rawBody = typeof req.body === 'string' ? req.body : req.body.toString('utf8');

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

    if (expectedSignature !== receivedSignature) {
        logger.error('🚫 Webhook rejected — INVALID SIGNATURE (possible tampering)');
        return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    logger.info('✅ Webhook signature verified — request is authentic');

    // ══════════════════════════════════════════════════════════════════
    // STEP 2: PARSE PAYLOAD & FILTER EVENT
    // ══════════════════════════════════════════════════════════════════

    let payload;
    try {
        payload = JSON.parse(rawBody);
    } catch (parseError) {
        logger.error('🚫 Webhook rejected — invalid JSON body:', parseError.message);
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    const eventType = payload.event;

    // We ONLY process payment.captured — ignore everything else
    if (eventType !== 'payment.captured') {
        logger.info(`⏭️  Ignoring webhook event: ${eventType}`);
        return res.status(200).json({ status: 'ignored', event: eventType });
    }

    logger.info(`📩 Processing webhook event: ${eventType}`);

    // Extract payment entity
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
        logger.error('🚫 Webhook payload missing payment entity');
        return res.status(200).json({ status: 'error', message: 'Missing payment entity' });
    }

    const paymentId = paymentEntity.id;
    const orderId = paymentEntity.order_id;
    const amountPaise = paymentEntity.amount;
    const notes = paymentEntity.notes || {};

    logger.info(`💰 Payment captured: ${paymentId} | Order: ${orderId} | Amount: ₹${amountPaise / 100}`);

    // ══════════════════════════════════════════════════════════════════
    // STEP 3: IDEMPOTENCY CHECK (Prevent duplicate processing)
    // ══════════════════════════════════════════════════════════════════
    // Razorpay can fire the same webhook multiple times. We check if
    // this payment_id was already processed. If yes → skip silently.

    try {
        if (!pb.authStore.isValid) {
            await authenticateAdmin();
        }

        // Check if this payment was already processed
        const existingEvents = await pb.collection('webhook_events').getFullList({
            filter: `payment_id="${paymentId}"`,
            $autoCancel: false,
        });

        if (existingEvents.length > 0) {
            logger.warn(`⚠️  Duplicate webhook — payment ${paymentId} already processed. Skipping.`);
            return res.status(200).json({ status: 'duplicate', paymentId });
        }

        // Record this payment to prevent future duplicates
        await pb.collection('webhook_events').create({
            payment_id: paymentId,
            order_id: orderId,
            event_type: eventType,
            amount: amountPaise / 100,
            status: 'processing',
            raw_payload: rawBody,
        }, { $autoCancel: false });

        logger.info(`✅ New payment ${paymentId} recorded — idempotency check passed`);

    } catch (idempotencyError) {
        // If DB is down, we still process to avoid missing deliveries
        // The worst case is a duplicate email, which is better than no email
        logger.error(`⚠️  Idempotency check failed (DB error): ${idempotencyError.message}. Proceeding anyway.`);
    }

    // ══════════════════════════════════════════════════════════════════
    // STEP 4: EXTRACT CUSTOMER & PRODUCT DATA FROM NOTES
    // ══════════════════════════════════════════════════════════════════

    const customerEmail = notes.customer_email || '';
    const customerPhone = notes.customer_phone || '';
    const productId = notes.productId || '';
    const productTitle = notes.productTitle || 'Your Digital Product';

    if (!customerEmail) {
        logger.error(`🚫 No customer_email in notes for payment ${paymentId}. Cannot deliver.`);
        // Still return 200 to Razorpay to prevent retries
        // Log for manual reconciliation
        await updateWebhookEvent(paymentId, 'failed_no_email');
        return res.status(200).json({ status: 'error', message: 'No customer email in notes' });
    }

    logger.info(`📧 Delivering to: ${customerEmail} | Product: ${productTitle} (${productId})`);

    // ══════════════════════════════════════════════════════════════════
    // STEP 5: GENERATE FIREBASE SIGNED URL (Anti-Piracy)
    // ══════════════════════════════════════════════════════════════════
    // Instead of sending a permanent public URL, we generate a
    // temporary signed URL that expires in 48 hours.

    let downloadUrl = '';

    try {
        // Look up the Firebase Storage path from PocketBase products collection
        let firebasePath = '';

        if (productId) {
            try {
                if (!pb.authStore.isValid) {
                    await authenticateAdmin();
                }
                const product = await pb.collection('products').getOne(productId, { $autoCancel: false });
                firebasePath = product.firebasePath || '';
            } catch (productErr) {
                logger.warn(`Could not fetch product ${productId} from DB: ${productErr.message}`);
            }
        }

        if (firebasePath) {
            downloadUrl = await generateSignedUrl(firebasePath, 48);
            logger.info(`🔗 Signed URL generated for "${firebasePath}" — 48h expiry`);
        } else {
            logger.warn(`⚠️  No firebasePath found for product ${productId}. Email will be sent without download link.`);
        }
    } catch (urlError) {
        logger.error(`❌ Failed to generate signed URL: ${urlError.message}`);
        // Continue — send email without download link, log for manual fix
    }

    // ══════════════════════════════════════════════════════════════════
    // STEP 6: SEND PREMIUM DELIVERY EMAIL
    // ══════════════════════════════════════════════════════════════════
    // Wrapped in try-catch. We ALWAYS return 200 to Razorpay regardless
    // of email success. This prevents Razorpay retry storms.

    try {
        const transporter = getGmailTransporter();
        const gmailUser = process.env.GMAIL_USER;

        const htmlBody = buildDeliveryEmailHtml({
            productTitle,
            paymentId,
            downloadUrl,
            amountPaid: amountPaise / 100,
        });

        await transporter.sendMail({
            from: `Vikram Presence <${gmailUser}>`,
            to: customerEmail,
            subject: `Your ${productTitle} is Ready! 🎉 — Vikram Presence`,
            html: htmlBody,
        });

        logger.info(`✅ Delivery email sent to ${customerEmail} for "${productTitle}"`);

    } catch (emailError) {
        // CRITICAL: Do NOT let email failure propagate.
        // Log it for manual reconciliation, but return 200 to Razorpay.
        logger.error(`❌ EMAIL DELIVERY FAILED for ${customerEmail}: ${emailError.message}`);
        logger.error(`    Payment: ${paymentId} | Product: ${productTitle}`);
        logger.error(`    Signed URL: ${downloadUrl ? 'Generated' : 'Not available'}`);
        logger.error(`    ⚠️  MANUAL ACTION REQUIRED: Resend product to ${customerEmail}`);
    }

    // ══════════════════════════════════════════════════════════════════
    // STEP 7: UPDATE PURCHASE RECORD IN POCKETBASE
    // ══════════════════════════════════════════════════════════════════

    try {
        if (!pb.authStore.isValid) {
            await authenticateAdmin();
        }

        // Find and update the purchase record
        const purchases = await pb.collection('purchases').getFullList({
            filter: `orderId="${orderId}"`,
            $autoCancel: false,
        });

        if (purchases.length > 0) {
            await pb.collection('purchases').update(purchases[0].id, {
                status: 'SUCCESS',
                paymentId: paymentId,
            }, { $autoCancel: false });
            logger.info(`✅ Purchase record updated to SUCCESS for order ${orderId}`);
        }

        // Update webhook event status
        await updateWebhookEvent(paymentId, 'completed');

    } catch (dbError) {
        logger.error(`⚠️  DB update failed after email delivery: ${dbError.message}`);
        // Non-blocking — email already sent
    }

    // ══════════════════════════════════════════════════════════════════
    // STEP 8: ALWAYS RETURN 200 OK TO RAZORPAY
    // ══════════════════════════════════════════════════════════════════

    logger.info(`🏁 Webhook processing complete for payment ${paymentId}`);

    return res.status(200).json({
        status: 'processed',
        paymentId,
        orderId,
    });
};


// ─── Helper: Update webhook event status ─────────────────────────────
const updateWebhookEvent = async (paymentId, status) => {
    try {
        if (!pb.authStore.isValid) {
            await authenticateAdmin();
        }

        const events = await pb.collection('webhook_events').getFullList({
            filter: `payment_id="${paymentId}"`,
            $autoCancel: false,
        });

        if (events.length > 0) {
            await pb.collection('webhook_events').update(events[0].id, {
                status,
            }, { $autoCancel: false });
        }
    } catch (err) {
        logger.error(`Failed to update webhook_event status: ${err.message}`);
    }
};


// ─── Premium Delivery Email HTML Template ────────────────────────────
const buildDeliveryEmailHtml = ({ productTitle, paymentId, downloadUrl, amountPaid }) => {
    const hasDownloadLink = !!downloadUrl;

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
        Thank you for your purchase! ${hasDownloadLink ? 'Click the button below to access your product.' : 'Your product access details will be shared shortly.'}
      </p>

      ${hasDownloadLink ? `
      <!-- CTA Download Button -->
      <a href="${downloadUrl}" 
         style="display:inline-block;background:linear-gradient(135deg, #FFD700, #FFA500);color:#000000;padding:18px 48px;font-size:16px;font-weight:800;text-decoration:none;border-radius:50px;letter-spacing:2px;text-transform:uppercase;box-shadow:0 4px 15px rgba(255,215,0,0.4);">
        ACCESS YOUR PRODUCT →
      </a>

      <!-- Link Expiry Warning -->
      <div style="background:#1a1a00;border:1px solid #333300;border-radius:12px;padding:15px;margin:25px 0;">
        <p style="color:#FFD700;font-size:12px;margin:0;letter-spacing:1px;">
          ⏰ This download link expires in <strong>48 hours</strong>
        </p>
        <p style="color:#888;font-size:11px;margin:5px 0 0;">
          Download your product now and save it to your device.
        </p>
      </div>

      <p style="color:#666;font-size:12px;margin:20px 0 0;line-height:1.5;">
        Direct link (copy if button doesn't work):<br>
        <a href="${downloadUrl}" style="color:#FFD700;word-break:break-all;font-size:11px;">${downloadUrl.substring(0, 80)}...</a>
      </p>
      ` : `
      <div style="background:#1a1a00;border:1px solid #333300;border-radius:12px;padding:20px;margin:10px 0;">
        <p style="color:#FFD700;font-size:14px;margin:0;">
          📬 Your download link will be sent separately. If you don't receive it within 1 hour, please reply to this email.
        </p>
      </div>
      `}
    </div>

    <!-- Support Section -->
    <div style="background:#0a0a0a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="color:#999;font-size:12px;margin:0;text-align:center;">
        Need help? Reply to this email or contact us at<br>
        <a href="mailto:vikramyeragadindla@gmail.com" style="color:#FFD700;">vikramyeragadindla@gmail.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #222;padding:25px 0;text-align:center;">
      <p style="color:#444;font-size:11px;margin:0;letter-spacing:1px;">
        Save this email — it contains your purchase confirmation.
      </p>
      <p style="color:#333;font-size:10px;margin:10px 0 0;">
        © Vikram Presence. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`;
};
