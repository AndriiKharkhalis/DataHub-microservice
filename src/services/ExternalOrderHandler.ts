import { Channel, ConsumeMessage } from "amqplib";
import Big from "big.js";
import { ExternalOrder, OrderBody } from "../types";
import {
  IExternalOrderHandler,
  HandleOrderRequest,
  IFailedOrderRepository,
  ILogger,
  IOrderRepository,
} from "../domain";

export type ExternalOrderHandlerDependencies = {
  orderRepository: IOrderRepository;
  failedOrderRepository: IFailedOrderRepository;
  rabbitMQChannel: Channel;
  logger: ILogger;
};

export type ExternalOrderHandlerParams = {
  queueName: string;
};

export class ExternalOrderHandler implements IExternalOrderHandler {
  constructor(
    private readonly $: ExternalOrderHandlerDependencies,
    private readonly params: ExternalOrderHandlerParams,
  ) {}

  async handleOrder(req: HandleOrderRequest): Promise<void> {
    try {
      const { order } = req;

      const serializedOrder = JSON.stringify(order);

      this.$.rabbitMQChannel.sendToQueue(this.params.queueName, Buffer.from(serializedOrder), {
        persistent: true,
      });
    } catch (error) {
      this.$.logger.error("Error pushing order to RabbitMQ queue:", error);
    }
  }

  async consumeEvent(): Promise<void> {
    await this.$.rabbitMQChannel.consume(
      this.params.queueName,
      async (msg: ConsumeMessage | null) => {
        if (msg) {
          try {
            const orderData = msg.content.toString();

            const parsedOrder: ExternalOrder = JSON.parse(orderData);

            const transformedOrder = this.transformOrder(parsedOrder);

            await this.$.orderRepository.create(transformedOrder);

            this.$.rabbitMQChannel.ack(msg);
          } catch (error) {
            this.$.logger.error("Error processing order:", error);

            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            await this.$.failedOrderRepository.create({
              rawData: msg.content.toString(),
              errorMessage,
            });

            this.$.rabbitMQChannel.ack(msg);
          }
        }
      },
      { noAck: false },
    );
  }

  private transformOrder(parsedOrder: ExternalOrder): OrderBody {
    const { orderId, customer, items, createdAt } = parsedOrder;

    return {
      orderId: orderId,
      customerId: customer.id,
      email: customer.email,
      totalItems: items.reduce((sum, item) => sum.plus(item.quantity), new Big(0)).toNumber(),
      totalAmount: items
        .reduce((sum, item) => sum.plus(new Big(item.quantity).times(item.price)), new Big(0))
        .toNumber(),
      createdAt: new Date(createdAt),
    };
  }
}
