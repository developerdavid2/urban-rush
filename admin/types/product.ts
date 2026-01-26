// types/product.ts
export type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  priceDiscount?: number;
  stock: number;
  status?: string;
  summary: string;
  description: string;
  images: string[];
};

export type ProductKey = keyof Product;
