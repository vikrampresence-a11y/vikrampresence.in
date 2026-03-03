import logger from '../utils/logger.js';

export const sendWhatsappMock = async (req, res) => {
    const { customerPhone, productName, googleDriveLink } = req.body;

    if (!customerPhone || !googleDriveLink) {
        return res.status(400).json({ error: 'customerPhone and googleDriveLink are required' });
    }

    const message = `Hi, thank you for trusting Vikram Presence.\nYour purchase is complete.\nDownload your product here 👇\n${googleDriveLink}`;

    logger.info(`[WHATSAPP MOCK] Triggered for ${customerPhone}. Message:\n${message}`);

    res.json({
        success: true,
        message: 'WhatsApp mock message sent',
    });
};
