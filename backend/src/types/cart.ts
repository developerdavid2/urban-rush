import mongoose, { Document } from "mongoose";

export interface CartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface CartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  items: CartItem[];
  updatedAt: Date;
}
