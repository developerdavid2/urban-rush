import { model, Schema } from "mongoose";
import { OrderDocument } from "../types/order";

const orderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: {
          type: Number,
          min: [0, "Price cannot be negative"],
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        image: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentIntentId: { type: String, unique: true, sparse: true },
    deliveredAt: Date,
    cancelledAt: Date,
    shippedAt: Date,
  },
  {
    timestamps: true,
  }
);
const Order = model<OrderDocument>("Order", orderSchema);

export default Order;
