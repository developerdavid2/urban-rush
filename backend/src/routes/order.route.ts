import { Router } from "express";
import * as authMiddleware from "../middleware/authMiddleware";
import * as orderController from "../controllers/orderController";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();

router.use(authMiddleware.protect);
router.get("/me", orderController.getMyOrders);

router.use(authMiddleware.restrictTo("admin"));

// Manual order creation
router.post("/manual/create", orderController.createManualOrder);

// Dashboard Analytics APIs
router.get("/dashboard/stats", dashboardController.getDashboardStats);
router.get("/dashboard/earnings", dashboardController.getEarningsAnalytics);
router.get(
  "/dashboard/top-products",
  dashboardController.getTopSellingProducts
);
router.get("/dashboard/geography", dashboardController.getGeographyAnalytics);
router.get("/dashboard/top-customers", dashboardController.getTopCustomers);
router.get("/dashboard/recent", dashboardController.getRecentOrders);

// Order management
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", orderController.updateOrderStatus);

export default router;
