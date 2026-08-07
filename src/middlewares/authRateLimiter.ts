import rateLimit from 'express-rate-limit';

import { AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_MS } from '../constants/rateLimit.ts';

export const authRateLimiter = rateLimit({
  windowMs: AUTH_RATE_WINDOW_MS,
  limit: AUTH_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Too many requests, please try again later',
  },
});
