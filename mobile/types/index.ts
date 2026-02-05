// types/index.ts

export interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  priceDiscount?: number;
  summary: string;
  description: string;
  images: string[];
  category: string;
  stock: number;
  status?: string;
  reviews?: Review[];
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl: string;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  fullName: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault?: boolean;
}

export interface Order {
  _id: string;
  userId: string;
  clerkId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentIntentId?: string;
  hasReviewed: boolean;
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

export interface Review {
  _id: string;
  productId: string;
  userId: string | User;
  orderId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  userId?: string;
  clerkId?: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type SecurityOption = {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: "toggle" | "navigation";
  value?: boolean;
};
