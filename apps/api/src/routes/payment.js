import express from 'express';
import { verifyPayment } from '../controllers/paymentController.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validate Razorpay secret key at startup
const razorpaySecretKey = process.env.RAZORPAY_KEY_SECRET;
logger.info('Razorpay Secret Key loaded:', razorpaySecretKey ? 'YES' : 'NO');
if (!razorpaySecretKey) {
  logger.warn('Razorpay secret key not configured. Set RAZORPAY_KEY_SECRET in .env');
}

// Verify payment endpoint
router.post('/verify-payment', verifyPayment);

export default router;
