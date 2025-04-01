import { Order, OrderBody } from "../types";

export interface IOrderRepository {
  saveOrder(order: OrderBody): Promise<void>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
}
