import { z } from 'zod'

export const AnnouncementCategorySchema = z.enum([
  'sale',
  'service',
  'job',
  'other',
])

export const AnnouncementParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(5).max(50),
  description: z.string().min(10).max(1000),
  price: z.number().int().positive(),
  category: AnnouncementCategorySchema,
})

export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { error: 'At least one field must be provided' },
)

export const GetAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['newest', 'oldest']).optional(),
})

export type AnnouncementParams = z.infer<typeof AnnouncementParamsSchema>
export type CreateAnnouncementBody = z.infer<typeof CreateAnnouncementSchema>
export type UpdateAnnouncementBody = z.infer<typeof UpdateAnnouncementSchema>
export type GetAnnouncementsQuery = z.infer<typeof GetAnnouncementsQuerySchema>
