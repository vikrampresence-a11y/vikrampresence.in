import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporterInstance = null;

const getTransporter = () => {
    if (transporterInstance) return transporterInstance;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        logger.error('SMTP credentials not configured.');
        throw new Error('SMTP credentials not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env');
    }

    transporterInstance = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: true,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    return transporterInstance;
};

export const sendProductEmail = async (req, res) => {
    const { buyerEmail, productId, productName, googleDriveLink } = req.body;

    if (!buyerEmail || !productName || !googleDriveLink) {
        return res.status(400).json({ error: 'buyerEmail, productName, and googleDriveLink are required' });
    }

    const transporter = getTransporter();
    const smtpUser = process.env.SMTP_USER;

    const subject = `Your ${productName} is ready! 🎉`;
    const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Thank you for trusting Vikram Presence! 🙏</h2>
      <p>Your <strong>${productName}</strong> is ready to download.</p>
      <p>
        <a href="${googleDriveLink}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Download Your Product
        </a>
      </p>
      <p>You can access this anytime using the link above.</p>
      <p>Enjoy your journey! 🚀</p>
      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        - Vikram Presence Team
      </p>
    </div>
  `;

    const mailOptions = {
        from: smtpUser,
        to: buyerEmail,
        subject,
        html: htmlBody,
    };

    logger.info(`Sending product email to ${buyerEmail} for product: ${productName}`);

    await transporter.sendMail(mailOptions);

    logger.info(`Product email sent successfully to ${buyerEmail}`);

    res.json({
        success: true,
        message: 'Email sent',
    });
};
