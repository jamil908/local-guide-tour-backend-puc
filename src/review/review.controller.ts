import { Response, NextFunction } from 'express';
import * as ReviewService from './review.service';
import { successResponse } from '../../utils/resoponse';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../config/prisma';

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { listingId, bookingId, rating, comment } = req.body;
    const touristId = req.user.id;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if booking belongs to user
    if (booking.touristId !== touristId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings',
      });
    }

    // Check if already reviewed
    if (booking.review) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    // Create review
    const review = await ReviewService.createReviewService({
      listingId,
      bookingId,
      touristId,
      rating,
      comment,
    });

    res.status(201).json(
      successResponse(review, 'Review submitted successfully')
    );
  } catch (error: any) {
    next(error);
  }
};

export const getReviewsByListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await ReviewService.getReviewsByListingService(
      req.params.listingId
    );
    res.json(successResponse(reviews, 'Reviews fetched successfully'));
  } catch (error: any) {
    next(error);
  }
};

// ✅ ADD THIS - Update Review
export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.touristId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
      include: {
        tourist: {
          select: {
            id: true,
            name: true,
            profilePic: true,
          },
        },
      },
    });

    res.json(successResponse(updatedReview, 'Review updated successfully'));
  } catch (error: any) {
    next(error);
  }
};

// ✅ ADD THIS - Delete Review
export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.touristId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    // Delete review
    await prisma.review.delete({
      where: { id },
    });

    res.json(successResponse(null, 'Review deleted successfully'));
  } catch (error: any) {
    next(error);
  }
};

// ✅ ADD THIS - Get My Reviews
export const getMyReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { touristId: req.user.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(successResponse(reviews, 'Your reviews fetched successfully'));
  } catch (error: any) {
    next(error);
  }
};