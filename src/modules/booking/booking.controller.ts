import { Response, NextFunction } from 'express';
import * as BookingService from './booking.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { successResponse } from '../../utils/resoponse';

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await BookingService.createBookingService({
      ...req.body,
      touristId: req.user.id,
    });
    res.status(201).json(
      successResponse(booking, 'Booking created successfully')
    );
  } catch (error: any) {
    next(error);
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = req.user.role === 'GUIDE'
      ? await BookingService.getBookingsByGuideService(req.user.id)
      : await BookingService.getBookingsByTouristService(req.user.id);
    
    res.json(successResponse(bookings, 'Bookings fetched successfully'));
  } catch (error: any) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;
    const booking = await BookingService.updateBookingStatusService(
      req.params.id,
      status
    );
    res.json(successResponse(booking, 'Booking status updated'));
  } catch (error: any) {
    next(error);
  }
};

export const getAllBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await BookingService.getAllBookingsService();
    res.json(successResponse(bookings, 'All bookings fetched'));
  } catch (error: any) {
    next(error);
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await BookingService.cancelBookingService(
      req.params.id,
      req.user.id
    );

    res.json(
      successResponse(
        booking,
        'Booking cancelled successfully'
      )
    );
  } catch (error: any) {
    next(error);
  }
};