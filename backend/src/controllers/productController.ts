import { Request, Response } from "express";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary";
import Product from "../models/productModel";
import mongoose from "mongoose";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .populate({ path: "reviews" })
      .sort({ createdAt: -1 });

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
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const product = await Product.findById(id).populate({ path: "reviews" });

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
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  let uploadedCloudinaryUrls: string[] = [];
  const files = req.files as Express.Multer.File[];

  try {
    const {
      name,
      description,
      summary,
      price,
      category,
      stock,
      priceDiscount,
    } = req.body;

    if (
      !name ||
      !description ||
      !summary ||
      !price ||
      !category ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, summary, price, category, stock",
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    if (files.length > 4) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => {}))
      );
      return res.status(400).json({
        success: false,
        message: "Maximum of 4 images allowed",
      });
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "products",
        transformation: [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto" },
        ],
      })
    );

    const uploadResults = await Promise.all(uploadPromises);
    uploadedCloudinaryUrls = uploadResults.map((result) => result.secure_url);

    await Promise.all(
      files.map((file) =>
        fs.unlink(file.path).catch((err) => {
          console.error(`Failed to delete file ${file.path}:`, err);
        })
      )
    );

    const product = await Product.create({
      name,
      description,
      summary,
      price: parseFloat(price),
      priceDiscount: priceDiscount ? parseFloat(priceDiscount) : 0,
      category,
      stock: parseInt(stock),
      images: uploadedCloudinaryUrls,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (uploadedCloudinaryUrls.length > 0) {
      const publicIds = uploadedCloudinaryUrls.map((url) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        return `products/${filename.split(".")[0]}`;
      });

      await Promise.all(
        publicIds.map((id) =>
          cloudinary.uploader
            .destroy(id)
            .catch((err) =>
              console.error(`Failed to delete from Cloudinary:`, err)
            )
        )
      );
    }

    if (files) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => {}))
      );
    }

    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  let uploadedCloudinaryUrls: string[] = [];

  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Product ID is required" });

    const {
      name,
      description,
      summary,
      price,
      category,
      stock,
      priceDiscount,
      removedImages,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update scalar fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (summary) product.summary = summary;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (priceDiscount) product.priceDiscount = parseFloat(priceDiscount);

    // Handle images
    let finalImages = [...(product.images || [])];

    // Remove specified existing images
    let removedFromProduct: string[] = [];
    if (removedImages && removedImages.length > 0) {
      const removed = Array.isArray(removedImages)
        ? removedImages
        : [removedImages];
      removedFromProduct = finalImages.filter((url) => removed.includes(url));
      finalImages = finalImages.filter(
        (url) => !removedFromProduct.includes(url)
      );

      // Optional: delete from Cloudinary
      const publicIds = removed.map((url: string) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        return `products/${filename.split(".")[0]}`;
      });

      await Promise.all(
        publicIds.map((pid) => cloudinary.uploader.destroy(pid).catch(() => {}))
      );
    }

    // Add new images if uploaded
    if (files && files.length > 0) {
      if (files.length > 4) {
        return res.status(400).json({ message: "Maximum of 4 images allowed" });
      }

      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "products",
          transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto" },
          ],
        })
      );

      const uploadResults = await Promise.all(uploadPromises);
      uploadedCloudinaryUrls = uploadResults.map((result) => result.secure_url);

      finalImages = [...finalImages, ...uploadedCloudinaryUrls];

      await Promise.all(
        files.map((file) =>
          fs.unlink(file.path).catch((err) => {
            console.error(`Failed to delete file ${file.path}:`, err);
          })
        )
      );
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
      const publicIds = removedFromProduct.map((url: string) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        return `products/${filename.split(".")[0]}`;
      });

      await Promise.all(
        publicIds.map((pid) => cloudinary.uploader.destroy(pid).catch(() => {}))
      );
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (uploadedCloudinaryUrls.length > 0) {
      const publicIds = uploadedCloudinaryUrls.map((url) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        return `products/${filename.split(".")[0]}`;
      });

      await Promise.all(
        publicIds.map((id) =>
          cloudinary.uploader
            .destroy(id)
            .catch((err) =>
              console.error(`Failed to delete from Cloudinary:`, err)
            )
        )
      );
    }

    if (files) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => {}))
      );
    }

    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map((url: string) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        return `products/${filename.split(".")[0]}`;
      });

      await Promise.all(
        publicIds.map((id: string) =>
          cloudinary.uploader
            .destroy(id)
            .catch((err) =>
              console.error(`Failed to delete from Cloudinary:`, err)
            )
        )
      );
    }
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting product", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
