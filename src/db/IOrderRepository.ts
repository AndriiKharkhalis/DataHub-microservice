import { Order, OrderBody } from "../types/order";

export interface IOrderRepository {
  saveOrder(order: OrderBody): Promise<void>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
}
