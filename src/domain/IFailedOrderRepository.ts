import { FailedOrderBody } from "../types";

export interface IFailedOrderRepository {
  create(order: FailedOrderBody): Promise<void>;
}
