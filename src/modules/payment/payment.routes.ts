// backend/src/modules/payment/payment.routes.ts
import { Router } from 'express';
import * as PaymentController from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Initiate payment (Protected - Tourist only)
router.post(
  '/initiate',
  authenticate,
  PaymentController.initiatePayment
);

// SSLCommerz callback URLs (Public - no auth needed)
router.post('/success', PaymentController.paymentSuccess);
router.post('/fail', PaymentController.paymentFail);
router.post('/cancel', PaymentController.paymentCancel);
router.post('/ipn', PaymentController.paymentIPN);

// Verify payment (Protected)
router.get(
  '/verify/:transactionId',
  authenticate,
  PaymentController.verifyPayment
);

// Refund (Protected - Admin/Guide only)
router.post(
  '/refund',
  authenticate,
  PaymentController.requestRefund
);

export default router;