import { Order } from "../types";

export type OrderControllerRequest = {
  customerId: string;
};

export type OrderControllerResponse = {
  data: Order[];
};

export interface IOrderController {
  getOrders(req: OrderControllerRequest): Promise<OrderControllerResponse>;
}
