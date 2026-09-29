import * as ListingModel from './listing.model';

export const createListingService = async (listingData: any) => {
  return await ListingModel.createListing(listingData);
};

export const getAllListingsService = async (filters?: any) => {
  const listings = await ListingModel.getAllListings(filters);
  
  // Calculate average rating
  return listings.map((listing: any) => {
    const avgRating = listing.reviews.length > 0
      ? listing.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / listing.reviews.length
      : 0;
    
    return {
      ...listing,
      averageRating: avgRating,
      reviewCount: listing.reviews.length,
    };
  });
};

export const getListingByIdService = async (id: string) => {
  const listing = await ListingModel.getListingById(id);
  if (!listing) {
    throw new Error('Listing not found');
  }
  return listing;
};

export const updateListingService = async (id: string, data: any) => {
  return await ListingModel.updateListing(id, data);
};

export const deleteListingService = async (id: string) => {
  return await ListingModel.deleteListing(id);
};

export const getListingsByGuideService = async (guideId: string) => {
  return await ListingModel.getListingsByGuide(guideId);
};