import { PrismaClient } from "@prisma/client";
import { OrderBody } from "../types/order";
import { RedisClient } from "./ RedisClient";
import { OrderService } from "../services/OrderService";
import { Item } from "../types/externalOrder";

export class OrderConsumer {
  private static QUEUE_NAME = "order_queue";

  public static async start(): Promise<void> {
    const redisClient = RedisClient.getInstance().getClient();
    const prisma = new PrismaClient();
    const orderService = new OrderService({
      orderRepository: {
        saveOrder: async (order: OrderBody) => {
          await prisma.order.create({ data: order });
        },
        getOrdersByCustomer: async () => {
          throw new Error("Not implemented");
        },
      },
    });

    console.log(`Listening for orders on queue: "${this.QUEUE_NAME}"`);

    while (true) {
      const order = await redisClient.blpop(this.QUEUE_NAME, 0);

      if (order) {
        const [, orderData] = order;
        const parsedOrder = JSON.parse(orderData);
        console.log("Processing Order:", parsedOrder);

        const transformedOrder: OrderBody = {
          orderId: parsedOrder.orderId,
          customerId: parsedOrder.customer.id,
          email: parsedOrder.customer.email,
          totalItems: parsedOrder.items.reduce((sum: number, item: Item) => sum + item.quantity, 0),
          totalAmount: parsedOrder.items.reduce(
            (sum: number, item: Item) => sum + item.quantity * item.price,
            0,
          ),
          createdAt: parsedOrder.createdAt,
        };

        await orderService.createOrder(transformedOrder);
        console.log("Order saved to database:", transformedOrder);
      }
    }
  }
}
