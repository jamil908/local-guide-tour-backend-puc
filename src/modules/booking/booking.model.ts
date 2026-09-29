import prisma from '../../config/prisma';
import { BookingStatus } from '@prisma/client';

export const createBooking = async (bookingData: any) => {
  return await prisma.booking.create({
   data: {
  ...bookingData,
  bookingDate: new Date(bookingData.bookingDate).toISOString(),
},
    include: {
      listing: true,
      tourist: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
        },
      },
      guide: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
        },
      },
    },
  });
};

export const getBookingById = async (id: string) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: true,
      tourist: true,
      guide: true,
    },
  });
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
) => {
  return await prisma.booking.update({
    where: { id },
    data: { status },
  });
};

export const getBookingsByTourist = async (touristId: string) => {
  return await prisma.booking.findMany({
    where: { touristId },
    include: {
      listing: {
        include: {
          guide: {
            select: {
              id: true,
              name: true,
              profilePic: true,
            },
          },
        },
      },
      review: true,  
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getBookingsByGuide = async (guideId: string) => {
  return await prisma.booking.findMany({
    where: { guideId },
    include: {
      listing: true,
      tourist: {
        select: {
          id: true,
          name: true,
          profilePic: true,
        },
      },
      review: true,  
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      listing: true,
      tourist: true,
      guide: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};


export const cancelBooking = async (id: string) => {
  return await prisma.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });
};


export const updatePaymentStatus = async (
  id: string,
  paymentStatus: string,
  transactionId: string
) => {
  return await prisma.booking.update({
    where: { id },
    data: {
      paymentStatus,
      transactionId,
    },
  });
};