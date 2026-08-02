import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config/config.ts';

declare global {
  // Express augments Request via a namespace; this is the supported pattern.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
    }
  }
}

const getAccessTokenFromRequest = (req: Request): string | undefined => {
  const cookieToken = req.cookies?.[config.ACCESS_TOKEN_COOKIE] as string | undefined;

  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }

  return authHeader.slice('Bearer '.length);
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = payload as jwt.JwtPayload;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default authenticate;
