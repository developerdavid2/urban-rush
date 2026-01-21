"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },
    clerkId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    items: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"],
            },
        },
    ],
}, {
    timestamps: true,
});
cartSchema.index({ userId: 1, "items.productId": 1, clerkId: 1 }, { unique: true });
const Cart = (0, mongoose_1.model)("Cart", cartSchema);
exports.default = Cart;
//# sourceMappingURL=cartModel.js.map