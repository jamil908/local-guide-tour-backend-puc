import prisma from '../../config/prisma';

export const createReview = async (reviewData: any) => {
  return await prisma.review.create({
    data: reviewData,
    include: {
      tourist: {
        select: {
            id: true,
      name: true,
      profilePic: true,
    },
  },
},});
};
export const getReviewsByListing = async (listingId: string) => {
return await prisma.review.findMany({
where: { listingId },
include: {
tourist: {
select: {
id: true,
name: true,
profilePic: true,
},
},
},
orderBy: { createdAt: 'desc' },
});
};