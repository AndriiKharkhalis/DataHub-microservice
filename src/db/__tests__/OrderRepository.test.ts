import { PrismaClient } from "@prisma/client";
import { OrderRepository } from "../OrderRepository";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { Decimal } from "@prisma/client/runtime/library";

describe("OrderRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let orderRepository: OrderRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    orderRepository = new OrderRepository({ prisma });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("saveOrder", () => {
    it("should save order", async () => {
      const inputOrder = {
        orderId: "order-id",
        customerId: "customer-id",
        email: "custumer@gmail.com",
        totalItems: 2,
        totalAmount: 100,
        createdAt: new Date(),
      };

      await orderRepository.saveOrder(inputOrder);

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: inputOrder,
      });
    });

    it("should throw error if order is invalid", async () => {
      const inputOrder = {
        orderId: "order-id",
        customerId: "customer-id",
        email: "invalid-email",
        totalItems: 2,
        totalAmount: 100,
        createdAt: new Date(),
      };

      await expect(orderRepository.saveOrder(inputOrder)).rejects.toThrow("Failed to save order");
    });
  });

  describe("getOrdersByCustomer", () => {
    it("should return orders by customerId", async () => {
      const customerId = "customer-id-1";
      const existedOrders = [
        {
          id: "00000000-0000-0000-0000-000000000001",
          orderId: "order-id-1",
          customerId: "customer-id-1",
          email: "custumer@gmail.com",
          totalItems: 2,
          totalAmount: new Decimal(100),
          createdAt: new Date("2025-01-01 00:00:00"),
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          orderId: "order-id-2",
          customerId: "customer-id-1",
          email: "custumer@gmail.com",
          totalItems: 3,
          totalAmount: new Decimal(200),
          createdAt: new Date("2025-01-02 00:00:00"),
        },
      ];

      prisma.order.findMany.mockResolvedValue(existedOrders);

      const result = await orderRepository.getOrdersByCustomer(customerId);

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          customerId,
        },
      });

      expect(result).toEqual([
        {
          id: "00000000-0000-0000-0000-000000000001",
          orderId: "order-id-1",
          customerId: "customer-id-1",
          email: "custumer@gmail.com",
          totalItems: 2,
          totalAmount: 100,
          createdAt: new Date("2025-01-01 00:00:00"),
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          orderId: "order-id-2",
          customerId: "customer-id-1",
          email: "custumer@gmail.com",
          totalItems: 3,
          totalAmount: 200,
          createdAt: new Date("2025-01-02 00:00:00"),
        },
      ]);
    });

    it("should throw error if failed to fetch orders", async () => {
      const customerId = "customer-id";

      prisma.order.findMany.mockRejectedValue(new Error("Failed to fetch"));

      await expect(orderRepository.getOrdersByCustomer(customerId)).rejects.toThrow(
        "Failed to fetch orders",
      );
    });
  });
});
