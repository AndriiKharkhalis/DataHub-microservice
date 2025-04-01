import { Request, Response } from "express";
import { IOrderController, IOrderService } from "../domain";

export type OrderControllerDependencies = {
  orderService: IOrderService;
};

export class OrderController implements IOrderController {
  constructor(private readonly $: OrderControllerDependencies) {}

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.query;

      if (!customerId || typeof customerId !== "string") {
        res.status(400).json({ message: "Invalid customerId" });
        return;
      }

      const orders = await this.$.orderService.queryOrders({ customerId });

      res.json(orders);
    } catch (error) {
      res
        .status(500)
        .json({ message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }
}
