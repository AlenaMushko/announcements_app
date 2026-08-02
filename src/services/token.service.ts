import type { Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config/config.ts';
import { authRepository } from '../repositories/auth.repository.ts';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const createAuthTokens = async (userId: number): Promise<AuthTokens> => {
  const accessToken = jwt.sign({ sub: String(userId) }, config.JWT_SECRET, {
    expiresIn: config.ACCESS_TOKEN_LIFETIME / 1000,
  });

  const refreshToken = jwt.sign({ sub: String(userId) }, config.JWT_SECRET, {
    expiresIn: config.REFRESH_TOKEN_LIFETIME / 1000,
  });

  await authRepository.createRefreshToken({
    userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_LIFETIME),
  });

  return { accessToken, refreshToken };
};

export const setAuthCookies = (res: Response, tokens: AuthTokens) => {
  res.cookie(config.ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: config.ACCESS_TOKEN_LIFETIME,
  });

  res.cookie(config.REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: config.REFRESH_TOKEN_LIFETIME,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(config.ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.clearCookie(config.REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};
