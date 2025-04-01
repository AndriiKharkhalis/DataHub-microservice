import { Order } from "../types/order";

export type QueryOrderRequest = {
  customerId: string;
};

export type QueryOrderResponse = {
  orders: Order[];
};

export interface IOrderService {
  queryOrders(req: QueryOrderRequest): Promise<QueryOrderResponse>;
}
