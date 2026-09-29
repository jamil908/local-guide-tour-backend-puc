// backend/src/modules/payment/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as PaymentService from './payment.service';
import { successResponse } from '../../utils/resoponse'; 
import { AuthRequest } from '../../middlewares/auth.middleware';

export const initiatePayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId, amount } = req.body;
    const touristId = req.user.id;

    const payment = await PaymentService.initiateSSLCommerzPayment({
      bookingId,
      amount,
      touristId,
    });

    res.json(successResponse(payment, 'Payment initiated successfully'));
  } catch (error: any) {
    next(error);
  }
};

// export const paymentSuccess = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const paymentData = req.body;
//     const result = await PaymentService.handlePaymentSuccess(paymentData);

//     // Redirect to frontend success page
//     res.redirect(
//       `${process.env.FRONTEND_URL}/payment/success?bookingId=${result.bookingId}&transactionId=${result.transactionId}`
//     );
//   } catch (error: any) {
//     console.error('Payment Success Error:', error);
//     res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
//   }
// };


export const paymentSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // DEBUG: See what SSLCommerz is actually sending
    console.log('--- SSLCommerz Success Callback Received ---');
    console.log('Body:', req.body); 

    const paymentData = req.body;
    
    // Check if body is empty (common issue with body-parsers)
    if (!paymentData || Object.keys(paymentData).length === 0) {
        throw new Error("Empty request body received from SSLCommerz");
    }

    const result = await PaymentService.handlePaymentSuccess(paymentData);

    console.log('Payment Handled Successfully, Redirecting...');
    res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?bookingId=${result.bookingId}&transactionId=${result.transactionId}`
    );
  } catch (error: any) {
    console.error('--- Payment Success Crash Log ---');
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);
    
    // Redirect to failure so the user isn't stuck on a white screen
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};
export const paymentFail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentData = req.body;
    const result = await PaymentService.handlePaymentFail(paymentData);

    res.redirect(
      `${process.env.FRONTEND_URL}/payment/failed?bookingId=${result.bookingId}`
    );
  } catch (error: any) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

export const paymentCancel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentData = req.body;
    const result = await PaymentService.handlePaymentCancel(paymentData);

    res.redirect(
      `${process.env.FRONTEND_URL}/payment/cancelled?bookingId=${result.bookingId}`
    );
  } catch (error: any) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled`);
  }
};

export const paymentIPN = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Instant Payment Notification handler
    const paymentData = req.body;
    await PaymentService.handlePaymentSuccess(paymentData);
    res.status(200).send('IPN Received');
  } catch (error: any) {
    console.error('IPN Error:', error);
    res.status(500).send('IPN Failed');
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId } = req.params;
    const validation = await PaymentService.validateSSLCommerzPayment(transactionId);

    res.json(successResponse(validation, 'Payment verification completed'));
  } catch (error: any) {
    next(error);
  }
};

export const requestRefund = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bankTransactionId } = req.body;
    const refund = await PaymentService.refundPayment(bankTransactionId);

    res.json(successResponse(refund, 'Refund processed successfully'));
  } catch (error: any) {
    next(error);
  }
};