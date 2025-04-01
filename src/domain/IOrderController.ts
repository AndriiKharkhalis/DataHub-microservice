import { Request, Response } from "express";

export interface IOrderController {
  getOrders(req: Request, res: Response): Promise<void>;
}
