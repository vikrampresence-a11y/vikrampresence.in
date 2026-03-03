/**
 * Webhook Route
 * POST /razorpay-webhook — Razorpay webhook endpoint
 * 
 * IMPORTANT: This route uses express.raw() middleware (configured in main.js)
 * to preserve the raw body for HMAC signature verification.
 */

import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Razorpay webhook endpoint
router.post('/razorpay-webhook', handleRazorpayWebhook);

export default router;
