import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { generateToken } from '../../utils/jwt';
import * as UserModel from './user.model';
import { UserRole } from '@prisma/client';

export const registerUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}) => {
  const existingUser = await UserModel.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(userData.password);
  const user = await UserModel.createUser({
    ...userData,
    password: hashedPassword,
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await UserModel.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const getUserProfile = async (id: string) => {
  const user = await UserModel.findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const updateUserProfile = async (id: string, data: any) => {
  return await UserModel.updateUser(id, data);
};


export const updateUserRoleService = async (id: string, role: UserRole) => {
  // Validate role
  const validRoles: UserRole[] = ['TOURIST', 'GUIDE', 'ADMIN'];
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role. Must be TOURIST, GUIDE, or ADMIN');
  }

  const user = await UserModel.findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }

  return await UserModel.updateUser(id, { role });
};

export const getAllUsersService = async () => {
  return await UserModel.getAllUsers();
};

export const deleteUserService = async (id: string) => {
  return await UserModel.deleteUser(id);
};