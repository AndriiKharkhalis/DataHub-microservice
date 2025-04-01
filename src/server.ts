import { PrismaClient } from "@prisma/client";
import createOrderRoutes from "./api/routes/OrderRoutes";
import app from "./app";
import { env } from "./config/env";
import { createRabbitMQChannel } from "./config/rabbitmq";
import { OrderController } from "./controllers/OrderController";
import { IFailedOrderRepository, IOrderRepository } from "./domain";
import { FailedOrderRepository, OrderRepository } from "./repositories";
import { ExternalOrderHandler } from "./services/ExternalOrderHandler";
import { OrderService } from "./services/OrderService";

async function initializeRabbitMQ(
  orderRepository: IOrderRepository,
  failedOrderRepository: IFailedOrderRepository,
): Promise<ExternalOrderHandler> {
  const channel = await createRabbitMQChannel(env.RABBITMQ_URL, env.RABBITMQ_QUEUE_NAME);

  const externalOrderHandler = new ExternalOrderHandler(
    {
      orderRepository,
      failedOrderRepository,
      rabbitMQChannel: channel,
    },
    { queueName: env.RABBITMQ_QUEUE_NAME },
  );

  return externalOrderHandler;
}

async function startServer() {
  try {
    const prisma = new PrismaClient();
    const orderRepository = new OrderRepository({ prisma });
    const failedOrderRepository = new FailedOrderRepository({ prisma });
    const orderService = new OrderService({ orderRepository });

    const externalOrderHandler = await initializeRabbitMQ(orderRepository, failedOrderRepository);

    await externalOrderHandler.consumeEvent();

    const orderController = new OrderController({ orderService });
    const orderRoutes = createOrderRoutes(orderController, externalOrderHandler);

    app.use("/api", orderRoutes);

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
}

startServer();
