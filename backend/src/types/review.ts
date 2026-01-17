import mongoose, { Document } from "mongoose";

export interface ReviewDocument extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
}
