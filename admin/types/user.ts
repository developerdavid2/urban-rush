import { Product } from "./product";

export type Address = {
  _id?: string;
  fullName: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault?: boolean;
};

export type User = {
  _id?: string;
  clerkId: string;
  email: string;
  name?: string;
  profileImageUrl?: string;
  stripeCustomerId?: string;
  addresses: Address[];
  wishlist: Product[];
  role: "customer" | "admin";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
};

export type UserKey = keyof User;
