"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/review.model.ts
const mongoose_1 = require("mongoose");
const productModel_1 = __importDefault(require("./productModel"));
const reviewSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Review must belong to a product"],
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a user"],
        index: true,
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Order",
        required: [true, "Review must be associated with an order"],
        index: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.statics.updateProductRatings = async function (productId) {
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
        await productModel_1.default.findByIdAndUpdate(productId, {
            ratingsQuantity,
            ratingsAverage: Math.round(ratingsAverage * 10) / 10,
        });
    }
    else {
        await productModel_1.default.findByIdAndUpdate(productId, {
            ratingsQuantity: 0,
            ratingsAverage: 0,
        });
    }
};
const Review = (0, mongoose_1.model)("Review", reviewSchema);
exports.default = Review;
//# sourceMappingURL=reviewModel.js.map