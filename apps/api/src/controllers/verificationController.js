/**
 * ===================================================================
 * VERIFICATION CONTROLLER — Email MX + Phone OTP
 * ===================================================================
 *
 * Three handlers:
 *   1. verifyEmail  — Regex + DNS MX record check (no OTP needed)
 *   2. sendOtp      — Generate 6-digit OTP, store in memory, send via Fast2SMS
 *   3. verifyOtp    — Compare entered OTP, delete on match
 *
 * ===================================================================
 */

import dns from 'dns';
import logger from '../utils/logger.js';

// ─── In-Memory OTP Store ─────────────────────────────────────────────
// Map<phone, { otp: string, expiresAt: number, timer: NodeJS.Timeout }>
const otpStore = new Map();

// ─── Constants ───────────────────────────────────────────────────────
const OTP_TTL_MS = 5 * 60 * 1000;  // 5 minutes
const OTP_LENGTH = 6;

// Strict email regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Indian phone: exactly 10 digits (after stripping +91 / 91 prefix)
const PHONE_REGEX = /^[6-9]\d{9}$/;

// ===================================================================
// 1. VERIFY EMAIL — Regex + DNS MX Lookup
// ===================================================================
/**
 * POST /verification/verify-email
 * Body: { email }
 *
 * Steps:
 *   1. Validate email format with regex
 *   2. Extract domain
 *   3. Query DNS MX records for the domain
 *   4. If MX records exist → email domain is real
 */
export const verifyEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ valid: false, error: 'Email is required' });
    }

    // Step 1: Regex validation
    if (!EMAIL_REGEX.test(email)) {
        logger.info(`Email format invalid: ${email}`);
        return res.status(200).json({ valid: false, error: 'Invalid email format' });
    }

    // Step 2: Extract domain
    const domain = email.split('@')[1];
    if (!domain) {
        return res.status(200).json({ valid: false, error: 'Invalid email domain' });
    }

    // Step 3: DNS MX record lookup
    try {
        const mxRecords = await dns.promises.resolveMx(domain);

        if (mxRecords && mxRecords.length > 0) {
            logger.info(`✅ Email domain verified: ${domain} (${mxRecords.length} MX records)`);
            return res.status(200).json({ valid: true });
        } else {
            logger.info(`❌ No MX records for domain: ${domain}`);
            return res.status(200).json({ valid: false, error: 'Email domain does not accept mail' });
        }
    } catch (dnsError) {
        // ENOTFOUND, ENODATA, etc. — domain doesn't exist or has no MX
        logger.info(`❌ DNS lookup failed for ${domain}: ${dnsError.code || dnsError.message}`);
        return res.status(200).json({ valid: false, error: 'Email domain is not valid' });
    }
};


// ===================================================================
// 2. SEND OTP — Generate + Store + Fast2SMS
// ===================================================================
/**
 * POST /verification/send-otp
 * Body: { phone }
 *
 * Steps:
 *   1. Validate phone number format
 *   2. Generate a secure 6-digit OTP
 *   3. Store OTP in memory with 5-minute TTL
 *   4. Send OTP via Fast2SMS
 */
export const sendOtp = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Clean phone: remove +91, 91 prefix, spaces, dashes
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');

    // Validate format
    if (!PHONE_REGEX.test(cleanPhone)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid phone number. Enter a valid 10-digit Indian mobile number.',
        });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Clear any existing OTP for this phone
    if (otpStore.has(cleanPhone)) {
        clearTimeout(otpStore.get(cleanPhone).timer);
        otpStore.delete(cleanPhone);
    }

    // Store OTP with TTL
    const timer = setTimeout(() => {
        otpStore.delete(cleanPhone);
        logger.info(`OTP expired and removed for: ${cleanPhone}`);
    }, OTP_TTL_MS);

    otpStore.set(cleanPhone, {
        otp,
        expiresAt: Date.now() + OTP_TTL_MS,
        timer,
    });

    logger.info(`OTP generated for ${cleanPhone}: ${otp}`);

    // Send via Fast2SMS
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (!fast2smsKey || fast2smsKey === 'YOUR_FAST2SMS_API_KEY_HERE') {
        logger.warn('FAST2SMS_API_KEY not configured — OTP stored but not sent');
        return res.status(200).json({
            success: true,
            message: 'OTP generated (SMS delivery not configured)',
        });
    }

    try {
        const smsMessage = `Your Vikram Presence verification OTP is ${otp}. It is valid for 5 minutes.`;

        const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': fast2smsKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                route: 'q',
                message: smsMessage,
                language: 'english',
                flash: 0,
                numbers: cleanPhone,
            }),
        });

        const smsData = await smsResponse.json();

        if (smsData.return === true) {
            logger.info(`✅ OTP SMS sent to ${cleanPhone}`);
            return res.status(200).json({ success: true, message: 'OTP sent successfully' });
        } else {
            logger.error('❌ Fast2SMS error:', smsData.message || smsData);
            return res.status(500).json({
                success: false,
                error: 'Failed to send OTP. Please try again.',
            });
        }
    } catch (smsError) {
        logger.error('❌ Fast2SMS request failed:', smsError.message || smsError);
        return res.status(500).json({
            success: false,
            error: 'SMS service unavailable. Please try again later.',
        });
    }
};


// ===================================================================
// 3. VERIFY OTP — Compare + Delete on Match
// ===================================================================
/**
 * POST /verification/verify-otp
 * Body: { phone, otp }
 *
 * Steps:
 *   1. Clean and validate phone
 *   2. Look up stored OTP
 *   3. Compare — if match, delete OTP (prevent reuse)
 */
export const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ verified: false, error: 'Phone and OTP are required' });
    }

    // Clean phone
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');

    // Look up stored OTP
    const storedEntry = otpStore.get(cleanPhone);

    if (!storedEntry) {
        return res.status(400).json({
            verified: false,
            error: 'No OTP found for this number. Please request a new one.',
        });
    }

    // Check expiry
    if (Date.now() > storedEntry.expiresAt) {
        clearTimeout(storedEntry.timer);
        otpStore.delete(cleanPhone);
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

    // ✅ Match — delete OTP to prevent reuse
    clearTimeout(storedEntry.timer);
    otpStore.delete(cleanPhone);

    logger.info(`✅ OTP verified for ${cleanPhone}`);

    return res.status(200).json({
        verified: true,
        message: 'Phone number verified successfully',
    });
};
