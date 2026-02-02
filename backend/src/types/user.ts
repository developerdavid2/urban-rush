import mongoose, { Document, Types } from "mongoose";

export interface Address {
  _id?: Types.ObjectId;
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
  stripeCustomerId?: string;
  addresses: Address[];
  wishlist: mongoose.Types.ObjectId[];
  role: "customer" | "admin";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}
