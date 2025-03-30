import { Request, Response } from "express";
import { IOrderController } from "./IOrderController";
import { IOrderService } from "../services/IOrderService";
import { OrderBodySchema } from "../types/order";

export type OrderControllerDependencies = {
  orderService: IOrderService;
};

export class OrderController implements IOrderController {
  constructor(private readonly $: OrderControllerDependencies) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = OrderBodySchema.parse(req.body);

      await this.$.orderService.createOrder(order);

      res.status(201).json({ message: "Order created successfully" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid order data" });
    }
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.query;

      if (!customerId || typeof customerId !== "string") {
        res.status(400).json({ message: "Invalid customerId" });
        return;
      }

      const orders = await this.$.orderService.getOrdersByCustomer(customerId);

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }
}
