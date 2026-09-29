import * as ReviewModel from './review.model';

export const createReviewService = async (reviewData: any) => {
  return await ReviewModel.createReview(reviewData);
};

export const getReviewsByListingService = async (listingId: string) => {
  return await ReviewModel.getReviewsByListing(listingId);
};