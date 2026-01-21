"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const express_1 = require("@clerk/express");
const userModel_1 = __importDefault(require("../models/userModel"));
exports.protect = [
    (0, express_1.requireAuth)(),
    async (req, res, next) => {
        try {
            // Get userId from Clerk's auth
            const { userId } = req.auth();
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized - No user ID" });
            }
            const user = await userModel_1.default.findOne({ clerkId: userId }).lean();
            if (!user) {
                return res.status(404).json({ message: "User not found in database" });
            }
            // Attach the typed user to req
            req.user = user;
            next();
        }
        catch (error) {
            console.error("Error in protect middleware:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
];
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission to perform this action",
            });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=authMiddleware.js.map