import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import app from '../../app.ts';
import prisma from '../../db.ts';
import { createAuthUser } from '../helpers/auth.ts';
import { expectValidationFailure } from '../helpers/expectValidation.ts';

const validAnnouncement = {
  title: 'Used laptop sale',
  description: 'A good condition laptop for sale',
  price: 500,
  category: 'sale',
};

const invalidAnnouncement = {
  title: 'Hi',
  description: 'short',
  price: -1,
  category: 'food',
};

describe('Announcements API', () => {
  let user: Awaited<ReturnType<typeof createAuthUser>>['user'];
  let accessToken: string;
  let ownerToken: string;
  let otherUserToken: string;
  let ownerId: number;

  beforeAll(async () => {
    const auth = await createAuthUser({
      username: 'testuser',
      email: 'test@example.com',
    });
    user = auth.user;
    accessToken = auth.accessToken;

    const owner = await createAuthUser({
      username: 'owner',
      email: 'owner@example.com',
    });
    ownerToken = owner.accessToken;
    ownerId = owner.user.id;

    const other = await createAuthUser({
      username: 'other',
      email: 'other@example.com',
    });
    otherUserToken = other.accessToken;
  });

  describe('GET /announcements', () => {
    it('returns an empty list when there are no announcements', async () => {
      const response = await request(app).get('/announcements');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('returns announcements from the database', async () => {
      await prisma.announcement.create({
        data: {
          ...validAnnouncement,
          userId: user.id,
        },
      });

      const response = await request(app).get('/announcements');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Used laptop sale');
      expect(response.body.pagination.total).toBe(1);
    });

    it('filters announcements by search query', async () => {
      await prisma.announcement.create({
        data: {
          ...validAnnouncement,
          title: 'MacBook Pro',
          userId: user.id,
        },
      });
      await prisma.announcement.create({
        data: {
          ...validAnnouncement,
          title: 'Office chair',
          description: 'Comfortable office chair in good condition',
          userId: user.id,
        },
      });

      const response = await request(app).get('/announcements').query({ search: 'macbook' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('MacBook Pro');
    });
  });

  describe('GET /announcements/:id', () => {
    let announcementId: number;

    beforeEach(async () => {
      const announcement = await prisma.announcement.create({
        data: {
          ...validAnnouncement,
          userId: user.id,
        },
      });
      announcementId = announcement.id;
    });

    it('returns an announcement by existing id', async () => {
      const response = await request(app).get(`/announcements/${announcementId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(announcementId);
      expect(response.body.title).toBe('Used laptop sale');
      expect(response.body).toHaveProperty('user');
    });

    it('returns 404 for a nonexistent id', async () => {
      const response = await request(app).get('/announcements/1234567');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).get('/announcements/qwe');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /announcements', () => {
    it('creates an announcement with a valid token', async () => {
      const response = await request(app)
        .post('/announcements')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validAnnouncement);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Used laptop sale');
      expect(response.body.user.username).toBe('testuser');
    });

    it('returns 401 without a token', async () => {
      const response = await request(app).post('/announcements').send(validAnnouncement);

      expect(response.status).toBe(401);
    });

    it('returns 401 with an invalid token', async () => {
      const response = await request(app)
        .post('/announcements')
        .set('Authorization', 'Bearer invalid_token_here')
        .send(validAnnouncement);

      expect(response.status).toBe(401);
    });

    it('returns 422 for invalid body', async () => {
      const response = await request(app)
        .post('/announcements')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidAnnouncement);

      expectValidationFailure(response, ['title', 'description', 'price', 'category']);
    });
  });

  describe('PATCH /announcements/:id', () => {
    let announcementId: number;

    beforeEach(async () => {
      const announcement = await prisma.announcement.create({
        data: {
          ...validAnnouncement,
          userId: ownerId,
        },
      });
      announcementId = announcement.id;
    });

    it('allows the owner to update an announcement', async () => {
      const response = await request(app)
        .patch(`/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Updated laptop sale' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated laptop sale');
    });

    it('returns 403 when another user tries to update', async () => {
      const response = await request(app)
        .patch(`/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Hacked title here' });

      expect(response.status).toBe(403);
    });

    it('returns 404 for a nonexistent id', async () => {
      const response = await request(app)
        .patch('/announcements/1234567')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'Updated laptop sale' });

      expect(response.status).toBe(404);
    });

    it('returns 422 when body is empty and no file is uploaded', async () => {
      const response = await request(app)
        .patch(`/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('At least one field must be provided');
    });
  });

  describe('DELETE /announcements/:id', () => {
    let announcementId: number;

    beforeEach(async () => {
      const announcement = await prisma.announcement.create({
        data: {
          ...validAnnouncement,
          userId: ownerId,
        },
      });
      announcementId = announcement.id;
    });

    it('allows the owner to delete an announcement', async () => {
      const response = await request(app)
        .delete(`/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(204);

      const deleted = await prisma.announcement.findUnique({
        where: { id: announcementId },
      });
      expect(deleted).toBeNull();
    });

    it('returns 403 when another user tries to delete', async () => {
      const response = await request(app)
        .delete(`/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
    });

    it('returns 404 for a nonexistent id', async () => {
      const response = await request(app)
        .delete('/announcements/123567')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });
  });
});
