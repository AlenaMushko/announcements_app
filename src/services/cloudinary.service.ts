import fs from 'node:fs/promises';

import createHttpError from 'http-errors';

import { cloudinary } from '../config/cloudinary.ts';
import { CLOUDINARY_ANNOUNCEMENTS_FOLDER } from '../constants/upload.ts';

export const uploadAnnouncementImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: CLOUDINARY_ANNOUNCEMENTS_FOLDER,
    });

    return result.secure_url;
  } catch {
    throw createHttpError(500, 'Failed to upload image');
  } finally {
    await fs.unlink(file.path).catch(() => undefined);
  }
};
