import mongoose from "mongoose";
import { ProductDocument } from "../types/product";

const productSchema = new mongoose.Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        100,
        "Product name must have less or equal to 100 characters",
      ],
      minlength: [3, "Product name must have more or equal to 3 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price cannot be negative"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ProductDocument, val: number) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A product must have a short summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    images: [String],
    category: {
      type: String,
      required: [true, "A product must belong to a category"],
    },
    stock: {
      type: Number,
      required: [true, "A product must have stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

const Product = mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
