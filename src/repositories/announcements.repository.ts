import type { Prisma } from '../../prisma/generated/prisma/client.ts'

import prisma from '../../db.ts'
import { PUBLIC_USER_SELECT } from '../constants/userSelect.ts'
import type {
  CreateAnnouncementBody,
  UpdateAnnouncementBody,
} from '../validations/announcements.validator.ts'

const announcementWithAuthorInclude = {
  user: {
    select: PUBLIC_USER_SELECT,
  },
} as const

export type AnnouncementWithAuthor = Prisma.AnnouncementGetPayload<{
  include: typeof announcementWithAuthorInclude
}>

export const announcementsRepository = {
  findMany: (args: {
    where: Prisma.AnnouncementWhereInput
    orderBy: Prisma.AnnouncementOrderByWithRelationInput
    skip: number
    take: number
  }) =>
    prisma.announcement.findMany({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      include: announcementWithAuthorInclude,
    }),

  count: (where: Prisma.AnnouncementWhereInput) =>
    prisma.announcement.count({ where }),

  findById: (id: number) =>
    prisma.announcement.findUnique({
      where: { id },
      include: announcementWithAuthorInclude,
    }),

  create: (userId: number, data: CreateAnnouncementBody) =>
    prisma.announcement.create({
      data: {
        ...data,
        userId,
      },
      include: announcementWithAuthorInclude,
    }),

  update: (id: number, data: UpdateAnnouncementBody) =>
    prisma.announcement.update({
      where: { id },
      data,
      include: announcementWithAuthorInclude,
    }),

  delete: (id: number) =>
    prisma.announcement.delete({
      where: { id },
    }),
}
