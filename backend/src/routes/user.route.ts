import { Router } from "express";

import * as authMiddleware from "../middleware/authMiddleware";
import * as userController from "../controllers/userController";

const router = Router();
router.use(authMiddleware.protect);

// Current user ("me") endpoints
router.get("/me", userController.getCurrentUser);
// router.patch("/me", userController.updateCurrentUser); // e.g. update name/profile

// Address management for current user
router.get("/me/addresses", userController.getMyAddresses);
router.post("/me/addresses", userController.addAddress);
router.patch("/me/addresses/:addressId", userController.updateAddress);
router.delete("/me/addresses/:addressId", userController.deleteAddress);

// Wishlist management for current user
router.get("/me/wishlist", userController.getWishlist);
router.post("/me/wishlist", userController.addToWishlist); // body: { productId }
router.delete("/me/wishlist/:productId", userController.removeFromWishlist);

// Fetch All users
router.use(authMiddleware.restrictTo("admin"));
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

export default router;
