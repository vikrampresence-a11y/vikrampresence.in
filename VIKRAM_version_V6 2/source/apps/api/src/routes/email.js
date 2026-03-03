import express from 'express';
import { sendProductEmail } from '../controllers/emailController.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Gmail SMTP credentials check at startup
const gmailUser = process.env.GMAIL_USER;
logger.info('Gmail User loaded:', gmailUser ? 'YES' : 'NO');

// Send product email endpoint
router.post('/send-product-email', sendProductEmail);

export default router;