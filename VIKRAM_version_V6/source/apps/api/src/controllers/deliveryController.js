import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════
// DELIVERY CONTROLLER
// Sends Email (Nodemailer / Gmail SMTP) after purchase
// ═══════════════════════════════════════════════

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

  logger.info('Gmail SMTP transporter initialized for delivery');
  return gmailTransporter;
};

/**
 * POST /deliver-product
 * Body: { email, phone, productName, driveLink, paymentId }
 */
export const deliverProduct = async (req, res) => {
  const { email, phone, productName, driveLink, paymentId } = req.body;

  if (!email || !productName || !driveLink) {
    return res.status(400).json({
      error: 'email, productName, and driveLink are required',
    });
  }

  const results = { emailSent: false };

  // ── SEND EMAIL via Nodemailer (Gmail SMTP) ──
  try {
    const transporter = getGmailTransporter();
    const gmailUser = process.env.GMAIL_USER;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;padding:30px 0;border-bottom:1px solid #222;">
      <h1 style="color:#FFD700;font-size:28px;margin:0;letter-spacing:2px;">VIKRAM PRESENCE</h1>
    </div>

    <!-- Body -->
    <div style="padding:40px 0;text-align:center;">
      <div style="background:#111;border:2px solid #FFD700;border-radius:16px;padding:30px;margin-bottom:30px;">
        <p style="color:#FFD700;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Payment Successful</p>
        <h2 style="color:#ffffff;font-size:24px;margin:0 0 5px;">${productName}</h2>
        ${paymentId ? `<p style="color:#666;font-size:11px;margin:5px 0 0;font-family:monospace;">Payment ID: ${paymentId}</p>` : ''}
      </div>

      <p style="color:#cccccc;font-size:16px;line-height:1.6;margin:0 0 30px;">
        Thank you for your purchase! Click the button below to access your product.
      </p>

      <!-- CTA Button -->
      <a href="${driveLink}" 
         style="display:inline-block;background:#FFD700;color:#000000;padding:18px 48px;font-size:16px;font-weight:800;text-decoration:none;border-radius:50px;letter-spacing:2px;text-transform:uppercase;">
        ACCESS YOUR PRODUCT →
      </a>

      <p style="color:#666;font-size:13px;margin:25px 0 0;line-height:1.5;">
        You can also copy this link:<br>
        <a href="${driveLink}" style="color:#FFD700;word-break:break-all;">${driveLink}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #222;padding:25px 0;text-align:center;">
      <p style="color:#444;font-size:11px;margin:0;letter-spacing:1px;">
        Save this email — it's your permanent access to the product.
      </p>
      <p style="color:#333;font-size:10px;margin:10px 0 0;">
        © Vikram Presence. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `Vikram Presence <${gmailUser}>`,
      to: email,
      subject: `Your ${productName} is ready! 🎉 — Vikram Presence`,
      html: htmlBody,
    });

    results.emailSent = true;
    logger.info(`✅ Delivery email sent to ${email} for "${productName}"`);
  } catch (err) {
    logger.error('❌ Email delivery failed:', err.message || err);
  }

  // ── Response ──
  res.json({
    success: true,
    message: 'Delivery processed',
    ...results,
  });
};
