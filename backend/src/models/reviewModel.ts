// models/review.model.ts
import { Model, model, Schema, Types } from "mongoose";
import { ReviewDocument } from "../types/review";
import Product from "./productModel";

export interface ReviewModel extends Model<ReviewDocument> {
  updateProductRatings(productId: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<ReviewDocument, ReviewModel>(
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

reviewSchema.statics.updateProductRatings = async function (
  productId: Types.ObjectId
) {
  const stats = await this.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    const { ratingsQuantity, ratingsAverage } = stats[0];
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity,
      ratingsAverage: Math.round(ratingsAverage * 10) / 10,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

const Review = model<ReviewDocument, ReviewModel>("Review", reviewSchema);

export default Review;
