import type { Request } from 'express';
import createHttpError from 'http-errors';

export const getAuthenticatedUserId = (req: Request): number => {
  const sub = req.user?.sub;

  if (sub === undefined || sub === null || sub === '') {
    throw createHttpError(401, 'Unauthorized');
  }

  const userId = Number(sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createHttpError(401, 'Unauthorized');
  }

  return userId;
};
