import express, { Request, Response, NextFunction } from "express";
import { env } from "./config/env";

const app = express();
app.use(express.json());

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);

  res.status(500).json({
    message: err.message || "Internal Server Error",
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
