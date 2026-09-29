import prisma from '../../config/prisma';
import { Listing } from '@prisma/client';

export const createListing = async (listingData: any): Promise<Listing> => {
  return await prisma.listing.create({
    data: listingData,
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          expertise: true,
        },
      },
    },
  });
};

export const getAllListings = async (filters?: any) => {
  const where: any = { isActive: true };

  if (filters?.city) {
    where.city = { contains: filters.city, mode: 'insensitive' };
  }
  if (filters?.category) {
    where.category = filters.category;
  }
  if (filters?.minPrice || filters?.maxPrice) {
    where.tourFee = {
      ...(filters.minPrice && { gte: parseFloat(filters.minPrice) }),
      ...(filters.maxPrice && { lte: parseFloat(filters.maxPrice) }),
    };
  }

  return await prisma.listing.findMany({
    where,
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          expertise: true,
          languages: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
};

export const getListingById = async (id: string) => {
  return await prisma.listing.findUnique({
    where: { id },
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePic: true,
          bio: true,
          expertise: true,
          languages: true,
          dailyRate: true,
        },
      },
      reviews: {
        include: {
          tourist: {
            select: {
              id: true,
              name: true,
              profilePic: true,
            },
          },
        },
      },
    },
  });
};

export const updateListing = async (id: string, data: Partial<Listing>) => {
  return await prisma.listing.update({
    where: { id },
    data,
  });
};

export const deleteListing = async (id: string) => {
  return await prisma.listing.delete({
    where: { id },
  });
};

export const getListingsByGuide = async (guideId: string) => {
  return await prisma.listing.findMany({
    where: { guideId },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
};