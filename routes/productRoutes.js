import express from "express";

const router = express.Router();

import {
  addProduct,
  updateProduct,
  getProducts,
  getProductsByVendor,
} from "../controllers/productController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("vendor"), addProduct);
router.route("/:id").put(protect, authorize("vendor"), updateProduct);
router.route("/").get(getProducts);
router.route("/:vendorId").get(getProductsByVendor);

export default router;
