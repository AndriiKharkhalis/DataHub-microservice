import { PrismaClient } from "@prisma/client";
import { Order, OrderBody, OrderBodySchema, OrderSchema } from "../types/order";
import { IOrderRepository } from "../domain";

export type OrderRepositoryDependencies = {
  prisma: PrismaClient;
};

export class OrderRepository implements IOrderRepository {
  constructor(private readonly $: OrderRepositoryDependencies) {}

  async saveOrder(order: OrderBody): Promise<void> {
    try {
      const validatedOrder = OrderBodySchema.parse(order);

      await this.$.prisma.order.create({
        data: validatedOrder,
      });
    } catch (error) {
      throw new Error(`Failed to save order: ${error instanceof Error ? error.message : error}`);
    }
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const fetchedOrders = await this.$.prisma.order.findMany({
        where: {
          customerId,
        },
      });

      const validatedOrders = fetchedOrders.reduce<Order[]>((acc, order) => {
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
