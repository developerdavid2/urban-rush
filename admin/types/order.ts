import { Product } from "./product";
import { Address } from "./user";

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

export interface Order {
  _id: string;
  userId: OrderUser;
  clerkId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentIntentId?: string;
  hasReviewed?: boolean;
  deliveredAt?: string;
  cancelledAt?: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  productId: Product;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderKey = keyof Order;
