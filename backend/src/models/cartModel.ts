import { model, Schema } from "mongoose";
import { CartDocument } from "../types/cart";

const cartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

cartSchema.index(
  { userId: 1, "items.productId": 1, clerkId: 1 },
  { unique: true }
);

const Cart = model<CartDocument>("Cart", cartSchema);

export default Cart;
