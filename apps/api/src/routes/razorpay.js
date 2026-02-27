import express from 'express';
import { createOrder, verifyPayment } from '../controllers/razorpayController.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validate Razorpay API keys at startup
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

logger.info('Razorpay Key ID loaded:', keyId ? 'YES' : 'NO');
logger.info('Razorpay Key Secret loaded:', keySecret ? 'YES' : 'NO');

// Create order endpoint
router.post('/create-order', createOrder);

// Verify payment endpoint
router.post('/verify-payment', verifyPayment);

export default router;