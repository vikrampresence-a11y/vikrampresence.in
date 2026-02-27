import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utils/logger.js';

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

export const createOrder = async (req, res) => {
    const { amount, currency = 'INR', receipt, description } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    const razorpay = getRazorpayInstance();

    const orderOptions = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
    };

    if (description) {
        orderOptions.description = description;
    }

    logger.info('Creating Razorpay order with options:', orderOptions);

    const order = await razorpay.orders.create(orderOptions);

    logger.info('Razorpay order created successfully:', order.id);

    res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
    });
};

export const verifyPayment = async (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ error: 'Order ID, Payment ID, and Signature are required' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        throw new Error('Razorpay credentials not configured');
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
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
