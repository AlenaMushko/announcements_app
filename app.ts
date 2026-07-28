import express from "express";
import cookieParser from "cookie-parser";

import { config } from "./src/config/index.ts";
import { APP_PATHS } from "./src/constants/routes.ts";
import { setupSwagger } from "./src/docs/index.ts";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middlewares/errorHandler.ts";
import announcementsRoutes from "./src/routes/announcements.routes.ts";
import authRoutes from "./src/routes/auth.routes.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());
setupSwagger(app);

app.use(APP_PATHS.AUTH, authRoutes);
app.use(APP_PATHS.ANNOUNCEMENTS, announcementsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(
    `Server is running on port ${config.PORT}: ${config.APP_URL}/api-docs`,
  );
});
