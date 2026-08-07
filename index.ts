import app from './app.ts';
import { config } from './src/config/index.ts';
import logger from './src/logger.ts';

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, docs: `${config.APP_URL}/api-docs` }, 'Server started');
});
