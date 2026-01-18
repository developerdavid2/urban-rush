import { requireAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { UserDocument } from "../types/user";

declare global {
  namespace Express {
    interface Request {
      auth: () => {
        userId: string | null;
        sessionId: string | null;
        orgId: string | null;
        orgRole: string | null;
        orgSlug: string | null;
        getToken: (options?: any) => Promise<string | null>;
      };
      user?: UserDocument;
    }
  }
}

export const protect = [
  requireAuth(),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get userId from Clerk's auth
      const { userId } = req.auth();

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - No user ID" });
      }

      const user = await User.findOne({ clerkId: userId }).lean<UserDocument>();

      if (!user) {
        return res.status(404).json({ message: "User not found in database" });
      }

      // Attach the typed user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protect middleware:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
