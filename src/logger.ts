import pino from 'pino';

import { config } from './config/index.ts';

const isDev = config.NODE_ENV !== 'production';

const logger = pino({
  level: isDev ? 'debug' : 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
    },
  }),
});

export default logger;
