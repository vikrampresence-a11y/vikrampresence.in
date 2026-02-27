
import { Router } from 'express';
import healthCheck from './health-check.js';
import razorpayRouter from './razorpay.js';
import emailRouter from './email.js';
import whatsappRouter from './whatsapp.js';
import paymentRouter from './payment.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/razorpay', razorpayRouter);
    router.use('/email', emailRouter);
    router.use('/whatsapp', whatsappRouter);
    router.use('/payment', paymentRouter);

    return router;
};
