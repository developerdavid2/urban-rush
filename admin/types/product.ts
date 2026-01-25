export type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  priceDiscount?: number;
  stock: number;
  summary: string;
  description: string;
  images: string[];
};
