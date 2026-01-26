"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const productModel_1 = __importDefault(require("../models/productModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllProducts = async (req, res) => {
    try {
        const products = await productModel_1.default.find().sort({ createdAt: -1 });
        if (products.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No products found",
            });
        }
        res.status(200).json({
            success: true,
            results: products.length,
            data: products,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }
        const product = await productModel_1.default.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    let uploadedCloudinaryUrls = [];
    const files = req.files;
    try {
        const { name, description, summary, price, category, stock, priceDiscount, } = req.body;
        if (!name ||
            !description ||
            !summary ||
            !price ||
            !category ||
            stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, description, summary, price, category, stock",
            });
        }
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required",
            });
        }
        if (files.length > 4) {
            await Promise.all(files.map((file) => promises_1.default.unlink(file.path).catch(() => { })));
            return res.status(400).json({
                success: false,
                message: "Maximum of 4 images allowed",
            });
        }
        const uploadPromises = files.map((file) => cloudinary_1.default.uploader.upload(file.path, {
            folder: "products",
            transformation: [
                { width: 1000, height: 1000, crop: "limit" },
                { quality: "auto" },
            ],
        }));
        const uploadResults = await Promise.all(uploadPromises);
        uploadedCloudinaryUrls = uploadResults.map((result) => result.secure_url);
        await Promise.all(files.map((file) => promises_1.default.unlink(file.path).catch((err) => {
            console.error(`Failed to delete file ${file.path}:`, err);
        })));
        const product = await productModel_1.default.create({
            name,
            description,
            summary,
            price: parseFloat(price),
            priceDiscount: priceDiscount ? parseFloat(priceDiscount) : undefined,
            category,
            stock: parseInt(stock),
            images: uploadedCloudinaryUrls,
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        if (uploadedCloudinaryUrls.length > 0) {
            const publicIds = uploadedCloudinaryUrls.map((url) => {
                const parts = url.split("/");
                const filename = parts[parts.length - 1];
                return `products/${filename.split(".")[0]}`;
            });
            await Promise.all(publicIds.map((id) => cloudinary_1.default.uploader
                .destroy(id)
                .catch((err) => console.error(`Failed to delete from Cloudinary:`, err))));
        }
        if (files) {
            await Promise.all(files.map((file) => promises_1.default.unlink(file.path).catch(() => { })));
        }
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const files = req.files;
    let uploadedCloudinaryUrls = [];
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "Product ID is required" });
        const { name, description, summary, price, category, stock, priceDiscount, removedImages, } = req.body;
        const product = await productModel_1.default.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Update scalar fields
        if (name)
            product.name = name;
        if (description)
            product.description = description;
        if (summary)
            product.summary = summary;
        if (price)
            product.price = parseFloat(price);
        if (category)
            product.category = category;
        if (stock !== undefined)
            product.stock = parseInt(stock);
        if (priceDiscount)
            product.priceDiscount = parseFloat(priceDiscount);
        // Handle images
        let finalImages = [...(product.images || [])];
        // Remove specified existing images
        let removedFromProduct = [];
        if (removedImages && removedImages.length > 0) {
            const removed = Array.isArray(removedImages)
                ? removedImages
                : [removedImages];
            removedFromProduct = finalImages.filter((url) => removed.includes(url));
            finalImages = finalImages.filter((url) => !removedFromProduct.includes(url));
            // Optional: delete from Cloudinary
            const publicIds = removed.map((url) => {
                const parts = url.split("/");
                const filename = parts[parts.length - 1];
                return `products/${filename.split(".")[0]}`;
            });
            await Promise.all(publicIds.map((pid) => cloudinary_1.default.uploader.destroy(pid).catch(() => { })));
        }
        // Add new images if uploaded
        if (files && files.length > 0) {
            if (files.length > 4) {
                return res.status(400).json({ message: "Maximum of 4 images allowed" });
            }
            const uploadPromises = files.map((file) => cloudinary_1.default.uploader.upload(file.path, {
                folder: "products",
                transformation: [
                    { width: 1000, height: 1000, crop: "limit" },
                    { quality: "auto" },
                ],
            }));
            const uploadResults = await Promise.all(uploadPromises);
            uploadedCloudinaryUrls = uploadResults.map((result) => result.secure_url);
            finalImages = [...finalImages, ...uploadedCloudinaryUrls];
            await Promise.all(files.map((file) => promises_1.default.unlink(file.path).catch((err) => {
                console.error(`Failed to delete file ${file.path}:`, err);
            })));
        }
        // Final validation
        if (finalImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Product must have at least one image",
            });
        }
        product.images = finalImages;
        await product.save();
        if (removedFromProduct.length > 0) {
            const publicIds = removedFromProduct.map((url) => {
                const parts = url.split("/");
                const filename = parts[parts.length - 1];
                return `products/${filename.split(".")[0]}`;
            });
            await Promise.all(publicIds.map((pid) => cloudinary_1.default.uploader.destroy(pid).catch(() => { })));
        }
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        if (uploadedCloudinaryUrls.length > 0) {
            const publicIds = uploadedCloudinaryUrls.map((url) => {
                const parts = url.split("/");
                const filename = parts[parts.length - 1];
                return `products/${filename.split(".")[0]}`;
            });
            await Promise.all(publicIds.map((id) => cloudinary_1.default.uploader
                .destroy(id)
                .catch((err) => console.error(`Failed to delete from Cloudinary:`, err))));
        }
        if (files) {
            await Promise.all(files.map((file) => promises_1.default.unlink(file.path).catch(() => { })));
        }
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.isValidObjectId(id)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Product ID" });
        }
        const product = await productModel_1.default.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.images && product.images.length > 0) {
            const publicIds = product.images.map((url) => {
                const parts = url.split("/");
                const filename = parts[parts.length - 1];
                return `products/${filename.split(".")[0]}`;
            });
            await Promise.all(publicIds.map((id) => cloudinary_1.default.uploader
                .destroy(id)
                .catch((err) => console.error(`Failed to delete from Cloudinary:`, err))));
        }
        await productModel_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Product deleted",
            data: null,
        });
    }
    catch (error) {
        console.error("Error deleting product", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map