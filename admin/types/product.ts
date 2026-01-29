// types/product.ts
export type Product = {
  _id: string;
  slug: string;
  name: string;
  price: number;
  priceDiscount: number;
  summary: string;
  description: string;
  images: string[];
  category: string;
  stock: number;
  status?: string;
  reviews?: [];
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductKey = keyof Product;
