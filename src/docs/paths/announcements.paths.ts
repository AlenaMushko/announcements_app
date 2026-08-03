import { z } from 'zod';

import { ANNOUNCEMENT_OPENAPI_PATHS } from '../../constants/routes.ts';
import { UPLOAD_FIELD_NAME } from '../../constants/upload.ts';
import {
  AnnouncementParamsSchema,
  CreateAnnouncementSchema,
  GetAnnouncementsQuerySchema,
  UpdateAnnouncementSchema,
} from '../../validations/announcements.validator.ts';
import { registry } from '../openapi.ts';
import {
  AnnouncementSchema,
  AnnouncementsListResponseSchema,
} from '../schemas/announcements.schemas.ts';

const ANNOUNCEMENTS_TAG = 'Announcements';

const CreateAnnouncementMultipartSchema = registry.register(
  'CreateAnnouncementMultipart',
  CreateAnnouncementSchema.extend({
    [UPLOAD_FIELD_NAME]: z.string().optional().openapi({
      type: 'string',
      format: 'binary',
      description: 'Optional announcement image',
    }),
  }),
);

const UpdateAnnouncementMultipartSchema = registry.register(
  'UpdateAnnouncementMultipart',
  UpdateAnnouncementSchema.extend({
    [UPLOAD_FIELD_NAME]: z.string().optional().openapi({
      type: 'string',
      format: 'binary',
      description: 'Optional announcement image',
    }),
  }),
);

registry.registerPath({
  method: 'get',
  path: ANNOUNCEMENT_OPENAPI_PATHS.ROOT,
  tags: [ANNOUNCEMENTS_TAG],
  summary: 'Get all announcements with pagination, search and sorting',
  description:
    'Public list endpoint. Supports pagination (10 items per page), case-insensitive title search, and sorting by newest/oldest.',
  request: {
    query: GetAnnouncementsQuerySchema,
  },
  responses: {
    200: {
      description: 'List of announcements with pagination metadata',
      content: {
        'application/json': {
          schema: AnnouncementsListResponseSchema,
        },
      },
    },
    400: { description: 'Invalid query parameters' },
  },
});

registry.registerPath({
  method: 'get',
  path: ANNOUNCEMENT_OPENAPI_PATHS.BY_ID,
  tags: [ANNOUNCEMENTS_TAG],
  summary: 'Get announcement by ID',
  request: {
    params: AnnouncementParamsSchema,
  },
  responses: {
    200: {
      description: 'Announcement retrieved successfully',
      content: {
        'application/json': {
          schema: AnnouncementSchema,
        },
      },
    },
    400: { description: 'Invalid parameters' },
    404: { description: 'Announcement not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: ANNOUNCEMENT_OPENAPI_PATHS.ROOT,
  tags: [ANNOUNCEMENTS_TAG],
  summary: 'Create a new announcement',
  description: 'Accepts multipart/form-data. Image field is optional.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: CreateAnnouncementMultipartSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Announcement created successfully',
      content: {
        'application/json': {
          schema: AnnouncementSchema,
        },
      },
    },
    401: { description: 'Authentication required' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'patch',
  path: ANNOUNCEMENT_OPENAPI_PATHS.BY_ID,
  tags: [ANNOUNCEMENTS_TAG],
  summary: 'Partially update an announcement',
  description: 'Accepts multipart/form-data. Image field is optional.',
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementParamsSchema,
    body: {
      content: {
        'multipart/form-data': {
          schema: UpdateAnnouncementMultipartSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Announcement updated successfully',
      content: {
        'application/json': {
          schema: AnnouncementSchema,
        },
      },
    },
    401: { description: 'Authentication required' },
    403: { description: 'Access denied' },
    404: { description: 'Announcement not found' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'delete',
  path: ANNOUNCEMENT_OPENAPI_PATHS.BY_ID,
  tags: [ANNOUNCEMENTS_TAG],
  summary: 'Delete an announcement',
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementParamsSchema,
  },
  responses: {
    204: { description: 'Announcement deleted successfully' },
    401: { description: 'Authentication required' },
    403: { description: 'Access denied' },
    404: { description: 'Announcement not found' },
  },
});
