import express from "express";
import { OrderController } from "../controllers/OrderController";
import { OrderService } from "../services/OrderService";
import { OrderRepository } from "../repositories/OrderRepository";
import { PrismaClient } from "@prisma/client";
import { OrderPublisher } from "../queue/OrderPublisher";
import { ExternalOrderSchema } from "../types/externalOrder";

const router = express.Router();

const prisma = new PrismaClient();
const orderRepository = new OrderRepository({ prisma });
const orderService = new OrderService({ orderRepository });
const orderController = new OrderController({ orderService });

// router.post("/orders", (req, res) => orderController.createOrder(req, res));
router.post("/orders", async (req, res) => {
  try {
    const order = req.body;
    console.log("Received order:", order);

    const validatedOrder = ExternalOrderSchema.parse(order);
    console.log("Validated order:", validatedOrder);

    await OrderPublisher.publish(validatedOrder);
    console.log("Order published to queue");

    res.status(200).json({ message: "Order received and queued" });
  } catch (error) {
    console.error("Error publishing order:", error);
    res.status(500).json({ message: "Failed to process order", error });
  }
});

router.get("/orders", (req, res) => orderController.getOrders(req, res));

export default router;
