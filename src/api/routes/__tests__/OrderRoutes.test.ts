import express, { NextFunction, Request, Response } from "express";
import { IExternalOrderHandler, IOrderController } from "../../../domain";
import createOrderRoutes from "../OrderRoutes";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import request from "supertest";

describe("OrderRoutes", () => {
  let orderController: DeepMockProxy<IOrderController>;
  let externalOrderHandler: DeepMockProxy<IExternalOrderHandler>;
  let app: express.Express;

  beforeEach(() => {
    orderController = mockDeep<IOrderController>();
    externalOrderHandler = mockDeep<IExternalOrderHandler>();

    app = express();
    app.use(express.json());
    app.use(createOrderRoutes(orderController, externalOrderHandler));
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /orders", () => {
    const inputOrder = {
      orderId: "123456-12",
      customer: {
        id: "cust_987",
        email: "john@example.com",
      },
      items: [
        { sku: "sku_001", quantity: 2, price: 49.99 },
        { sku: "sku_002", quantity: 1, price: 19.99 },
      ],
      createdAt: "2025-03-26T10:30:00Z",
    };

    it("should handle order and respond with success", async () => {
      externalOrderHandler.handleOrder.mockResolvedValue(undefined);

      const response = await request(app).post("/orders").send(inputOrder).expect(200);

      expect(response.body.message).toBe("Order received and queued");
      expect(externalOrderHandler.handleOrder).toHaveBeenCalledWith(inputOrder);
    });

    it("should handle error when processing order", async () => {
      externalOrderHandler.handleOrder.mockImplementation(() => {
        throw new Error("Error");
      });

      const response = await request(app).post("/orders").send(inputOrder).expect(500);

      expect(response.body.message).toBe("Error");
      expect(externalOrderHandler.handleOrder).toHaveBeenCalledWith(inputOrder);
    });
  });

  describe("GET /orders", () => {
    it("should get orders successfully", async () => {
      const orders = [
        {
          id: "00000000-0000-0000-0000-000000000001",
          orderId: "123456",
          customerId: "customer-id",
          email: "email@email.com",
          totalItems: 2,
          totalAmount: 100,
          createdAt: new Date("2025-03-26T10:30:00Z").toISOString(),
        },
      ];

      orderController.getOrders.mockResolvedValue({ data: orders });

      const response = await request(app)
        .get("/orders")
        .query({ customerId: "customer-id" })
        .expect(200);

      expect(response.body).toEqual({ data: orders });
      expect(orderController.getOrders).toHaveBeenCalledWith({
        customerId: "customer-id",
      });
    });

    it("should return 400 if customerId is invalid", async () => {
      const response = await request(app).get("/orders").query({ customerId: "" }).expect(400);

      expect(response.body.message).toBe("Invalid customerId: ");
      expect(orderController.getOrders).not.toHaveBeenCalled();
    });

    it("should handle error when getting orders", async () => {
      orderController.getOrders.mockImplementation(() => {
        throw new Error("Error");
      });

      const response = await request(app)
        .get("/orders")
        .query({ customerId: "customer-id" })
        .expect(500);

      expect(response.body.message).toBe("Error");
      expect(orderController.getOrders).toHaveBeenCalledWith({
        customerId: "customer-id",
      });
    });
  });
});
