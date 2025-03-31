import { Request, Response } from "express";

export interface IOrderController {
  createOrder(req: Request, res: Response): Promise<void>;
  getOrders(req: Request, res: Response): Promise<void>;
}
