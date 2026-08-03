import fs from 'node:fs/promises';

import type { Request } from 'express';

export const removeUploadedFile = async (req: Request): Promise<void> => {
  if (!req.file?.path) {
    return;
  }

  await fs.unlink(req.file.path).catch(() => undefined);
};
