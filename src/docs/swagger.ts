import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

import { generateOpenApiDocument } from './openapi.ts'
import './paths/index.ts'

export function setupSwagger(app: Express) {
  const openApiDocument = generateOpenApiDocument()
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
}
