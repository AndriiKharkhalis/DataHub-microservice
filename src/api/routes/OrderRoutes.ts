import express from "express";
import { OrderController } from "../../controllers/OrderController";
import { ExternalOrderHandler } from "../../services/ExternalOrderHandler";

const createOrderRoutes = (
  orderController: OrderController,
  externalOrderHandler: ExternalOrderHandler,
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

  router.get("/orders", (req, res, next) => {
    orderController.getOrders(req, res).catch(next);
  });

  return router;
};

export default createOrderRoutes;
