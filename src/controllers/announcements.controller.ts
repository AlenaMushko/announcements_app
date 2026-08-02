import type { RequestHandler } from 'express';

import { announcementsService } from '../services/announcements.services.ts';
import { getAuthenticatedUserId } from '../utils/auth.ts';
import type {
  AnnouncementParams,
  CreateAnnouncementBody,
  GetAnnouncementsQuery,
  UpdateAnnouncementBody,
} from '../validations/announcements.validator.ts';

export const getAllAnnouncements: RequestHandler = async (_req, res, next) => {
  try {
    const query = res.locals.query as GetAnnouncementsQuery;
    const result = await announcementsService.getAllAnnouncements(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAnnouncementById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as unknown as AnnouncementParams;
    const announcement = await announcementsService.getAnnouncementById(id);
    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement: RequestHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const body = req.body as CreateAnnouncementBody;
    const announcement = await announcementsService.createAnnouncement(userId, body);
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement: RequestHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params as unknown as AnnouncementParams;
    const body = req.body as UpdateAnnouncementBody;
    const announcement = await announcementsService.updateAnnouncement(id, userId, body);
    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement: RequestHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params as unknown as AnnouncementParams;
    await announcementsService.deleteAnnouncement(id, userId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
