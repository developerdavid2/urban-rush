import { Request, Response } from "express";
import User from "../models/userModel";
import mongoose from "mongoose";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "Current user fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    if (users.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No users found",
      });
    }
    res.status(200).json({
      success: true,
      results: users.length,
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const {
      fullName,
      label,
      street,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      isDefault,
    } = req.body;

    const newAddress = {
      fullName,
      label,
      street,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      isDefault: isDefault || false,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      data: user,
      message: "Address added successfully",
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyAddresses = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user.addresses,
      message: "Addresses fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { addressId } = req.params; // Or use index if no _id on subdocs
    const {
      fullName,
      label,
      street,
      city,
      state,
      postalCode,
      country,
      phoneNumber,
      isDefault,
    } = req.body;

    const user = await User.findById(req.user!._id);
    if (!user)
      return res.status(404).json({ sucess: false, message: "User not found" });

    if (!mongoose.isValidObjectId(addressId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid address ID" });
    }

    const address = user.addresses.find((a) => a._id!.toString() === addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // If this is to be set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.fullName = fullName || address.fullName;
    address.label = label || address.label;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const addressId = req.params.addressId;
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    const address = user.addresses.find((a) => a._id!.toString() === addressId);

    if (!address)
      return res
        .status(404)
        .json({ success: false, message: "Invalid address ID" });

    user.addresses = user.addresses.filter(
      (a) => a._id!.toString() !== addressId
    );

    await user.save();
    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate("wishlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const { productId } = req.body;
    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }
    user.wishlist.push(new mongoose.Types.ObjectId(productId));
    await user.save();
    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    await User.findByIdAndUpdate(req.user!._id, {
      $pull: { wishlist: productId },
    });

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
