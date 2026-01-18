import { Request, Response } from "express";
import Order from "../models/orderModel";
import User from "../models/userModel";
import Product from "../models/productModel";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error,
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
      error: error,
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
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error,
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
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error,
    });
  }
};
