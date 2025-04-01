import { z } from "zod";
import { ItemSchema, ExternalOrderSchema } from "../schemas";

export type Item = z.output<typeof ItemSchema>;
export type ExternalOrder = z.output<typeof ExternalOrderSchema>;
