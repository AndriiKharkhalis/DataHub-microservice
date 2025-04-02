import {
  IOrderController,
  IOrderService,
  OrderControllerRequest,
  OrderControllerResponse,
} from "../domain";

export type OrderControllerDependencies = {
  orderService: IOrderService;
};

export class OrderController implements IOrderController {
  constructor(private readonly $: OrderControllerDependencies) {}

  async getOrders(req: OrderControllerRequest): Promise<OrderControllerResponse> {
    const { customerId } = req;

    const fetchedData = await this.$.orderService.queryOrders({ customerId });

    return { data: fetchedData.data };
  }
}
