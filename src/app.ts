import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.send('Server is running');
});

export default app;
