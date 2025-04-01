import { Order } from "../types/order";

export type QueryOrdersRequest = {
  customerId: string;
};

export type QueryOrdersResponse = {
  orders: Order[];
};

export interface IOrderService {
  queryOrders(req: QueryOrdersRequest): Promise<QueryOrdersResponse>;
}
