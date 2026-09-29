import { Router } from 'express';
import * as ReviewController from './review.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Create review (Tourist only)
router.post(
  '/',
  authenticate,
  authorize('TOURIST'),
  ReviewController.createReview
);

// Get reviews by listing (Public)
router.get('/listing/:listingId', ReviewController.getReviewsByListing);

// Get my reviews (Tourist only)
router.get(
  '/my-reviews',
  authenticate,
  authorize('TOURIST'),
  ReviewController.getMyReviews  // ✅ FIXED - was createReview
);

// ✅ ADD THIS - Update review
router.patch(
  '/:id',
  authenticate,
  authorize('TOURIST'),
  ReviewController.updateReview
);

// ✅ ADD THIS - Delete review
router.delete(
  '/:id',
  authenticate,
  authorize('TOURIST', 'ADMIN'),
  ReviewController.deleteReview
);

export default router;