import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUserPayload } from '../types';

export const generateAccessToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): IUserPayload => {
  return jwt.verify(token, config.jwt.secret) as IUserPayload;
};

export const verifyRefreshToken = (token: string): IUserPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as IUserPayload;
};
