"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = exports.getReviewsByProduct = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose_1.default.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid ID format" });
        }
        const reviews = await reviewModel_1.default.find({ productId })
            .populate("userId", "name profileImageUrl")
            .sort({ createdAt: -1 });
        if (reviews.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No reviews found",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            results: reviews.length,
            data: reviews,
        });
    }
    catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getReviewsByProduct = getReviewsByProduct;
// ── Create review (only for delivered orders)
const createReview = async (req, res) => {
    try {
        const { productId, review, rating, orderId } = req.body;
        const userId = req.user._id;
        // Validate input
        if (!productId || !review?.trim() || !rating || !orderId) {
            return res
                .status(400)
                .json({ success: false, message: "All fields required" });
        }
        if (rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ success: false, message: "Rating must be 1 - 5" });
        }
        // Verify order: exists, belongs to user, is delivered
        const order = await orderModel_1.default.findOne({
            _id: orderId,
            userId,
            orderStatus: "delivered",
        });
        if (!order) {
            return res.status(403).json({
                success: false,
                message: "You can only review delivered orders you own",
            });
        }
        // Verify product was in the order
        const itemInOrder = order.items.some((item) => item.productId.toString() === productId);
        if (!itemInOrder) {
            return res
                .status(403)
                .json({ success: false, message: "Product not in this order" });
        }
        //Check if review already exists
        const existingReview = await reviewModel_1.default.findOne({ productId, userId });
        if (existingReview) {
            return res
                .status(400)
                .json({ success: false, message: "You already reviewd this product" });
        }
        // Create review
        const newReview = await reviewModel_1.default.create({
            review: review.trim(),
            rating,
            productId,
            userId,
            orderId,
        });
        await reviewModel_1.default.updateProductRatings(productId);
        res.status(201).json({
            success: true,
            message: "Review created",
            data: newReview,
        });
    }
    catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createReview = createReview;
// ── Update own review ───────────────────────────────────────────────────────
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { review, rating } = req.body;
        const userId = req.user._id;
        const existingReview = await reviewModel_1.default.findById(id);
        if (!existingReview) {
            return res
                .status(404)
                .json({ success: false, message: "Review not found" });
        }
        if (existingReview.userId.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ success: false, message: "You can only edit your own review" });
        }
        if (rating && (rating < 1 || rating > 5)) {
            return res
                .status(400)
                .json({ success: false, message: "Rating must be 1–5" });
        }
        const updatedReview = await reviewModel_1.default.findByIdAndUpdate(id, { review: review?.trim(), rating }, { new: true, runValidators: true });
        // Recalculate ratings (type-safe)
        await reviewModel_1.default.updateProductRatings(existingReview.productId);
        res.status(200).json({
            success: true,
            message: "Review updated",
            data: updatedReview,
        });
    }
    catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateReview = updateReview;
// ── Delete own review ───────────────────────────────────────────────────────
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const review = await reviewModel_1.default.findById(id);
        if (!review) {
            return res
                .status(404)
                .json({ success: false, message: "Review not found" });
        }
        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own review",
            });
        }
        await reviewModel_1.default.findByIdAndDelete(id);
        // Recalculate ratings (type-safe)
        await reviewModel_1.default.updateProductRatings(review.productId);
        res.status(200).json({
            success: true,
            message: "Review deleted",
        });
    }
    catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.deleteReview = deleteReview;
//# sourceMappingURL=reviewController.js.map