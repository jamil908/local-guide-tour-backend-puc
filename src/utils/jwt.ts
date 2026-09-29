
import jwt, { SignOptions } from 'jsonwebtoken';
import type * as ms from 'ms';

export const generateToken = (payload: any): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as ms.StringValue;

  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};
