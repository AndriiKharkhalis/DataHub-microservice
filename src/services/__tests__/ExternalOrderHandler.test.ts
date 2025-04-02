import { IFailedOrderRepository, ILogger, IOrderRepository } from "../../domain";
import { ExternalOrderHandler } from "../ExternalOrderHandler";
import { Channel } from "amqplib";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

describe("ExternalOrderHandler", () => {
  let orderRepository: DeepMockProxy<IOrderRepository>;
  let failedOrderRepository: DeepMockProxy<IFailedOrderRepository>;
  let rabbitMQChannel: DeepMockProxy<Channel>;
  let logger: DeepMockProxy<ILogger>;
  let externalOrderHandler: ExternalOrderHandler;

  beforeEach(() => {
    orderRepository = mockDeep<IOrderRepository>();
    failedOrderRepository = mockDeep<IFailedOrderRepository>();
    rabbitMQChannel = mockDeep<Channel>();
    logger = mockDeep<ILogger>();

    externalOrderHandler = new ExternalOrderHandler(
      {
        orderRepository,
        failedOrderRepository,
        rabbitMQChannel,
        logger,
      },
      { queueName: "test-queue" },
    );
  });

  const inputOrder = {
    orderId: "123456",
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("handleOrder", () => {
    it("should push order to RabbitMQ queue", async () => {
      const serializedOrder = JSON.stringify(inputOrder);

      rabbitMQChannel.sendToQueue.mockReturnValue(true);

      await externalOrderHandler.handleOrder({ order: inputOrder });
      expect(rabbitMQChannel.sendToQueue).toHaveBeenCalledWith(
        "test-queue",
        Buffer.from(serializedOrder),
        { persistent: true },
      );
    });

    it("should log error if pushing order fails", async () => {
      const error = new Error("RabbitMQ error");
      rabbitMQChannel.sendToQueue.mockImplementation(() => {
        throw error;
      });

      await externalOrderHandler.handleOrder({ order: inputOrder });

      expect(logger.error).toHaveBeenCalledWith("Error pushing order to RabbitMQ queue:", error);
    });
  });

  describe("consumeEvent", () => {
    const rabbitMQMessage = {
      content: Buffer.from(JSON.stringify(inputOrder)),
      fields: {
        consumerTag: "test-consumer-tag",
        deliveryTag: 1,
        redelivered: false,
        exchange: "test-exchange",
        routingKey: "test-routing-key",
      },
      properties: {
        headers: {},
        contentType: "application/json",
        contentEncoding: "utf-8",
        deliveryMode: 2,
        priority: 0,
        correlationId: "test-correlation-id",
        replyTo: "test-reply-to",
        expiration: "test-expiration",
        messageId: "test-message-id",
        timestamp: Date.now(),
        type: "test-type",
        userId: "test-user-id",
        appId: "test-app-id",
        clusterId: "test-cluster-id",
        messageCount: 1,
      },
    };
    it("should consume messages from RabbitMQ queue", async () => {
      rabbitMQChannel.consume.mockImplementation(async (_queue, callback) => {
        callback(rabbitMQMessage);
        return Promise.resolve({ consumerTag: "test-consumer-tag" });
      });

      await externalOrderHandler.consumeEvent();

      expect(rabbitMQChannel.consume).toHaveBeenCalledWith("test-queue", expect.any(Function), {
        noAck: false,
      });
    });

    it("should process order and acknowledge message", async () => {
      orderRepository.create.mockResolvedValue();
      rabbitMQChannel.consume.mockImplementation(async (_queue, callback) => {
        callback(rabbitMQMessage);
        return Promise.resolve({ consumerTag: "test-consumer-tag" });
      });

      await externalOrderHandler.consumeEvent();

      expect(orderRepository.create).toHaveBeenCalledWith({
        orderId: inputOrder.orderId,
        customerId: inputOrder.customer.id,
        email: inputOrder.customer.email,
        totalItems: 3,
        totalAmount: 119.97,
        createdAt: new Date(inputOrder.createdAt),
      });
      expect(rabbitMQChannel.ack).toHaveBeenCalledWith(rabbitMQMessage);
    });

    it("should log error and save failed order if parsing fails", async () => {
      const invalidMessage = {
        ...rabbitMQMessage,
        content: Buffer.from("Invalid JSON"),
      };
      rabbitMQChannel.consume.mockImplementation(async (_queue, callback) => {
        callback(invalidMessage);
        return Promise.resolve({ consumerTag: "test-consumer-tag" });
      });

      await externalOrderHandler.consumeEvent();

      expect(logger.error).toHaveBeenCalledWith("Error processing order:", expect.any(Error));
      expect(failedOrderRepository.create).toHaveBeenCalledWith({
        rawData: "Invalid JSON",
        errorMessage: "Unexpected token 'I', \"Invalid JSON\" is not valid JSON",
      });
      expect(rabbitMQChannel.ack).toHaveBeenCalledWith(invalidMessage);
    });

    it("should log error and save failed order if creating order fails ", async () => {
      const error = new Error(
        "Error: Failed to save order: Invalid `prisma.order.create()` invocation:",
      );

      rabbitMQChannel.consume.mockImplementation(async (_queue, callback) => {
        callback(rabbitMQMessage);
        return Promise.resolve({ consumerTag: "test-consumer-tag" });
      });

      orderRepository.create.mockRejectedValue(error);

      await externalOrderHandler.consumeEvent();

      expect(logger.error).toHaveBeenCalledWith("Error processing order:", error);
      expect(failedOrderRepository.create).toHaveBeenCalledWith({
        rawData: JSON.stringify(inputOrder),
        errorMessage: "Error: Failed to save order: Invalid `prisma.order.create()` invocation:",
      });
      expect(rabbitMQChannel.ack).toHaveBeenCalledWith(rabbitMQMessage);
    });

    it("should handle unknown error and save failed order", async () => {
      const error = new Error("Unknown error");
      orderRepository.create.mockRejectedValue(error);
      rabbitMQChannel.consume.mockImplementation(async (_queue, callback) => {
        callback(rabbitMQMessage);
        return Promise.resolve({ consumerTag: "test-consumer-tag" });
      });

      await externalOrderHandler.consumeEvent();

      expect(logger.error).toHaveBeenCalledWith("Error processing order:", error);
      expect(failedOrderRepository.create).toHaveBeenCalledWith({
        rawData: JSON.stringify(inputOrder),
        errorMessage: "Unknown error",
      });
      expect(rabbitMQChannel.ack).toHaveBeenCalledWith(rabbitMQMessage);
    });
  });
});
