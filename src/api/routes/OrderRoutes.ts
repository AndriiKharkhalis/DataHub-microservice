import express from "express";
import { IExternalOrderHandler, IOrderController } from "../../domain";

const createOrderRoutes = (
  orderController: IOrderController,
  externalOrderHandler: IExternalOrderHandler,
) => {
  const router = express.Router();

  router.post("/orders", async (req, res, next) => {
    try {
      const order = req.body;

      await externalOrderHandler.handleOrder(order);

      res.status(200).json({ message: "Order received and queued" });
    } catch (error) {
      next(error);
    }
  });

  router.get("/orders", async (req, res, next) => {
    try {
      const { customerId } = req.query;

      if (!customerId || typeof customerId !== "string") {
        res.status(400).json({ message: `Invalid customerId: ${customerId}` });
        return;
      }

      const orders = await orderController.getOrders({ customerId });

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createOrderRoutes;
