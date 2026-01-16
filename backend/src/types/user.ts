import mongoose, { Document } from "mongoose";

export interface Address {
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

export interface UserDocument extends Document {
  clerkId: string;
  email: string;
  name?: string;
  profileImageUrl?: string;
  addresses: Address[];
  wishlist: mongoose.Types.ObjectId[];
  role: "customer" | "admin";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}
