import { Channel, ConsumeMessage } from "amqplib";
import { ExternalOrder } from "../types/externalOrder";
import { OrderBody } from "../types";
import { IExternalOrderHandler, IFailedOrderRepository, IOrderRepository } from "../domain";

export type ExternalOrderHandlerDependencies = {
  orderRepository: IOrderRepository;
  failedOrderRepository: IFailedOrderRepository;
  rabbitMQChannel: Channel;
};

export type ExternalOrderHandlerParams = {
  queueName: string;
};

export class ExternalOrderHandler implements IExternalOrderHandler {
  constructor(
    private readonly $: ExternalOrderHandlerDependencies,
    private readonly params: ExternalOrderHandlerParams,
  ) {}

  async handleOrder(order: ExternalOrder): Promise<void> {
    try {
      const serializedOrder = JSON.stringify(order);

      this.$.rabbitMQChannel.sendToQueue(this.params.queueName, Buffer.from(serializedOrder), {
        persistent: true,
      });
    } catch (error) {
      console.error("Error pushing order to RabbitMQ queue:", error);
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

            await this.$.orderRepository.saveOrder(transformedOrder);

            this.$.rabbitMQChannel.ack(msg);
          } catch (error) {
            console.error("Error processing order:", error);

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
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
      createdAt: new Date(createdAt),
    };
  }
}
