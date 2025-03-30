import { ExternalOrder } from "../types/externalOrder";
import { RedisClient } from "./ RedisClient";

export class OrderPublisher {
  private static QUEUE_NAME = "order_queue";

  public static async publish(order: ExternalOrder): Promise<void> {
    try {
      console.log("Connecting to Redis...");
      const redisClient = RedisClient.getInstance().getClient();

      console.log("Pushing order to queue...");
      await redisClient.rpush(this.QUEUE_NAME, JSON.stringify(order));
      console.log(`Order successfully published to queue "${this.QUEUE_NAME}"`);
    } catch (error) {
      console.error("Error publishing order to Redis:", error);
      throw error;
    }
  }
}
