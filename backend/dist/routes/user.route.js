"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware = __importStar(require("../middleware/authMiddleware"));
const userController = __importStar(require("../controllers/userController"));
const router = (0, express_1.Router)();
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
exports.default = router;
//# sourceMappingURL=user.route.js.map