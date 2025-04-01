import { z } from "zod";

export const FailedOrderBodySchema = z.object({
  rawData: z.string(),
  errorMessage: z.string(),
});

export const FailedOrderSchema = FailedOrderBodySchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
});
