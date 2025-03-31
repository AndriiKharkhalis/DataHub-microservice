import amqplib, { Channel } from "amqplib";

export async function createRabbitMQChannel(url: string, queueName: string): Promise<Channel> {
  const connection = await amqplib.connect(url);
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName, { durable: true });

  return channel;
}
