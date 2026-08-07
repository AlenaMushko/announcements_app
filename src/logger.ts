import pino from 'pino';

import { config } from './config/index.ts';

const isTest = config.NODE_ENV === 'test';
const isDev = config.NODE_ENV !== 'production';

const logger = pino({
  level: isTest ? 'silent' : isDev ? 'debug' : 'info',
  ...(!isTest &&
    isDev && {
      transport: {
        target: 'pino-pretty',
      },
    }),
});

export default logger;
