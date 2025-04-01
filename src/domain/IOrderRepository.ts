import { Order, OrderBody } from "../types";

export interface IOrderRepository {
  create(order: OrderBody): Promise<void>;
  getManyByCustomerId(customerId: string): Promise<Order[]>;
}
