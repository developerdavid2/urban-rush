import { model, Schema } from "mongoose";
import { ReviewDocument } from "../types/review";

const reviewSchema = new Schema<ReviewDocument>(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty!"],
      trim: true,
      maxlength: [500, "Review must be less or equal to 500 characters"],
    },
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Review must be associated with an order"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = model<ReviewDocument>("Review", reviewSchema);
export default Review;
