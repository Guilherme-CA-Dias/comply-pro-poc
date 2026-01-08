export interface Order {
  _id: string;
  name: string;
  externalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
}

