import { Router } from 'express';
import * as ListingController from './listing.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', ListingController.getAllListings);
router.get('/:id', ListingController.getListingById);

router.post(
  '/',
  authenticate,
  authorize('GUIDE'),
  ListingController.createListing
);

router.get(
  '/my/listings',
  authenticate,
  authorize('GUIDE'),
  ListingController.getMyListings
);

router.patch(
  '/:id',
  authenticate,
  authorize('GUIDE', 'ADMIN'),
  ListingController.updateListing
);

router.delete(
  '/:id',
  authenticate,
  authorize('GUIDE', 'ADMIN'),
  ListingController.deleteListing
);

export default router;