import { afterAll, beforeEach } from 'vitest';

import prisma from '../db.ts';
import { cleanDatabase } from './helpers/client.ts';

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});
