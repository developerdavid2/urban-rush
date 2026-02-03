import mongoose from "mongoose";
import { Address } from "./user";

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentIntentId?: string;
  deliveredAt?: Date;
  cancelledAt?: Date;
  shippedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
