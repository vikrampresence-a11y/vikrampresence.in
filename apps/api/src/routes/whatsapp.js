import express from 'express';
import { sendWhatsappMock } from '../controllers/whatsappController.js';

const router = express.Router();

// Mock endpoint for WhatsApp integration
router.post('/send-whatsapp', sendWhatsappMock);

export default router;
