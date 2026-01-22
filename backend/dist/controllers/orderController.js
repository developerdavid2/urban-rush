"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getMyOrders = exports.getDashboardStats = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel_1.default.find()
            .populate("items.productId")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        if (orders.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No orders found",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        console.error("Error fetching orders", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res
            .status(400)
            .json({ status: "error", message: "Order ID is required" });
    try {
        const order = await orderModel_1.default.findById(id)
            .populate("items.productId")
            .populate("userId", "name email");
        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        console.log("Error getting order", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { orderStatus } = req.body;
    if (!id)
        return res
            .status(400)
            .json({ success: false, message: "Order ID is required" });
    if (!orderStatus)
        return res
            .status(400)
            .json({ success: false, message: "Order Status is required" });
    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(orderStatus)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid order status" });
    }
    try {
        const order = await orderModel_1.default.findById(id);
        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });
        }
        order.orderStatus = orderStatus;
        if (orderStatus === "shipped") {
            order.shippedAt = new Date();
        }
        if (orderStatus === "delivered") {
            order.deliveredAt = new Date();
        }
        if (orderStatus === "cancelled") {
            order.cancelledAt = new Date();
        }
        await order.save();
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        console.error("Error updating status", error);
        res.status(500).json({
            success: false,
            message: "Failed to update order status",
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await orderModel_1.default.countDocuments();
        const revenueAgg = await orderModel_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
        const totalCustomers = await userModel_1.default.countDocuments({ role: "customer" });
        const totalProducts = await productModel_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalRevenue,
                totalCustomers,
                totalProducts,
            },
        });
    }
    catch (error) {
        console.error("Error fetching dashboard stats", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
        });
    }
};
exports.getDashboardStats = getDashboardStats;
// USERS (CUSTOMERS) ORDER CONTROLLERS
const getMyOrders = async (req, res) => {
    try {
        const clerkId = req.user?.clerkId;
        if (!clerkId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const orders = await orderModel_1.default.find({ clerkId })
            .populate("items.productId")
            .sort({ createdAt: -1 });
        if (orders.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No orders found for this user",
                data: [],
            });
        }
        // check if each order has been reviewed
        const orderIds = orders.map((order) => order._id);
        const reviews = await reviewModel_1.default.find({ orderId: { $in: orderIds } });
        const reviewOrderIds = new Set(reviews.map((review) => review.orderId.toString()));
        const ordersWithReviewStatus = await Promise.all(orders.map(async (order) => {
            return {
                ...order.toObject(),
                hasReviewed: reviewOrderIds.has(order._id.toString()),
            };
        }));
        res.status(200).json({
            success: true,
            data: ordersWithReviewStatus,
        });
    }
    catch (error) {
        console.error("Error fetching user orders", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user orders",
        });
    }
};
exports.getMyOrders = getMyOrders;
const createOrder = async (req, res) => {
    //start a transction
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = req.user;
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { items, shippingAddress, paymentStatus, orderStatus, totalAmount } = req.body;
        if (!items || items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Order items are required",
            });
        }
        // Validate products, decrement stock, all within the session
        for (const item of items) {
            const product = await productModel_1.default.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res
                    .status(404)
                    .json({ success: false, message: `Product ${item.name} not found` });
            }
            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }
            product.stock -= item.quantity;
            await product.save({ session });
        }
        const newOrder = new orderModel_1.default({
            userId: user._id,
            clerkId: user.clerkId,
            items,
            totalAmount,
            shippingAddress,
            paymentStatus: paymentStatus || "pending",
            orderStatus: orderStatus || "pending",
        });
        const savedOrder = await newOrder.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            data: savedOrder,
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error creating order", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};
exports.createOrder = createOrder;
//# sourceMappingURL=orderController.js.map