"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "A product must have a name"],
        unique: true,
        trim: true,
        maxlength: [100, "Product name must be less than 100 characters"],
        minlength: [3, "Product name must be at least 3 characters"],
    },
    slug: {
        type: String,
        lowercase: true,
        index: true,
    },
    price: {
        type: Number,
        required: [true, "A product must have a price"],
        min: [0, "Price cannot be negative"],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: "Discount price ({VALUE}) should be below regular price",
        },
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A product must have a short summary"],
        maxlength: [500, "Summary must be less than 500 characters"],
    },
    description: {
        type: String,
        trim: true,
        required: [true, "A product must have a description"],
    },
    images: {
        type: [String],
        required: [true, "A product must have at least one image"],
        validate: {
            validator: function (arr) {
                return arr.length > 0 && arr.length <= 4;
            },
            message: "Product must have between 1 and 4 images",
        },
    },
    category: {
        type: String,
        required: [true, "A product must belong to a category"],
        index: true,
    },
    stock: {
        type: Number,
        required: [true, "A product must have stock quantity"],
        min: [0, "Stock cannot be negative"],
        default: 0,
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [0, "Rating must be at least 0"],
        max: [5, "Rating must be at most 5"],
        set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ name: "text", summary: "text", description: "text" });
// Virtual for reviews
productSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "product",
    localField: "_id",
});
// Virtual for in stock
productSchema.virtual("inStock").get(function () {
    return this.stock > 0;
});
// Pre-save middleware: Generate slug - NO MORE ERRORS!
productSchema.pre("save", async function () {
    if (this.isModified("name")) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
    }
});
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
//# sourceMappingURL=productModel.js.map