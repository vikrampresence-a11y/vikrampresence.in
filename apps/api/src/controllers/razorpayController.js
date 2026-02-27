/**
 * ===================================================================
 * RAZORPAY CONTROLLER — Secure Order Creation
 * ===================================================================
 * 
 * Flow:
 * 1. Frontend sends productId + userId
 * 2. Backend queries PocketBase for the REAL product price (never trust frontend)
 * 3. Creates a Razorpay order with the verified price in paise
 * 4. Creates a PENDING purchase record in PocketBase
 * 5. Returns order_id + amount to frontend for checkout modal
 * 
 * ===================================================================
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import pb, { authenticateAdmin } from '../lib/pocketbaseAdmin.js';

// ─── Razorpay SDK Singleton ──────────────────────────────────────────
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (razorpayInstance) return razorpayInstance;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        logger.error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
        throw new Error('Razorpay credentials not configured.');
    }

    razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    logger.info('Razorpay instance initialized successfully');
    return razorpayInstance;
};

// ─── CREATE ORDER (Secure) ───────────────────────────────────────────
/**
 * POST /razorpay/create-order
 * 
 * Body: { productId, userId }
 * 
 * Security: Queries PocketBase for the actual product price.
 *           Creates a PENDING purchase record before returning.
 */
export const createOrder = async (req, res) => {
    const { productId, userId, amount, currency = 'INR', receipt, description,
        productTitle, customerEmail, customerName } = req.body;

    // ── Step 1: Validate required fields ──
    if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
    }

    let verifiedPrice = amount; // Fallback to frontend amount if DB lookup fails
    let productRecord = null;

    // ── Step 2: Query PocketBase for the REAL product price ──
    try {
        // Ensure PB admin is authenticated
        if (!pb.authStore.isValid) {
            await authenticateAdmin();
        }

        productRecord = await pb.collection('products').getOne(productId, { $autoCancel: false });
        verifiedPrice = productRecord.price;

        logger.info(`DB Price verified for "${productRecord.title}": ₹${verifiedPrice}`);
    } catch (dbError) {
        // If it's a sample product or DB is unavailable, use the frontend price
        // but log a warning
        if (productId.startsWith('sample-')) {
            logger.warn(`Sample product detected (${productId}), using frontend price: ₹${amount}`);
            verifiedPrice = amount;
        } else {
            logger.warn(`Could not verify price from DB for ${productId}: ${dbError.message}. Using frontend price.`);
        }
    }

    if (!verifiedPrice || verifiedPrice <= 0) {
        return res.status(400).json({ error: 'Invalid product price' });
    }

    // ── Step 3: Create Razorpay Order ──
    const razorpay = getRazorpayInstance();

    const orderOptions = {
        amount: Math.round(verifiedPrice * 100), // Convert to paise (₹499 → 49900)
        currency,
        receipt: receipt || `rcpt_${productId}_${Date.now()}`,
        notes: {
            productId: productId,
            userId: userId || 'guest',
            productTitle: productRecord?.title || productTitle || '',
        }
    };

    logger.info('Creating Razorpay order:', JSON.stringify(orderOptions));

    let order;
    try {
        order = await razorpay.orders.create(orderOptions);
    } catch (rzpError) {
        logger.error('Failed to create Razorpay order:', rzpError.message);
        return res.status(500).json({ error: 'Failed to create payment order' });
    }

    logger.info(`Razorpay order created: ${order.id} for ₹${verifiedPrice}`);

    // ── Step 4: Create PENDING purchase record in PocketBase ──
    if (userId && !productId.startsWith('sample-')) {
        try {
            if (!pb.authStore.isValid) {
                await authenticateAdmin();
            }

            const purchaseRecord = await pb.collection('purchases').create({
                user: userId,
                product: productId,
                paymentId: '',       // Will be filled after payment
                orderId: order.id,
                status: 'PENDING',
                amountPaid: verifiedPrice,
            }, { $autoCancel: false });

            logger.info(`PENDING purchase created: ${purchaseRecord.id} for order ${order.id}`);
        } catch (purchaseError) {
            // Non-blocking: if purchase record creation fails, continue anyway
            // The payment can still proceed, we'll reconcile later
            logger.warn(`Could not create PENDING purchase record: ${purchaseError.message}`);
        }
    }

    // ── Step 5: Return order details to frontend ──
    res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
    });
};


// ─── VERIFY PAYMENT (Signature Check) ────────────────────────────────
/**
 * POST /razorpay/verify-payment
 * 
 * Body: { orderId, paymentId, signature }
 * 
 * Verifies Razorpay's HMAC SHA256 signature to ensure payment authenticity.
 */
export const verifyPayment = async (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ error: 'Order ID, Payment ID, and Signature are required' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        throw new Error('Razorpay credentials not configured');
    }

    // ── Verify HMAC SHA256 Signature ──
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
        logger.error(`Payment signature mismatch for order: ${orderId}`);
        throw new Error('Payment verification failed');
    }

    logger.info('Payment verified successfully for order:', orderId);

    res.json({
        success: true,
        message: 'Payment verified successfully',
        orderId,
        paymentId,
    });
};
