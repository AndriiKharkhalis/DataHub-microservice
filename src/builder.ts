import { PrismaClient } from "@prisma/client";
import { createRabbitMQChannel } from "./config/rabbitmq";
import { OrderController } from "./controllers/OrderController";
import {
  IExternalOrderHandler,
  IFailedOrderRepository,
  IOrderController,
  IOrderRepository,
  IOrderService,
} from "./domain";
import { FailedOrderRepository, OrderRepository } from "./repositories";
import { ExternalOrderHandler } from "./services/ExternalOrderHandler";
import { OrderService } from "./services/OrderService";
import { Logger } from "./utils/Logger";

export type AppDependencies = {
  logger: Logger;
  prisma: PrismaClient;
  orderRepository: IOrderRepository;
  failedOrderRepository: IFailedOrderRepository;
  orderService: IOrderService;
  orderController: IOrderController;
  externalOrderHandler: IExternalOrderHandler;
};

export type AppConfig = {
  rabbitMQUrl: string;
  rabbitMQQueueName: string;
};
export const createAppDependencies = async (config: AppConfig): Promise<AppDependencies> => {
  const logger = new Logger();
  const prisma = new PrismaClient();
  const orderRepository = new OrderRepository({ prisma });
  const failedOrderRepository = new FailedOrderRepository({ prisma });
  const orderService = new OrderService({ orderRepository, logger });
  const orderController = new OrderController({ orderService });

  const channel = await createRabbitMQChannel(config.rabbitMQUrl, config.rabbitMQQueueName);
  const externalOrderHandler = new ExternalOrderHandler(
    {
      orderRepository,
      failedOrderRepository,
      rabbitMQChannel: channel,
      logger,
    },
    { queueName: config.rabbitMQQueueName },
  );

  return {
    logger,
    prisma,
    orderRepository,
    failedOrderRepository,
    orderService,
    orderController,
    externalOrderHandler,
  };
};
