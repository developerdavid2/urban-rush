"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const cartModel_1 = __importDefault(require("../models/cartModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        let cart = await cartModel_1.default.findOne({ userId }).populate("items.productId", "name price images");
        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { items: [] },
            });
        }
        res.status(200).json({
            success: true,
            data: cart,
        });
    }
    catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user._id;
        if (!productId || !mongoose_1.default.isValidObjectId(productId)) {
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
        const product = await productModel_1.default.findById(productId);
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
        let cart = await cartModel_1.default.findOne({ userId });
        if (!cart) {
            cart = await cartModel_1.default.create({
                userId,
                clerkId: req.user.clerkId,
                items: [{ productId, quantity }],
            });
        }
        else {
            // Check if item already exists → increment quantity
            const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
            if (itemIndex !== -1) {
                cart.items[itemIndex].quantity += quantity;
                // Optional: check total stock again
                if (cart.items[itemIndex].quantity > product.stock) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Insufficient stock" });
                }
            }
            else {
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
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;
        if (!mongoose_1.default.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product ID" });
        }
        if (!quantity || quantity < 1) {
            return res
                .status(400)
                .json({ success: false, message: "Quantity must be at least 1" });
        }
        const cart = await cartModel_1.default.findOne({ userId });
        if (!cart) {
            return res
                .status(404)
                .json({ success: false, message: "Cart not found" });
        }
        const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res
                .status(404)
                .json({ success: false, message: "Item not in cart" });
        }
        // Check stock
        const product = await productModel_1.default.findById(productId);
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
    }
    catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;
        if (!mongoose_1.default.isValidObjectId(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid product ID" });
        }
        const cart = await cartModel_1.default.findOneAndUpdate({ userId }, { $pull: { items: { productId } } }, { new: true });
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
    }
    catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await cartModel_1.default.findOneAndUpdate({ userId }, { $set: { items: [] } }, { new: true });
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
    }
    catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.clearCart = clearCart;
//# sourceMappingURL=cartController.js.map