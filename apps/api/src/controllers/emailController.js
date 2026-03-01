import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════
// EMAIL CONTROLLER — Gmail SMTP (Nodemailer)
// Purged: Resend / Hostinger SMTP. Now pure Gmail.
// ═══════════════════════════════════════════════

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

  logger.info('✅ Gmail SMTP transporter initialized (email controller)');
  return gmailTransporter;
};

/**
 * POST /send-product-email
 * Body: { buyerEmail, productId, productName, googleDriveLink }
 */
export const sendProductEmail = async (req, res) => {
  const { buyerEmail, productId, productName, googleDriveLink } = req.body;

  if (!buyerEmail || !productName || !googleDriveLink) {
    return res.status(400).json({ error: 'buyerEmail, productName, and googleDriveLink are required' });
  }

  try {
    const transporter = getGmailTransporter();
    const gmailUser = process.env.GMAIL_USER;

    const subject = `Your ${productName} is Ready! 🎉 — Vikram Presence`;
    const htmlBody = buildProductEmail({ productName, googleDriveLink });

    await transporter.sendMail({
      from: `Vikram Presence <${gmailUser}>`,
      replyTo: gmailUser,
      to: buyerEmail,
      subject,
      html: htmlBody,
    });

    logger.info(`✅ Product email sent to ${buyerEmail} for "${productName}"`);

    res.json({
      success: true,
      message: 'Email sent via Gmail SMTP',
    });
  } catch (err) {
    logger.error('❌ Email delivery failed:', err.message || err);
    // Non-blocking: still return success to frontend
    res.json({
      success: false,
      message: 'Email delivery failed, but payment is safe.',
      error: err.message,
    });
  }
};


// ─── Premium Product Email Template ──────────────────────────────────
const buildProductEmail = ({ productName, googleDriveLink }) => {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;padding:30px 0;border-bottom:1px solid #1c1c1c;">
      <h1 style="color:#FFD700;font-size:24px;margin:0;letter-spacing:3px;text-transform:uppercase;">VIKRAM PRESENCE</h1>
      <p style="color:#555;font-size:10px;margin:8px 0 0;letter-spacing:3px;text-transform:uppercase;">Digital Product Delivery</p>
    </div>

    <!-- Body -->
    <div style="padding:40px 0;text-align:center;">
      <div style="background:#0e0e0e;border:1px solid rgba(255,215,0,0.15);border-radius:16px;padding:30px;margin-bottom:30px;">
        <div style="font-size:42px;margin-bottom:12px;">🎉</div>
        <p style="color:#FFD700;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Payment Successful</p>
        <h2 style="color:#ffffff;font-size:22px;margin:0;letter-spacing:-0.5px;">${productName}</h2>
      </div>

      <p style="color:#999;font-size:15px;line-height:1.7;margin:0 0 30px;">
        Thank you for your purchase! Click the button below to access your product instantly.
      </p>

      <!-- CTA Button -->
      <a href="${googleDriveLink}" 
         style="display:inline-block;background:#FFD700;color:#000000;padding:16px 48px;font-size:14px;font-weight:800;text-decoration:none;border-radius:50px;letter-spacing:2px;text-transform:uppercase;">
        ACCESS YOUR PRODUCT →
      </a>

      <p style="color:#555;font-size:12px;margin:25px 0 0;line-height:1.6;">
        Direct link:<br>
        <a href="${googleDriveLink}" style="color:#FFD700;word-break:break-all;font-size:11px;">${googleDriveLink}</a>
      </p>
    </div>

    <!-- Support -->
    <div style="background:#0c0c0c;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="color:#666;font-size:11px;margin:0;text-align:center;">
        Need help? Reply to this email or contact<br>
        <a href="mailto:vikramyeragadindla@gmail.com" style="color:#FFD700;">vikramyeragadindla@gmail.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1a1a1a;padding:25px 0;text-align:center;">
      <p style="color:#333;font-size:10px;margin:0;letter-spacing:1px;">Save this email — it's your permanent product access.</p>
      <p style="color:#222;font-size:9px;margin:8px 0 0;">© Vikram Presence. All rights reserved.</p>
    </div>

  </div>
</body>
</html>`;
};
