import { Router } from "express";

import * as authMiddleware from "../middleware/authMiddleware";
import * as paymentController from "../controllers/paymentController";

const router = Router();

router.use(authMiddleware.protect);
router.post("/create-intent", paymentController.createPaymentIntent);
router.post("/webhook", paymentController.handleWebhook);

export default router;
