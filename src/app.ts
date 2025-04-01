import express, { Request, Response, NextFunction } from "express";
import { env } from "./config/env";
import { Logger } from "./utils/Logger";

export const createApp = (logger: Logger) => {
  const app = express();
  app.use(express.json());

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error("Unhandled error:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error",
      stack: env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });

  return app;
};
