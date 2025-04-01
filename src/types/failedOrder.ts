import { z } from "zod";
import { FailedOrderBodySchema, FailedOrderSchema } from "../schemas/failedOrder";

export type FailedOrderBody = z.output<typeof FailedOrderBodySchema>;
export type FailedOrder = z.output<typeof FailedOrderSchema>;
