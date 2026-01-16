import { Inngest } from "inngest";
import connectDB from "./db";
import User from "../models/user.model";
import { UserDocument } from "../types/user";

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

export const functions = [syncUser, deleteUserFromDB];
