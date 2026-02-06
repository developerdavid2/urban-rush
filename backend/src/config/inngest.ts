import { Inngest } from "inngest";
import connectDB from "./db";
import User from "../models/userModel";
import { UserDocument } from "../types/user";
import mongoose from "mongoose";
import Order from "../models/orderModel";
import Product from "../models/productModel";

export const inngest = new Inngest({ id: "urban-rush-app" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
      profile_image_url,
    } = event.data;
    const email = email_addresses?.[0]?.email_address || null;

    const newUser: Partial<UserDocument> = {
      clerkId: id,
      email: email || `user_${id}@placeholder.com`,
      name: [first_name, last_name].filter(Boolean).join(" ").trim() || "User",
      profileImageUrl: profile_image_url || image_url || "",
      addresses: [],
      wishlist: [],
      role: "customer",
      status: "active",
    };

    await User.create(newUser);
  }
);
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user" },
  { event: "clerk/user.deleted " },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.findOneAndDelete({ clerkId: id });
  }
);

const cleanupStaleOrders = inngest.createFunction(
  {
    id: "cleanup-stale-orders",
    name: "Cleanup stale pending orders older than 1 hour",
  },
  { cron: "0 * * * *" },
  async () => {
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const staleOrders = await Order.find({
          paymentStatus: "pending",
          orderStatus: "pending",
          createdAt: { $lt: ONE_HOUR_AGO },
        }).session(session);

        console.log(`Found ${staleOrders.length} stale orders`);

        for (const order of staleOrders) {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(
              item.productId,
              { $inc: { stock: item.quantity } },
              { session }
            );
          }

          order.orderStatus = "cancelled";
          order.cancelledAt = new Date();
          await order.save({ session });

          console.log(`Cleaned up ${order._id}`);
        }
      });
    } catch (err) {
      console.error("Cleanup failed:", err);
      throw err;
    } finally {
      session.endSession();
    }
  }
);

export const functions = [syncUser, deleteUserFromDB, cleanupStaleOrders];
