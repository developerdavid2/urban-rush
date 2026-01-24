import { Router } from "express";
import * as authMiddleware from "../middleware/authMiddleware";
import * as reviewController from "../controllers/reviewController";

const router = Router();

router.get("/products/:productId", reviewController.getReviewsByProduct);

router.use(authMiddleware.protect);

router.post("/", reviewController.createReview);

router.patch("/:id", reviewController.updateReview);

router.delete("/:id", reviewController.deleteReview);

export default router;
