import { z } from "zod";

export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export const ItemSchema = z.object({
  sku: z.string(),
  quantity: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
});

export const ExternalOrderSchema = z.object({
  orderId: z.string(),
  customer: CustomerSchema,
  items: z.array(ItemSchema),
  createdAt: z.string(),
});

export type Item = z.infer<typeof ItemSchema>;
export type ExternalOrder = z.infer<typeof ExternalOrderSchema>;
