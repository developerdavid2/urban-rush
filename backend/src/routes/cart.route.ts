import { Router } from "express";
import * as authMiddleware from "../middleware/authMiddleware";
import * as cartController from "../controllers/cartController";

const router = Router();

// All cart routes require authentication
router.use(authMiddleware.protect);

router.get("/", cartController.getCart);

router.post("/items", cartController.addToCart);

router.patch("/items/:productId", cartController.updateCartItem);

router.delete("/items/:productId", cartController.removeFromCart);

router.delete("/", cartController.clearCart);

export default router;
