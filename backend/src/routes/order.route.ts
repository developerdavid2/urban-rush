import { Router } from "express";
import * as authMiddleware from "../middleware/authMiddleware";
import * as orderController from "../controllers/orderController";

const router = Router();

router.use(authMiddleware.protect);
router.get("/me", orderController.getMyOrders);
router.post("/me/create", orderController.createOrder);

// Admin-only routes
router.use(authMiddleware.restrictTo("admin"));
router.get("/dashboard/stats", orderController.getDashboardStats);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", orderController.updateOrderStatus);
export default router;
