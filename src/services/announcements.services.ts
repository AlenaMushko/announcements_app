import type { Prisma } from '../../prisma/generated/prisma/client.ts'
import createHttpError from 'http-errors'

import { ANNOUNCEMENTS_PER_PAGE } from '../constants/pagination.ts'
import { announcementsRepository } from '../repositories/announcements.repository.ts'
import type {
  CreateAnnouncementBody,
  GetAnnouncementsQuery,
  UpdateAnnouncementBody,
} from '../validations/announcements.validator.ts'

const buildAnnouncementsWhere = (
  query: GetAnnouncementsQuery,
): Prisma.AnnouncementWhereInput => {
  const where: Prisma.AnnouncementWhereInput = {}

  if (query.search) {
    where.title = {
      contains: query.search,
      mode: 'insensitive',
    }
  }

  return where
}

const buildAnnouncementsOrderBy = (
  sort: GetAnnouncementsQuery['sort'],
): Prisma.AnnouncementOrderByWithRelationInput => {
  return {
    createdAt: sort === 'oldest' ? 'asc' : 'desc',
  }
}

const assertAnnouncementOwnership = async (
  announcementId: number,
  userId: number,
) => {
  const announcement = await announcementsRepository.findById(announcementId)

  if (!announcement) {
    throw createHttpError(404, 'Announcement not found')
  }

  if (announcement.userId !== userId) {
    throw createHttpError(403, 'Access denied')
  }

  return announcement
}

export const announcementsService = {
  getAllAnnouncements: async (query: GetAnnouncementsQuery) => {
    const page = query.page ?? 1
    const perPage = ANNOUNCEMENTS_PER_PAGE
    const skip = (page - 1) * perPage
    const where = buildAnnouncementsWhere(query)
    const orderBy = buildAnnouncementsOrderBy(query.sort)

    const [data, total] = await Promise.all([
      announcementsRepository.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      announcementsRepository.count(where),
    ])

    return {
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / perPage),
        perPage,
      },
    }
  },

  getAnnouncementById: async (id: number) => {
    const announcement = await announcementsRepository.findById(id)

    if (!announcement) {
      throw createHttpError(404, 'Announcement not found')
    }

    return announcement
  },

  createAnnouncement: async (userId: number, data: CreateAnnouncementBody) =>
    announcementsRepository.create(userId, data),

  updateAnnouncement: async (
    id: number,
    userId: number,
    data: UpdateAnnouncementBody,
  ) => {
    await assertAnnouncementOwnership(id, userId)
    return announcementsRepository.update(id, data)
  },

  deleteAnnouncement: async (id: number, userId: number) => {
    await assertAnnouncementOwnership(id, userId)
    await announcementsRepository.delete(id)
  },
}
