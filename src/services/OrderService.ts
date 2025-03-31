import { IOrderRepository, IOrderService } from "../domain";
import { OrderBody, Order } from "../types/order";

export type OrderServiceDependencies = {
  orderRepository: IOrderRepository;
};

export class OrderService implements IOrderService {
  constructor(private readonly $: OrderServiceDependencies) {}

  async createOrder(order: OrderBody): Promise<void> {
    return this.$.orderRepository.saveOrder(order);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.$.orderRepository.getOrdersByCustomer(customerId);
  }
}
