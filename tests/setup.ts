import { afterAll, beforeEach } from 'vitest';

import prisma from '../db.ts';
import { cleanAnnouncementsData, cleanDatabase } from './helpers/client.ts';

beforeEach(async () => {
  await cleanAnnouncementsData();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});
