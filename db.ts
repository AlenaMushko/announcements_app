import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './prisma/generated/prisma/client.ts';
import { config } from './src/config/index.ts';

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
