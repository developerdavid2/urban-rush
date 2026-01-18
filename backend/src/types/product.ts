import { Document } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  slug: string;
  price: number;
  priceDiscount?: number;
  summary: string;
  description: string;
  images: string[];
  category: string;
  stock: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}
