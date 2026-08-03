import multer from 'multer';

import { MAX_UPLOAD_FILE_SIZE_BYTES, UPLOADS_DIR } from '../constants/upload.ts';

export const upload = multer({
  dest: UPLOADS_DIR,
  limits: {
    fileSize: MAX_UPLOAD_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image files are allowed'));
  },
});
