import { Router } from "express";
import * as productController from "../controllers/productController";
import * as authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/multerMiddleware";

const router = Router();

// Allowed Methods: GET
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// // Authenticated Methods: POST, PUT, DELETE

router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router.post("/", upload.array("images", 4), productController.createProduct);
router.patch(
  "/:id",
  productController.updateProduct
);
router.delete("/:id", productController.deleteProduct);

export default router;
