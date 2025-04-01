import { ExternalOrder } from "../types/externalOrder";

export interface IExternalOrderHandler {
  handleOrder(order: ExternalOrder): Promise<void>;
  consumeEvent(order: ExternalOrder): Promise<void>;
}
