import { PrismaClient } from "@prisma/client";
import { Order, OrderBody, OrderDB } from "../types/";
import { OrderBodySchema, OrderSchema } from "../schemas";
import { IOrderRepository } from "../domain";

export type OrderRepositoryDependencies = {
  prisma: PrismaClient;
};

export class OrderRepository implements IOrderRepository {
  constructor(private readonly $: OrderRepositoryDependencies) {}

  async create(order: OrderBody): Promise<void> {
    try {
      const validatedOrder = OrderBodySchema.parse(order);

      await this.$.prisma.order.create({
        data: validatedOrder,
      });
    } catch (error) {
      throw new Error(`Failed to save order: ${error instanceof Error ? error.message : error}`);
    }
  }

  async getManyByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const fetchedOrders = await this.$.prisma.order.findMany({
        where: {
          customerId,
        },
      });

      const validatedOrders = fetchedOrders.reduce((acc: Order[], order: OrderDB) => {
        const parsed = OrderSchema.safeParse({
          ...order,
          totalAmount: Number(order.totalAmount),
        });

        if (parsed.success) {
          acc.push(parsed.data);
        }

        return acc;
      }, []);

      return validatedOrders;
    } catch (error) {
      throw new Error(`Failed to fetch orders: ${error instanceof Error ? error.message : error}`);
    }
  }
}
