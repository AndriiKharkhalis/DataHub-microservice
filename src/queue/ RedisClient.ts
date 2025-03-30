import Redis from "ioredis";

export class RedisClient {
  private static instance: RedisClient;
  private client: Redis;

  private constructor() {
    const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
    this.client = new Redis(REDIS_URL);
    console.log("Connected to Redis");
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async close(): Promise<void> {
    await this.client.quit();
    console.log("Redis connection closed");
  }
}
