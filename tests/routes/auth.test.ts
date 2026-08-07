import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import app from '../../app.ts';
import prisma from '../../db.ts';
import { config } from '../../src/config/index.ts';
import {
  itRejectsInvalidRefreshToken,
  itRequiresValidAccessToken,
} from '../helpers/authRequests.ts';
import { cleanDatabase } from '../helpers/client.ts';
import { expectValidationFailure } from '../helpers/expectValidation.ts';

const validRegister = {
  username: 'olena',
  email: 'olena@example.com',
  password: 'Secret123',
  name: 'Olena',
};

describe('Auth API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /auth/register', () => {
    it('registers a new user and returns tokens', async () => {
      const response = await request(app).post('/auth/register').send(validRegister);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.username).toBe('olena');
      expect(response.body.user.email).toBe('olena@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('returns 409 when username is already taken', async () => {
      await prisma.user.create({
        data: {
          username: 'olena',
          email: 'different@example.com',
          password: await bcrypt.hash('Secret123', config.SALT_ROUNDS),
          name: 'Olena',
        },
      });

      const response = await request(app).post('/auth/register').send({
        ...validRegister,
        email: 'another@example.com',
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 422 for invalid registration data', async () => {
      const response = await request(app).post('/auth/register').send({
        username: 'ab',
        email: 'invalid-email',
        password: '123',
        name: 'A',
      });

      expectValidationFailure(response, ['username', 'email', 'password', 'name']);
    });
  });

  describe('POST /auth/login', () => {
    it('returns tokens for valid credentials', async () => {
      await request(app).post('/auth/register').send(validRegister);

      const response = await request(app).post('/auth/login').send({
        username: 'olena',
        password: 'Secret123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.username).toBe('olena');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('returns 401 for an incorrect password', async () => {
      await request(app).post('/auth/register').send(validRegister);

      const response = await request(app).post('/auth/login').send({
        username: 'olena',
        password: 'WrongPass1',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 401 for a nonexistent user', async () => {
      const response = await request(app).post('/auth/login').send({
        username: 'missing',
        password: 'Secret123',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user with a valid access token', async () => {
      const registerResponse = await request(app).post('/auth/register').send(validRegister);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('olena');
      expect(response.body.email).toBe('olena@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('returns 401 when the user no longer exists', async () => {
      const registerResponse = await request(app).post('/auth/register').send(validRegister);

      await prisma.user.delete({ where: { id: registerResponse.body.user.id } });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);

      expect(response.status).toBe(401);
    });

    it('returns 401 when access token has an invalid subject', async () => {
      const token = jwt.sign({ sub: 'not-a-number' }, config.JWT_SECRET, { expiresIn: '15m' });

      const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    itRequiresValidAccessToken('get', '/auth/me');
  });

  describe('POST /auth/refresh', () => {
    it('returns a new token pair for a valid refresh token', async () => {
      const registerResponse = await request(app).post('/auth/register').send(validRegister);
      const oldRefreshToken = registerResponse.body.refreshToken as string;
      const userId = registerResponse.body.user.id as number;

      const response = await request(app).post('/auth/refresh').send({
        refreshToken: oldRefreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const tokens = await prisma.refreshToken.findMany({ where: { userId } });
      expect(tokens).toHaveLength(1);
    });

    it('returns 401 when refresh token is valid JWT but missing in database', async () => {
      const registerResponse = await request(app).post('/auth/register').send(validRegister);
      const userId = registerResponse.body.user.id as number;

      await prisma.refreshToken.deleteMany({ where: { userId } });

      const orphanToken = jwt.sign({ sub: String(userId), jti: 'not-stored' }, config.JWT_SECRET, {
        expiresIn: '7d',
      });

      const response = await request(app).post('/auth/refresh').send({
        refreshToken: orphanToken,
      });

      expect(response.status).toBe(401);
    });

    it('returns 401 when refresh token exists but is expired in database', async () => {
      const registerResponse = await request(app).post('/auth/register').send(validRegister);
      const userId = registerResponse.body.user.id as number;
      const refreshToken = jwt.sign({ sub: String(userId) }, config.JWT_SECRET, {
        expiresIn: '7d',
      });

      await prisma.refreshToken.deleteMany({ where: { userId } });
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId,
          expiresAt: new Date(Date.now() - 1000),
        },
      });

      const response = await request(app).post('/auth/refresh').send({ refreshToken });

      expect(response.status).toBe(401);
      const leftover = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      expect(leftover).toBeNull();
    });

    itRejectsInvalidRefreshToken();
  });

  describe('POST /auth/logout', () => {
    it('logs out an authenticated user', async () => {
      const registerResponse = await request(app).post('/auth/register').send(validRegister);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`);

      expect(response.status).toBe(204);
    });

    itRequiresValidAccessToken('post', '/auth/logout');
  });
});
