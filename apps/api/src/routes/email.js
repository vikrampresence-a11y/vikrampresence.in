import express from 'express';
import { sendProductEmail } from '../controllers/emailController.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validate SMTP credentials at startup
const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;

logger.info('SMTP Host loaded:', smtpHost ? 'YES' : 'NO');
logger.info('SMTP User loaded:', smtpUser ? 'YES' : 'NO');

// Send product email endpoint
router.post('/send-product-email', sendProductEmail);

export default router;