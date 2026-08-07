import { describe, expect, it } from 'vitest';

import {
  AnnouncementParamsSchema,
  CreateAnnouncementSchema,
  GetAnnouncementsQuerySchema,
  UpdateAnnouncementSchema,
} from '../../src/validations/announcements.validator.ts';

const validAnnouncement = {
  title: 'Test Announcement',
  description: 'Test Description long enough',
  price: 100,
  category: 'sale' as const,
};

describe('AnnouncementParamsSchema', () => {
  it('accepts a valid positive id', () => {
    const result = AnnouncementParamsSchema.safeParse({ id: 1 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
    }
  });

  it('coerces a string id to a number', () => {
    const result = AnnouncementParamsSchema.safeParse({ id: '42' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it('rejects zero, negative, and non-numeric id', () => {
    expect(AnnouncementParamsSchema.safeParse({ id: 0 }).success).toBe(false);
    expect(AnnouncementParamsSchema.safeParse({ id: -1 }).success).toBe(false);
    expect(AnnouncementParamsSchema.safeParse({ id: 'abc' }).success).toBe(false);
  });
});

describe('CreateAnnouncementSchema', () => {
  it('accepts valid announcement data', () => {
    const result = CreateAnnouncementSchema.safeParse(validAnnouncement);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validAnnouncement);
    }
  });

  it('ignores client-provided imageUrl (set only via file upload)', () => {
    const result = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      imageUrl: 'https://example.com/image.jpg',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('imageUrl');
    }
  });

  it('rejects a title that is too short', () => {
    const result = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      title: 'Hi',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a description that is too short', () => {
    const result = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      description: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid category', () => {
    const result = CreateAnnouncementSchema.safeParse({
      ...validAnnouncement,
      category: 'food',
    });

    expect(result.success).toBe(false);
  });

  it('rejects price less than or equal to zero', () => {
    expect(
      CreateAnnouncementSchema.safeParse({ ...validAnnouncement, price: 0 }).success,
    ).toBe(false);
    expect(
      CreateAnnouncementSchema.safeParse({ ...validAnnouncement, price: -10 }).success,
    ).toBe(false);
  });
});

describe('UpdateAnnouncementSchema', () => {
  it('accepts a full update payload', () => {
    const result = UpdateAnnouncementSchema.safeParse(validAnnouncement);

    expect(result.success).toBe(true);
  });

  it('accepts an empty object because all fields are optional', () => {
    const result = UpdateAnnouncementSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('accepts a partial update with only title', () => {
    const result = UpdateAnnouncementSchema.safeParse({ title: 'Updated title' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ title: 'Updated title' });
    }
  });

  it('ignores client-provided imageUrl on update', () => {
    const result = UpdateAnnouncementSchema.safeParse({
      imageUrl: 'https://example.com/image.jpg',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('imageUrl');
    }
  });

  it('rejects an invalid value in a partial update', () => {
    const result = UpdateAnnouncementSchema.safeParse({ title: 'x' });

    expect(result.success).toBe(false);
  });
});

describe('GetAnnouncementsQuerySchema', () => {
  it('accepts a valid query', () => {
    const result = GetAnnouncementsQuerySchema.safeParse({
      page: 1,
      sort: 'newest',
      search: 'laptop',
    });

    expect(result.success).toBe(true);
  });

  it('accepts an empty query because all fields are optional', () => {
    const result = GetAnnouncementsQuerySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('rejects page less than 1', () => {
    const result = GetAnnouncementsQuerySchema.safeParse({ page: 0 });

    expect(result.success).toBe(false);
  });

  it('rejects an unknown sort value', () => {
    const result = GetAnnouncementsQuerySchema.safeParse({ sort: 'price' });

    expect(result.success).toBe(false);
  });

  it('rejects search longer than 100 characters', () => {
    const result = GetAnnouncementsQuerySchema.safeParse({
      search: 'a'.repeat(101),
    });

    expect(result.success).toBe(false);
  });
});
