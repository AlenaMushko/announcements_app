import express from 'express';

import { ANNOUNCEMENT_PATHS } from '../constants/routes.ts';
import { UPLOAD_FIELD_NAME } from '../constants/upload.ts';
import * as announcementsController from '../controllers/announcements.controller.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { upload } from '../middlewares/upload.ts';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.ts';
import {
  AnnouncementParamsSchema,
  CreateAnnouncementSchema,
  GetAnnouncementsQuerySchema,
  UpdateAnnouncementSchema,
} from '../validations/announcements.validator.ts';

const router = express.Router();

router.get(
  ANNOUNCEMENT_PATHS.ROOT,
  validateQuery(GetAnnouncementsQuerySchema),
  announcementsController.getAllAnnouncements,
);

router.get(
  ANNOUNCEMENT_PATHS.BY_ID,
  validateParams(AnnouncementParamsSchema),
  announcementsController.getAnnouncementById,
);

router.post(
  ANNOUNCEMENT_PATHS.ROOT,
  authenticate,
  upload.single(UPLOAD_FIELD_NAME),
  validateBody(CreateAnnouncementSchema),
  announcementsController.createAnnouncement,
);

router.patch(
  ANNOUNCEMENT_PATHS.BY_ID,
  authenticate,
  validateParams(AnnouncementParamsSchema),
  upload.single(UPLOAD_FIELD_NAME),
  validateBody(UpdateAnnouncementSchema),
  announcementsController.updateAnnouncement,
);

router.delete(
  ANNOUNCEMENT_PATHS.BY_ID,
  authenticate,
  validateParams(AnnouncementParamsSchema),
  announcementsController.deleteAnnouncement,
);

export default router;
