import { Request, Response } from "express";
import Order from "../models/orderModel";
import User from "../models/userModel";
import Product from "../models/productModel";
import mongoose from "mongoose";
import Review from "../models/reviewModel";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
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
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res
      .status(400)
      .json({ status: "error", message: "Order ID is required" });

  try {
    const order = await Order.findById(id)
      .populate("items.productId")
      .populate("userId", "name email");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};
export const updateOrderStatus = async (req: Request, res: Response) => {
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
  if (
    !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
      orderStatus
    )
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order status" });
  }
  try {
    const order = await Order.findById(id);
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
  } catch (error) {
    console.error("Error updating status", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const totalCustomers = await User.countDocuments({ role: "customer" });

    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        orders: {
          current: totalOrders,
          previous: 0,
        },
        revenue: {
          current: totalRevenue,
          previous: 0,
        },
        customers: {
          current: totalCustomers,
          previous: 0,
        },
        products: {
          current: totalProducts,
          previous: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

// USERS (CUSTOMERS) ORDER CONTROLLERS
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const orders = await Order.find({ clerkId })
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
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewOrderIds: Set<string> = new Set(
      reviews.map((review) => review.orderId.toString())
    );

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewOrderIds.has(order._id.toString()),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: ordersWithReviewStatus,
    });
  } catch (error) {
    console.error("Error fetching user orders", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
    });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  //start a transction
  const session = await mongoose.startSession();
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

    const { items, shippingAddress, paymentStatus, orderStatus, totalAmount } =
      req.body;

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
      const product = await Product.findById(item.productId).session(session);
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

    const newOrder = new Order({
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
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating order", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};
