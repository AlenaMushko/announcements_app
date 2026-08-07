import 'dotenv/config';

import { defineConfig } from 'vitest/config';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set in .env');
}

export default defineConfig({
  test: {
    globals: true,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL,
      SALT_ROUNDS: '4',
    },
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
  },
});
