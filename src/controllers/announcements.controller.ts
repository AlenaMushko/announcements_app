import type { RequestHandler } from 'express'
import { announcementsService } from '../services/announcements.services.ts'

export const getAllAnnouncements: RequestHandler = async () => {
  await announcementsService.getAllAnnouncements()
}

export const getAnnouncementById: RequestHandler = async () => {
  await announcementsService.getAnnouncementById()
}

export const createAnnouncement: RequestHandler = async () => {
  await announcementsService.createAnnouncement()
}

export const updateAnnouncement: RequestHandler = async () => {
  await announcementsService.updateAnnouncement()
}

export const deleteAnnouncement: RequestHandler = async () => {
  await announcementsService.deleteAnnouncement()
}
