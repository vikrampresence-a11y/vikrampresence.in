import crypto from 'crypto';
import logger from '../utils/logger.js';

export const verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature, productId, buyerEmail, buyerPhone, productName, googleDriveLink } = req.body;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'orderId, paymentId, and signature are required' });
  }

  if (!buyerEmail || !productName || !googleDriveLink) {
    return res.status(400).json({ error: 'buyerEmail, productName, and googleDriveLink are required' });
  }

  const razorpaySecretKey = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpaySecretKey) {
    throw new Error('Razorpay secret key not configured. Set RAZORPAY_KEY_SECRET in .env');
  }

  // Verify Razorpay signature
  const hmac = crypto.createHmac('sha256', razorpaySecretKey);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== signature) {
    throw new Error('Payment verification failed');
  }

  logger.info('Razorpay signature verified successfully for order:', orderId);

  // Send product email
  logger.info('Sending product email to:', buyerEmail);
  const emailResponse = await fetch('http://localhost:3001/email/send-product-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buyerEmail,
      productId,
      productName,
      googleDriveLink,
    }),
  });

  if (!emailResponse.ok) {
    throw new Error(`Failed to send product email: ${emailResponse.statusText}`);
  }

  logger.info('Product email sent successfully');

  // Send WhatsApp message if phone is provided
  if (buyerPhone) {
    logger.info('Triggering WhatsApp automation for:', buyerPhone);
    try {
      const whatsappResponse = await fetch('http://localhost:3001/whatsapp/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: buyerPhone,
          productName,
          googleDriveLink,
        }),
      });
      if (!whatsappResponse.ok) {
        logger.warn(`Failed to trigger WhatsApp message: ${whatsappResponse.statusText}`);
      } else {
        logger.info('WhatsApp automation triggered successfully');
      }
    } catch (err) {
      logger.error('Error hitting WhatsApp endpoint:', err);
    }
  }

  res.json({
    success: true,
    productLink: googleDriveLink,
  });
};
