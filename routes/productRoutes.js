import express from "express";

const router = express.Router();

import {
  addProduct,
  updateProduct,
  getProducts,
  getProductsByVendor,
  getFeaturedProducts,
  deleteProduct,
  featureProduct,
} from "../controllers/productController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("vendor"), addProduct);
router.route("/:id").put(protect, authorize("vendor"), updateProduct);
router.route("/feature/:id").put(protect, authorize("admin"), featureProduct);
router.route("/:id").delete(protect, authorize("vendor"), deleteProduct);
router.route("/").get(getProducts);
router.route("/featured").get(getFeaturedProducts);
router
  .route("/:vendorId")
  .get(protect, authorize("vendor"), getProductsByVendor);

export default router;
