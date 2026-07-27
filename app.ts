import express from "express";
import cookieParser from "cookie-parser";

import { config } from "./src/config/index.ts";
import { setupSwagger } from "./src/docs/index.ts";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middlewares/errorHandler.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());
setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(
    `Server is running on port ${config.port}: ${config.appUrl}/api-docs`,
  );
});