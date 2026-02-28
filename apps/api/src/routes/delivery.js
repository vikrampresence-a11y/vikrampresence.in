import express from 'express';
import { deliverProduct } from '../controllers/deliveryController.js';

const router = express.Router();

// POST /deliver-product
router.post('/deliver-product', deliverProduct);

export default router;
