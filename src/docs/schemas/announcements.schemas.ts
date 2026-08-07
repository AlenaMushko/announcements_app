import { z } from 'zod';

import { ANNOUNCEMENTS_PER_PAGE } from '../../constants/pagination.ts';
import { AnnouncementCategorySchema } from '../../validations/announcements.validator.ts';
import { registry } from '../openapi.ts';

export const AnnouncementAuthorSchema = registry.register(
  'AnnouncementAuthor',
  z.object({
    id: z.number().int().positive(),
    username: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
);

export const AnnouncementSchema = registry.register(
  'Announcement',
  z.object({
    id: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    price: z.number().int(),
    category: AnnouncementCategorySchema,
    imageUrl: z.string().url().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    user: AnnouncementAuthorSchema,
  }),
);

export const PaginationSchema = registry.register(
  'Pagination',
  z.object({
    total: z.number().int().nonnegative().openapi({
      description: 'Total number of announcements matching filters',
      example: 23,
    }),
    page: z.number().int().positive().openapi({
      description: 'Current page number',
      example: 2,
    }),
    totalPages: z.number().int().nonnegative().openapi({
      description: 'Total pages for the current filter set',
      example: 3,
    }),
    perPage: z.literal(ANNOUNCEMENTS_PER_PAGE).openapi({
      description: 'Fixed page size',
      example: ANNOUNCEMENTS_PER_PAGE,
    }),
  }),
);

export const AnnouncementsListResponseSchema = registry.register(
  'AnnouncementsListResponse',
  z.object({
    data: z.array(AnnouncementSchema),
    pagination: PaginationSchema,
  }),
);
