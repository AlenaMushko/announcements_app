import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import app from '../../app.ts';
import { cloudinary } from '../../src/config/cloudinary.ts';
import { MAX_UPLOAD_FILE_SIZE_BYTES } from '../../src/constants/upload.ts';
import { createAuthUser } from '../helpers/auth.ts';

vi.mock('../../src/config/cloudinary.ts', () => ({
  cloudinary: {
    uploader: {
      upload: vi.fn(),
    },
  },
}));

const mockedUpload = vi.mocked(cloudinary.uploader.upload);

const validFields = {
  title: 'Used laptop sale',
  description: 'A good condition laptop for sale',
  price: '500',
  category: 'sale',
};

const imageBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

describe('Announcements API uploads (with Cloudinary mock)', () => {
  let accessToken: string;

  beforeAll(async () => {
    const auth = await createAuthUser({
      username: 'uploader',
      email: 'uploader@example.com',
    });
    accessToken = auth.accessToken;
  });

  beforeEach(() => {
    mockedUpload.mockReset();
    mockedUpload.mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/announcement.jpg',
    } as never);
  });

  it('creates an announcement with an uploaded image', async () => {
    const response = await request(app)
      .post('/announcements')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', validFields.title)
      .field('description', validFields.description)
      .field('price', validFields.price)
      .field('category', validFields.category)
      .attach('image', imageBuffer, {
        filename: 'laptop.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(201);
    expect(response.body.imageUrl).toBe(
      'https://res.cloudinary.com/demo/image/upload/announcement.jpg',
    );
    expect(mockedUpload).toHaveBeenCalledOnce();
  });

  it('updates an announcement image', async () => {
    const created = await request(app)
      .post('/announcements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Used laptop sale',
        description: 'A good condition laptop for sale',
        price: 500,
        category: 'sale',
      });

    mockedUpload.mockResolvedValueOnce({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/updated.jpg',
    } as never);

    const response = await request(app)
      .patch(`/announcements/${created.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', imageBuffer, {
        filename: 'updated.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(200);
    expect(response.body.imageUrl).toBe(
      'https://res.cloudinary.com/demo/image/upload/updated.jpg',
    );
    expect(mockedUpload).toHaveBeenCalled();
  });

  it('returns 400 when the uploaded file is not an image', async () => {
    const response = await request(app)
      .post('/announcements')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', validFields.title)
      .field('description', validFields.description)
      .field('price', validFields.price)
      .field('category', validFields.category)
      .attach('image', Buffer.from('not-an-image'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Only image files are allowed');
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it('returns 400 when the uploaded file exceeds the size limit', async () => {
    const oversizedImage = Buffer.alloc(MAX_UPLOAD_FILE_SIZE_BYTES + 1, 0xff);

    const response = await request(app)
      .post('/announcements')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', validFields.title)
      .field('description', validFields.description)
      .field('price', validFields.price)
      .field('category', validFields.category)
      .attach('image', oversizedImage, {
        filename: 'huge.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('File too large');
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it('returns 500 when Cloudinary upload fails', async () => {
    mockedUpload.mockRejectedValueOnce(new Error('cloudinary unavailable'));

    const response = await request(app)
      .post('/announcements')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', validFields.title)
      .field('description', validFields.description)
      .field('price', validFields.price)
      .field('category', validFields.category)
      .attach('image', imageBuffer, {
        filename: 'laptop.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to upload image');
  });
});
