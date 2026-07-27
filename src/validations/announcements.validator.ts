import { z } from 'zod'

import { registry } from '../docs/openapi.ts'

export const AnnouncementCategorySchema = registry.register(
  'AnnouncementCategory',
  z.enum(['sale', 'service', 'job', 'other']),
)

export const AnnouncementParamsSchema = registry.register(
  'AnnouncementParams',
  z.object({
    id: z.coerce.number().int().positive(),
  }),
)

export const CreateAnnouncementSchema = registry.register(
  'CreateAnnouncement',
  z.object({
    title: z.string().min(5).max(50),
    description: z.string().min(10).max(1000),
    price: z.number().int().positive(),
    category: AnnouncementCategorySchema,
  }),
)

export const UpdateAnnouncementSchema = registry.register(
  'UpdateAnnouncement',
  CreateAnnouncementSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { error: 'At least one field must be provided' },
  ),
)

export const GetAnnouncementsQuerySchema = registry.register(
  'GetAnnouncementsQuery',
  z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .optional()
      .openapi({
        description: 'Page number (1-based). Default: 1. Fixed page size: 10.',
        example: 1,
      }),
    search: z
      .string()
      .max(100)
      .optional()
      .openapi({
        description:
          'Case-insensitive substring search in announcement title. Empty or omitted returns all.',
        example: 'ноутбук',
      }),
    sort: z
      .enum(['newest', 'oldest'])
      .optional()
      .openapi({
        description:
          'Sort by createdAt. newest = desc (default), oldest = asc.',
        example: 'newest',
      }),
  }),
)

export type AnnouncementParams = z.infer<typeof AnnouncementParamsSchema>
export type CreateAnnouncementBody = z.infer<typeof CreateAnnouncementSchema>
export type UpdateAnnouncementBody = z.infer<typeof UpdateAnnouncementSchema>
export type GetAnnouncementsQuery = z.infer<typeof GetAnnouncementsQuerySchema>
