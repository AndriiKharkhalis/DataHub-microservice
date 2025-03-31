import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().default(3000),
  RABBITMQ_URL: z.string().default("amqp://localhost"),
  RABBITMQ_QUEUE_NAME: z.string().default("orders_queue"),
});

export const env = envSchema.parse(process.env);
