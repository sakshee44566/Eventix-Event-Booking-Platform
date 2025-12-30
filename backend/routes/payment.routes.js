import express from 'express';
import {
  createPaymentIntent,
  handleStripeWebhook,
  getPayment,
  getUserPayments
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Webhook route - must use raw body for Stripe signature verification
// This route is public and doesn't use JSON parser
router.post('/webhook', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

// Protected routes
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.get('/', getUserPayments);
router.get('/:id', getPayment);

export default router;

