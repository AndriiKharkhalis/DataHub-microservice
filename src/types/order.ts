import { z } from "zod";
import { OrderBodySchema, OrderSchema } from "../schemas/order";
import { Decimal } from "@prisma/client/runtime/library";

export type OrderBody = z.output<typeof OrderBodySchema>;
export type Order = z.output<typeof OrderSchema>;

export type OrderDB = {
  id: string;
  orderId: string;
  customerId: string;
  email: string;
  totalItems: number;
  totalAmount: Decimal;
  createdAt: Date;
};
