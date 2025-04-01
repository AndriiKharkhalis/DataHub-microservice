import { ExternalOrder } from "../types";

export type HandleOrderRequest = {
  order: ExternalOrder;
};

export interface IExternalOrderHandler {
  handleOrder(req: HandleOrderRequest): Promise<void>;
  consumeEvent(): Promise<void>;
}
