import { Router } from "express";
import * as authMiddleware from "../middleware/authMiddleware";
import * as orderController from "../controllers/orderController";

const router = Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", orderController.updateOrderStatus);
router.get("/dashboard/stats", orderController.getDashboardStats);

export default router;
