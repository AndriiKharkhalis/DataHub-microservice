import { createAppDependencies } from "./builder";
import { env } from "./config/env";
import { createApp } from "./app";
import createOrderRoutes from "./api/routes/OrderRoutes";

async function startServer() {
  const appDependencies = await createAppDependencies({
    rabbitMQUrl: env.RABBITMQ_URL,
    rabbitMQQueueName: env.RABBITMQ_QUEUE_NAME,
  });

  const { logger, orderController, externalOrderHandler } = appDependencies;

  const app = createApp(logger);

  try {
    await externalOrderHandler.consumeEvent();

    const orderRoutes = createOrderRoutes(orderController, externalOrderHandler);

    app.use("/api", orderRoutes);

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Error during server startup:", error);
    process.exit(1);
  }
}

startServer();
