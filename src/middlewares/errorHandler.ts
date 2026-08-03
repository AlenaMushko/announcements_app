import type { NextFunction, Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof Error && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Not allowed by CORS' });
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    err.type === 'entity.parse.failed'
  ) {
    return res.status(400).json({
      error: 'Validation failed',
      details: {
        body: ['Invalid JSON format in request body'],
      },
    });
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500 &&
    'message' in err &&
    typeof err.message === 'string'
  ) {
    return res.status(err.status).json({ error: err.message });
  }

  if (typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string') {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint violation' });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Foreign key constraint failed' });
    }
  }

  res.status(500).json({ error: 'Internal server error' });
};
