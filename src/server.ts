import { PrismaClient } from "@prisma/client";
import app from "./app";
import { env } from "./config/env";
import { OrderController } from "./controllers/OrderController";
import { OrderRepository } from "./repositories/OrderRepository";
import createOrderRoutes from "./api/routes/OrderRoutes";
import { ExternalOrderHandler } from "./services/ExternalOrderHandler";
import { OrderService } from "./services/OrderService";
import { createRabbitMQChannel } from "./config/rabbitmq";

async function initializeRabbitMQ(orderRepository: OrderRepository): Promise<ExternalOrderHandler> {
  const channel = await createRabbitMQChannel(env.RABBITMQ_URL, env.RABBITMQ_QUEUE_NAME);

  const externalOrderHandler = new ExternalOrderHandler(
    {
      orderRepository,
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
    const orderService = new OrderService({ orderRepository });

    const externalOrderHandler = await initializeRabbitMQ(orderRepository);

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
