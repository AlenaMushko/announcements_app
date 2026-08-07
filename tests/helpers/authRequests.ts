import jwt from 'jsonwebtoken';
import { expect, it } from 'vitest';
import request from 'supertest';

import app from '../../app.ts';
import { config } from '../../src/config/index.ts';

type HttpMethod = 'get' | 'post' | 'patch' | 'delete';

export function createExpiredToken(payload: object = { sub: '1' }) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: -1 });
}

export function itRequiresValidAccessToken(method: HttpMethod, path: string) {
  it('returns 401 without an access token', async () => {
    const response = await request(app)[method](path);

    expect(response.status).toBe(401);
  });

  it('returns 401 with an invalid access token', async () => {
    const response = await request(app)
      [method](path)
      .set('Authorization', 'Bearer invalid_token_here');

    expect(response.status).toBe(401);
  });

  it('returns 401 with an expired access token', async () => {
    const response = await request(app)
      [method](path)
      .set('Authorization', `Bearer ${createExpiredToken()}`);

    expect(response.status).toBe(401);
  });
}

export function itRejectsInvalidRefreshToken(path = '/auth/refresh') {
  it('returns 401 for an invalid refresh token', async () => {
    const response = await request(app).post(path).send({
      refreshToken: 'invalid.refresh.token',
    });

    expect(response.status).toBe(401);
  });

  it('returns 401 for an expired refresh token', async () => {
    const response = await request(app).post(path).send({
      refreshToken: createExpiredToken(),
    });

    expect(response.status).toBe(401);
  });
}
