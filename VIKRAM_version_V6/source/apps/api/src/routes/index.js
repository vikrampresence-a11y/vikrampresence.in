import { Router } from 'express';
import healthCheck from './health-check.js';
import razorpayRouter from './razorpay.js';
import emailRouter from './email.js';
import whatsappRouter from './whatsapp.js';
import paymentRouter from './payment.js';
import ebooksRouter from './ebooks.js';
import deliveryRouter from './delivery.js';
import verificationRouter from './verification.js';
import webhookRouter from './webhook.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/razorpay', razorpayRouter);
    router.use('/email', emailRouter);
    router.use('/whatsapp', whatsappRouter);
    router.use('/payment', paymentRouter);
    router.use('/ebooks', ebooksRouter);
    router.use('/verification', verificationRouter);
    router.use('/', webhookRouter);
    router.use('/', deliveryRouter);

    return router;
};
