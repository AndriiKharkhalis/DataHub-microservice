import { PrismaClient } from "@prisma/client";
import { FailedOrderRepository } from "../FailedOrderRepository";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

describe("FailedOrderRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let failedOrderRepository: FailedOrderRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    failedOrderRepository = new FailedOrderRepository({ prisma });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("should save failed order", async () => {
      const inputFailedOrder = {
        rawData: "raw-data",
        errorMessage: "error-message",
      };

      prisma.failedOrder.create.mockResolvedValue({
        id: "00000000-0000-0000-0000-000000000001",
        createdAt: new Date(),
        ...inputFailedOrder,
      });

      await failedOrderRepository.create(inputFailedOrder);

      expect(prisma.failedOrder.create).toHaveBeenCalledWith({
        data: inputFailedOrder,
      });
    });

    it("should throw error if failed order is invalid", async () => {
      const inputFailedOrder = {
        rawData: "raw-data",
        errorMessage: "invalid-error-message",
      };

      prisma.failedOrder.create.mockRejectedValue(new Error("Database error"));

      try {
        await failedOrderRepository.create(inputFailedOrder);
      } catch (error) {
        const err = error as Error;
        expect(err.message).toContain("Failed to save failed order");
      }
    });
  });
});
