import './paths/index.ts';

import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { generateOpenApiDocument } from './openapi.ts';

export const setupSwagger = (app: Express) => {
  const openApiDocument = generateOpenApiDocument();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
};
