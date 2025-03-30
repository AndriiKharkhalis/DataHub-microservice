import express from "express";
import { OrderController } from "../controllers/OrderController";
import { OrderService } from "../services/OrderService";
import { OrderRepository } from "../repositories/OrderRepository";
import { PrismaClient } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient();
const orderRepository = new OrderRepository({ prisma });
const orderService = new OrderService({ orderRepository });
const orderController = new OrderController({ orderService });

router.post("/orders", (req, res) => orderController.createOrder(req, res));
router.get("/orders", (req, res) => orderController.getOrders(req, res));

export default router;
