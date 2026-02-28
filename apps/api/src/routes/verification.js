import express from 'express';
import { verifyEmail, sendOtp, verifyOtp } from '../controllers/verificationController.js';

const router = express.Router();

// POST /verification/verify-email
router.post('/verify-email', verifyEmail);

// POST /verification/send-otp
router.post('/send-otp', sendOtp);

// POST /verification/verify-otp
router.post('/verify-otp', verifyOtp);

export default router;
