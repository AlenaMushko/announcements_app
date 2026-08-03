import type { RequestHandler } from 'express';
import { z } from 'zod';

import { removeUploadedFile } from '../utils/removeUploadedFile.ts';

export const validateBody = <T extends z.ZodTypeAny>(schema: T) =>
  ((req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      void removeUploadedFile(req);

      const flattened = z.flattenError(result.error);

      return res.status(422).json({
        error: 'Validation failed',
        details:
          Object.keys(flattened.fieldErrors).length > 0
            ? flattened.fieldErrors
            : flattened.formErrors,
      });
    }

    (req as { body: z.infer<T> }).body = result.data;
    next();
  }) satisfies RequestHandler;

export const validateParams = <T extends z.ZodTypeAny>(schema: T) =>
  ((req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: z.flattenError(result.error).fieldErrors,
      });
    }

    (req as unknown as { params: z.infer<T> }).params = result.data;
    next();
  }) satisfies RequestHandler;

export const validateQuery = <T extends z.ZodTypeAny>(schema: T) =>
  ((req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: z.flattenError(result.error).fieldErrors,
      });
    }

    (res.locals as { query: z.infer<T> }).query = result.data;
    next();
  }) satisfies RequestHandler;
