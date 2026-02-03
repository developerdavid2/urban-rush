import { Request, Response } from "express";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import mongoose from "mongoose";
import { AnyAaaaRecord } from "node:dns";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;

    let cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price images"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [] },
      });
    }

    const transformedCart = {
      ...cart.toObject(),
      items: cart.items
        .filter((item: any) => item.productId !== null)
        .map((item: any) => ({
          _id: item._id,
          product: item.productId,
          quantity: item.quantity,
        })),
    };

    res.status(200).json({
      success: true,
      data: transformedCart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user!._id;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    if (quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        clerkId: req.user!.clerkId,
        items: [{ productId, quantity }],
      });
    } else {
      // Check if item already exists → increment quantity
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex !== -1) {
        cart.items[itemIndex].quantity += quantity;

        // Optional: check total stock again
        if (cart.items[itemIndex].quantity > product.stock) {
          return res
            .status(400)
            .json({ success: false, message: "Insufficient stock" });
        }
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    // Populate for response
    await cart.populate("items.productId", "name price images");

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user!._id;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not in cart" });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate("items.productId", "name price images");

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user!._id;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    await cart.populate("items.productId", "name price images");

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
