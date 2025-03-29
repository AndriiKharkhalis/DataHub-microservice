import { z } from "zod";

export const OrderBodySchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  email: z.string().email(),
  totalItems: z.number().int().nonnegative(),
  totalAmount: z.number().nonnegative(),
  createdAt: z.date(),
});

export const OrderSchema = OrderBodySchema.extend({
  id: z.string().uuid(),
});

export type OrderBody = z.output<typeof OrderBodySchema>;
export type Order = z.output<typeof OrderSchema>;
