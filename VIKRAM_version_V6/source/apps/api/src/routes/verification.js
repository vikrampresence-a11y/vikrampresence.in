import express from 'express';
import { sendEmailOtp, verifyEmailOtp } from '../controllers/verificationController.js';

const router = express.Router();

// POST /verification/send-email-otp
router.post('/send-email-otp', sendEmailOtp);

// POST /verification/verify-email-otp
router.post('/verify-email-otp', verifyEmailOtp);

export default router;
