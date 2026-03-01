/**
 * ===================================================================
 * VERIFICATION CONTROLLER — Email OTP via Nodemailer (Gmail SMTP)
 * ===================================================================
 *
 * Two handlers:
 *   1. sendEmailOtp   — Generate 4-digit OTP, store in memory, send via Gmail SMTP
 *   2. verifyEmailOtp — Compare entered OTP, delete on match (prevent reuse)
 *
 * ===================================================================
 */

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import pb, { authenticateAdmin } from '../lib/pocketbaseAdmin.js';

// ─── In-Memory OTP Store ─────────────────────────────────────────────
// Map<email, { otp: string, expiresAt: number, timer: NodeJS.Timeout }>
const emailOtpStore = new Map();

// ─── Constants ───────────────────────────────────────────────────────
const OTP_TTL_MS = 5 * 60 * 1000;  // 5 minutes
const OTP_LENGTH = 4;

// Strict email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

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

    logger.info('Gmail SMTP transporter initialized');
    return gmailTransporter;
};


// ===================================================================
// 1. SEND EMAIL OTP
// ===================================================================
/**
 * POST /verification/send-email-otp
 * Body: { email }
 */
export const sendEmailOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Validate format
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Generate 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    // Clear any existing OTP for this email
    if (emailOtpStore.has(email)) {
        clearTimeout(emailOtpStore.get(email).timer);
        emailOtpStore.delete(email);
    }

    // Store OTP with TTL
    const timer = setTimeout(() => {
        emailOtpStore.delete(email);
        logger.info(`Email OTP expired for: ${email}`);
    }, OTP_TTL_MS);

    emailOtpStore.set(email, {
        otp,
        expiresAt: Date.now() + OTP_TTL_MS,
        timer,
    });

    logger.info(`Email OTP generated for ${email}: ${otp}`);

    // Send via Gmail SMTP
    try {
        const transporter = getGmailTransporter();
        const gmailUser = process.env.GMAIL_USER;

        await transporter.sendMail({
            from: `Vikram Presence <${gmailUser}>`,
            to: email,
            subject: 'Your Vikram Presence Verification Code',
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;padding:20px 0;border-bottom:1px solid #222;">
      <h1 style="color:#FFD700;font-size:24px;margin:0;letter-spacing:2px;">VIKRAM PRESENCE</h1>
    </div>
    <div style="padding:40px 0;text-align:center;">
      <p style="color:#999;font-size:13px;text-transform:uppercase;letter-spacing:3px;margin:0 0 20px;">Verification Code</p>
      <div style="background:#111;border:2px solid #FFD700;border-radius:16px;padding:30px;display:inline-block;">
        <span style="color:#FFD700;font-size:42px;font-weight:800;letter-spacing:12px;font-family:monospace;">${otp}</span>
      </div>
      <p style="color:#ccc;font-size:14px;margin:25px 0 0;line-height:1.6;">
        This code is valid for <strong style="color:#FFD700;">5 minutes</strong>.<br>
        Do not share this code with anyone.
      </p>
    </div>
    <div style="border-top:1px solid #222;padding:20px 0;text-align:center;">
      <p style="color:#444;font-size:10px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`,
        });

        logger.info(`✅ Email OTP sent to ${email}`);
        return res.status(200).json({ success: true, message: 'OTP sent to your email' });

    } catch (mailError) {
        logger.error('❌ Gmail SMTP error:', mailError.message || mailError);
        // Clean up the stored OTP since we couldn't send it
        clearTimeout(emailOtpStore.get(email)?.timer);
        emailOtpStore.delete(email);
        return res.status(500).json({
            success: false,
            error: 'Failed to send verification email. Please try again.',
        });
    }
};


// ===================================================================
// 2. VERIFY EMAIL OTP
// ===================================================================
/**
 * POST /verification/verify-email-otp
 * Body: { email, otp }
 */
export const verifyEmailOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ verified: false, error: 'Email and OTP are required' });
    }

    // Look up stored OTP
    const storedEntry = emailOtpStore.get(email);

    if (!storedEntry) {
        return res.status(400).json({
            verified: false,
            error: 'No OTP found for this email. Please request a new one.',
        });
    }

    // Check expiry
    if (Date.now() > storedEntry.expiresAt) {
        clearTimeout(storedEntry.timer);
        emailOtpStore.delete(email);
        return res.status(400).json({
            verified: false,
            error: 'OTP has expired. Please request a new one.',
        });
    }

    // Compare OTP
    if (storedEntry.otp !== otp.trim()) {
        return res.status(400).json({
            verified: false,
            error: 'Incorrect OTP. Please try again.',
        });
    }

    // ✅ Match — delete to prevent reuse
    clearTimeout(storedEntry.timer);
    emailOtpStore.delete(email);

    logger.info(`✅ Email OTP verified for ${email}`);

    // ── Auto-Account Creation via PocketBase ──
    try {
        if (!pb.authStore.isValid) {
            await authenticateAdmin();
        }

        let userRecord;
        let token;

        // 1. Check if user already exists
        try {
            userRecord = await pb.collection('users').getFirstListItem(`email="${email}"`);
            logger.info(`User already exists for email: ${email}`);

            // We need to generate a token for this user so frontend can log in. 
            // Since we are admin, we can't easily impersonate without knowing the password, but we can reset or issue a token via impersonation if configured, OR we can generate a random password, update the user, and auth.
            // A safer flow is generating an auth token directly if PocketBase version allows, but lacking that, we can simply generate a new temporary password, update it, and authenticate to get the token.
            const tempPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
            await pb.collection('users').update(userRecord.id, {
                password: tempPassword,
                passwordConfirm: tempPassword
            });
            const authResult = await pb.collection('users').authWithPassword(email, tempPassword);
            token = authResult.token;
            userRecord = authResult.record;

            // Restore admin auth
            await authenticateAdmin();

        } catch (err) {
            // 2. User doesn't exist, create them
            const generatedPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
            logger.info(`Creating new user account for: ${email}`);

            userRecord = await pb.collection('users').create({
                email: email,
                emailVisibility: true,
                password: generatedPassword,
                passwordConfirm: generatedPassword,
                verified: true, // Auto-verify since they just passed OTP
                name: email.split('@')[0], // Default name
            });

            // Authenticate to get their token
            const authResult = await pb.collection('users').authWithPassword(email, generatedPassword);
            token = authResult.token;

            // Restore admin auth for backend operations
            await authenticateAdmin();
        }

        return res.status(200).json({
            verified: true,
            message: 'Email verified successfully',
            user: userRecord,
            token: token
        });

    } catch (pbError) {
        logger.error(`PocketBase auto-account creation failed for ${email}:`, pbError.message);
        // We still return true for verification so the flow doesn't completely break, 
        // but the user won't be auto-logged in.
        return res.status(200).json({
            verified: true,
            message: 'Email verified successfully, but auto-login failed.',
        });
    }
};
