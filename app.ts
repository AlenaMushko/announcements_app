import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from './src/config/index.ts';
import { APP_PATHS } from './src/constants/routes.ts';
import { setupSwagger } from './src/docs/index.ts';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.ts';
import announcementsRoutes from './src/routes/announcements.routes.ts';
import authRoutes from './src/routes/auth.routes.ts';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(express.json());
app.use(cookieParser());
setupSwagger(app);

app.use(APP_PATHS.AUTH, authRoutes);
app.use(APP_PATHS.ANNOUNCEMENTS, announcementsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}: ${config.APP_URL}/api-docs`);
});
