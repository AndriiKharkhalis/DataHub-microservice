import { z } from "zod";
import { OrderBodySchema, OrderSchema } from "../schemas/order";

export type OrderBody = z.output<typeof OrderBodySchema>;
export type Order = z.output<typeof OrderSchema>;
