import prisma from '../../config/prisma';
import { User, UserRole } from '@prisma/client';

type PublicUser = Omit<User, 'password' | 'updatedAt'>;
export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<User> => {
  return await prisma.user.create({
    data: userData,
  });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (
  id: string
): Promise<PublicUser | null> => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profilePic: true,
      bio: true,
      languages: true,
      expertise: true,
      dailyRate: true,
      travelPreferences: true,
      createdAt: true,
    },
  });
};

export const updateUser = async (
  id: string,
  data: Partial<User>
): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profilePic: true,
      createdAt: true,
    },
  });
};

export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};