"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.inngest = void 0;
const inngest_1 = require("inngest");
const db_1 = __importDefault(require("./db"));
const userModel_1 = __importDefault(require("../models/userModel"));
exports.inngest = new inngest_1.Inngest({ id: "urban-rush-app" });
const syncUser = exports.inngest.createFunction({ id: "sync-user" }, { event: "clerk/user.created" }, async ({ event }) => {
    await (0, db_1.default)();
    const { id, email_addresses, first_name, last_name, image_url, profile_image_url, } = event.data;
    const email = email_addresses?.[0]?.email_address || null;
    const newUser = {
        clerkId: id,
        email: email || `user_${id}@placeholder.com`,
        name: [first_name, last_name].filter(Boolean).join(" ").trim() || "User",
        profileImageUrl: profile_image_url || image_url || "",
        addresses: [],
        wishlist: [],
        role: "customer",
        status: "active",
    };
    await userModel_1.default.create(newUser);
});
const deleteUserFromDB = exports.inngest.createFunction({ id: "delete-user" }, { event: "clerk/user.deleted " }, async ({ event }) => {
    await (0, db_1.default)();
    const { id } = event.data;
    await userModel_1.default.findOneAndDelete({ clerkId: id });
});
exports.functions = [syncUser, deleteUserFromDB];
//# sourceMappingURL=inngest.js.map