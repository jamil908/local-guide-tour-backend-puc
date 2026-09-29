import { Router } from 'express';
import * as BookingController from './booking.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('TOURIST'),
  BookingController.createBooking
);

router.get('/my-bookings', authenticate, BookingController.getMyBookings);

router.patch(
  '/:id',
  authenticate,
  authorize('GUIDE'),
  BookingController.updateBookingStatus
);

router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  BookingController.getAllBookings
);
router.patch(
  '/:id/cancel',
  authenticate,
  authorize('TOURIST'),
  BookingController.cancelBooking
);
export default router;