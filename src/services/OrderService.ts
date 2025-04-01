import {
  ILogger,
  IOrderRepository,
  IOrderService,
  QueryOrdersRequest,
  QueryOrdersResponse,
} from "../domain";

export type OrderServiceDependencies = {
  orderRepository: IOrderRepository;
  logger: ILogger;
};

export class OrderService implements IOrderService {
  constructor(private readonly $: OrderServiceDependencies) {}

  async queryOrders(req: QueryOrdersRequest): Promise<QueryOrdersResponse> {
    const { customerId } = req;

    try {
      const orders = await this.$.orderRepository.getManyByCustomerId(customerId);

      return { orders };
    } catch (error) {
      this.$.logger.error(
        `OrderService.queryOrders: Failed to fetch orders for customer ID ${customerId}`,
        error,
      );
      return { orders: [] };
    }
  }
}
