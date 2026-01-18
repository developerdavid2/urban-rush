import { Request, Response } from "express";
import fs from "fs/promises";
import cloudinary from "../config/cloudinary";
import Product from "../models/productModel";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(404).json({
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

export const getProductById = (req: Request, res: Response) => {
  throw new Error("Function not implemented.");
};

export const createProduct = async (req: Request, res: Response) => {
  let uploadedCloudinaryUrls: string[] = [];
  const files = req.files as Express.Multer.File[];

  try {
    // 1. Validate required fields
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

    // 2. Validate images
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    if (files.length > 4) {
      // Clean up uploaded files
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => {}))
      );
      return res.status(400).json({
        success: false,
        message: "Maximum of 4 images allowed",
      });
    }

    // 3. Upload images to Cloudinary
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

    // 4. Clean up local files after successful upload
    await Promise.all(
      files.map((file) =>
        fs.unlink(file.path).catch((err) => {
          console.error(`Failed to delete file ${file.path}:`, err);
        })
      )
    );

    // 5. Create product (single operation - atomic by default!)
    const product = await Product.create({
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
  } catch (error) {
    // Clean up Cloudinary uploads if product creation failed
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

    // Clean up local files
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
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (summary) product.summary = summary;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (priceDiscount) product.priceDiscount = parseFloat(priceDiscount);

    //handle images if provided

    if (files && files.length > 0) {
      if (files.length > 4) {
        return res.status(400).json({ message: "Maximum of 4 images allowed" });
      }
      // Upload new images to Cloudinary
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
      const uploadedCloudinaryUrls = uploadResults.map(
        (result) => result.secure_url
      );
      product.images = uploadedCloudinaryUrls;

      // Clean up local files after successful upload
      await Promise.all(
        files.map((file) =>
          fs.unlink(file.path).catch((err) => {
            console.error(`Failed to delete file ${file.path}:`, err);
          })
        )
      );
    }
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // Clean up local files in case of error

    if (files) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => {}))
      );
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {};
