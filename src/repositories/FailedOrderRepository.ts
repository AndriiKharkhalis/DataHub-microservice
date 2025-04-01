import { PrismaClient } from "@prisma/client";
import { FailedOrderBody } from "../types/";
import { FailedOrderBodySchema } from "../schemas";
import { IFailedOrderRepository } from "../domain";

export type FailedOrderRepositoryDependencies = {
  prisma: PrismaClient;
};

export class FailedOrderRepository implements IFailedOrderRepository {
  constructor(private readonly $: FailedOrderRepositoryDependencies) {}

  async create(order: FailedOrderBody): Promise<void> {
    try {
      const validatedOrder = FailedOrderBodySchema.parse(order);

      await this.$.prisma.failedOrder.create({
        data: validatedOrder,
      });
    } catch (error) {
      throw new Error(`Failed to save failed order: ${error instanceof Error ? error.message : error}`);
    }
  }
}
