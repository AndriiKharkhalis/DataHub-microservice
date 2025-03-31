import { OrderBody, Order } from "../types/order";

export interface IOrderService {
  createOrder(order: OrderBody): Promise<void>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
}
