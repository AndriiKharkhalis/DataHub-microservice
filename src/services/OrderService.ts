import { IOrderRepository, IOrderService, QueryOrderRequest, QueryOrderResponse } from "../domain";

export type OrderServiceDependencies = {
  orderRepository: IOrderRepository;
};

export class OrderService implements IOrderService {
  constructor(private readonly $: OrderServiceDependencies) {}

  async queryOrders(req: QueryOrderRequest): Promise<QueryOrderResponse> {
    const { customerId } = req;

    const orders = await this.$.orderRepository.getOrdersByCustomer(customerId);

    return { orders };
  }
}
