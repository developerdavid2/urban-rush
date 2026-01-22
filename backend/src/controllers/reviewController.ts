import { Request, Response } from "express";
import Order from "../models/orderModel";
import Review from "../models/reviewModel";
import mongoose from "mongoose";

export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const reviews = await Review.find({ productId })
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
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, review, rating, orderId } = req.body;
    const userId = req.user!._id;

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
    const order = await Order.findOne({
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
    const itemInOrder = order.items.some(
      (item) => item.productId.toString() === productId
    );
    if (!itemInOrder) {
      return res
        .status(403)
        .json({ success: false, message: "Product not in this order" });
    }

    //Check if review already exists
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this product" });
    }

    // Create review
    const newReview = await Review.create({
      review: review.trim(),
      rating,
      productId,
      userId,
      orderId,
    });

    await Review.updateProductRatings(productId);

    res.status(201).json({
      success: true,
      message: "Review created",
      data: newReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { review, rating } = req.body;
    const userId = req.user!._id;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID format" });
    }

    const existingReview = await Review.findById(id);

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

    // Build update object with only provided fields
    const updateFields: { review?: string; rating?: number } = {};
    if (review !== undefined) updateFields.review = review.trim();
    if (rating !== undefined) updateFields.rating = rating;

    const updatedReview = await Review.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    // Recalculate ratings (type-safe)
    await Review.updateProductRatings(existingReview.productId);

    res.status(200).json({
      success: true,
      message: "Review updated",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID format" });
    }

    const review = await Review.findById(id);

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

    await Review.findByIdAndDelete(id);

    await Review.updateProductRatings(review.productId);

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
