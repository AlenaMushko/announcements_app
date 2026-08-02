import { z } from 'zod';

import { registry } from '../openapi.ts';

export const AuthUserSchema = registry.register(
  'AuthUser',
  z.object({
    id: z.number().int().positive(),
    username: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
);

export const AuthMeSchema = registry.register(
  'AuthMe',
  AuthUserSchema.extend({
    createdAt: z.string().datetime(),
  }),
);

export const AuthTokensSchema = registry.register(
  'AuthTokens',
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
);

export const AuthSessionSchema = registry.register(
  'AuthSession',
  z.object({
    user: AuthUserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
);
