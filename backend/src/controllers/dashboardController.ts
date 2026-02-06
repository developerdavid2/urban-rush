import { Request, Response } from "express";
import Order from "../models/orderModel";
import User from "../models/userModel";
import Product from "../models/productModel";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" },
      },
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

export const getEarningsAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = "monthly", startDate, endDate } = req.query;

    let groupBy: Record<string, unknown> = {};
    let dateRange: { createdAt: { $gte: Date; $lte?: Date } };

    // Calculate date range
    const now = new Date();
    let start: Date;
    let end = now;

    if (startDate && endDate) {
      // Custom date range
      start = new Date(startDate as string);
      end = new Date(endDate as string);
      // Default to monthly grouping for custom ranges
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    } else {
      // Predefined periods
      switch (period) {
        case "monthly":
          start = new Date(now.getFullYear(), 0, 1); // Start of year
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
          break;
        case "quarterly":
          start = new Date(now.getFullYear(), 0, 1);
          groupBy = {
            year: { $year: "$createdAt" },
            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
          };
          break;
        case "annually":
          start = new Date(now.getFullYear() - 5, 0, 1); // Last 5 years
          groupBy = {
            year: { $year: "$createdAt" },
          };
          break;
        default:
          start = new Date(now.getFullYear(), 0, 1);
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
      }
    }

    dateRange = {
      createdAt: { $gte: start, $lte: end },
    };

    // Aggregation for paid orders
    const paidOrdersAgg = await Order.aggregate([
      {
        $match: {
          ...dateRange,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.quarter": 1 },
      },
    ]);

    // Aggregation for all orders (including pending)
    const allOrdersAgg = await Order.aggregate([
      {
        $match: dateRange,
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.quarter": 1 },
      },
    ]);

    // Format response based on period
    const formatPeriodLabel = (data: any) => {
      if (data._id.month) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[data._id.month - 1];
      }
      if (data._id.quarter) {
        return `Q${data._id.quarter} ${data._id.year}`;
      }
      return data._id.year.toString();
    };

    const formattedData = paidOrdersAgg.map((paid, index) => ({
      period: formatPeriodLabel(paid),
      revenue: paid.revenue,
      sales: allOrdersAgg[index]?.totalSales || 0,
      revenueOrders: paid.orderCount,
      totalOrders: allOrdersAgg[index]?.orderCount || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        period: period as string,
        startDate: start,
        endDate: end,
        analytics: formattedData,
      },
    });
  } catch (error) {
    console.error("Error fetching earnings analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings analytics",
    });
  }
};

export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid", // Only count paid orders
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          numberOfOrders: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          productId: "$_id",
          name: "$productName",
          image: "$productImage",
          totalQuantitySold: 1,
          totalRevenue: 1,
          numberOfOrders: 1,
          currentStock: { $arrayElemAt: ["$productDetails.stock", 0] },
          category: { $arrayElemAt: ["$productDetails.category", 0] },
        },
      },
    ]);

    // Calculate total across all top products
    const totals = topProducts.reduce(
      (acc, product) => ({
        totalRevenue: acc.totalRevenue + product.totalRevenue,
        totalQuantity: acc.totalQuantity + product.totalQuantitySold,
        totalOrders: acc.totalOrders + product.numberOfOrders,
      }),
      { totalRevenue: 0, totalQuantity: 0, totalOrders: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        products: topProducts,
        totals,
      },
    });
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top selling products",
    });
  }
};

export const getGeographyAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = "30days" } = req.query;

    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    if (period === "7days") daysBack = 7;

    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Aggregate by country
    const countryStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: "$shippingAddress.country",
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          customers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          country: "$_id",
          totalRevenue: 1,
          orderCount: 1,
          customerCount: { $size: "$customers" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    // Calculate total revenue across all countries for percentage
    const totalRevenueAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const globalRevenue =
      totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue : 1;

    // Add percentage to each country
    const countriesWithPercentage = countryStats.map((country) => ({
      ...country,
      percentage: ((country.totalRevenue / globalRevenue) * 100).toFixed(2),
      revenuePerCustomer: (
        country.totalRevenue / country.customerCount
      ).toFixed(2),
    }));

    // Calculate aggregate totals for top 5
    const top5Totals = countriesWithPercentage.reduce(
      (acc, country) => ({
        totalRevenue: acc.totalRevenue + country.totalRevenue,
        totalOrders: acc.totalOrders + country.orderCount,
        totalCustomers: acc.totalCustomers + country.customerCount,
      }),
      { totalRevenue: 0, totalOrders: 0, totalCustomers: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        period,
        countries: countriesWithPercentage,
        top5Totals: {
          ...top5Totals,
          percentageOfGlobal: (
            (top5Totals.totalRevenue / globalRevenue) *
            100
          ).toFixed(2),
        },
        globalRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching geography analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch geography analytics",
    });
  }
};

export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const topCustomers = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: "$userId",
          clerkId: { $first: "$clerkId" },
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          customerId: "$_id",
          clerkId: 1,
          name: { $arrayElemAt: ["$userDetails.name", 0] },
          email: { $arrayElemAt: ["$userDetails.email", 0] },
          totalSpent: 1,
          orderCount: 1,
          lastOrderDate: 1,
          avgOrderValue: 1,
          lifetimeValue: "$totalSpent", // Same as totalSpent
        },
      },
    ]);

    // Calculate totals
    const totals = topCustomers.reduce(
      (acc, customer) => ({
        totalRevenue: acc.totalRevenue + customer.totalSpent,
        totalOrders: acc.totalOrders + customer.orderCount,
      }),
      { totalRevenue: 0, totalOrders: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        customers: topCustomers,
        totals: {
          ...totals,
          avgCustomerValue:
            topCustomers.length > 0
              ? (totals.totalRevenue / topCustomers.length).toFixed(2)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching top customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top customers",
    });
  }
};

export const getRecentOrders = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(skip)
      .lean();

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        orders: recentOrders,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: Math.ceil(totalOrders / parseInt(limit as string)),
          totalOrders,
          ordersPerPage: parseInt(limit as string),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
    });
  }
};
