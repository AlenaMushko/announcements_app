import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import app from '../../app.ts';
import prisma from '../../db.ts';
import { cleanDatabase } from '../helpers/client.ts';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(async (password: string) => `hashed_${password}`),
    compare: vi.fn(async () => true),
  },
}));

describe('POST /auth/login (with bcrypt mock)', () => {
  beforeEach(async () => {
    await cleanDatabase();

    await prisma.user.create({
      data: {
        username: 'olena',
        email: 'olena@example.com',
        password: 'doesnt_matter',
        name: 'Olena',
      },
    });
  });

  it('returns tokens when bcrypt.compare resolves to true', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

    const response = await request(app).post('/auth/login').send({
      username: 'olena',
      password: 'any-password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(bcrypt.compare).toHaveBeenCalledWith('any-password', 'doesnt_matter');
  });

  it('returns 401 when bcrypt.compare resolves to false', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

    const response = await request(app).post('/auth/login').send({
      username: 'olena',
      password: 'wrong',
    });

    expect(response.status).toBe(401);
  });

  it('creates a refresh token in the database on successful login', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
    const createSpy = vi.spyOn(prisma.refreshToken, 'create');

    await request(app).post('/auth/login').send({
      username: 'olena',
      password: 'any-password',
    });

    expect(createSpy).toHaveBeenCalledOnce();
    createSpy.mockRestore();
  });
});
