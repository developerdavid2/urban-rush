import Router from "express";

import * as authMiddleware from "../middleware/authMiddleware";
import * as userController from "../controllers/userController";

const router = Router();
router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router.get("/", userController.getAllUsers);

export default router;
