import express from "express";

const router = express.Router();

import {
  addProduct,
  updateProduct,
  getProducts,
  getProduct,
  getProductsByVendor,
  getFeaturedProducts,
  getProductsByCategory,
  deleteProduct,
  featureProduct,
  getProductsByName,
  searchAutoComplete,
} from "../controllers/productController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("vendor"), addProduct);
router.route("/:id").put(protect, authorize("vendor"), updateProduct);
router.route("/feature/:id").put(protect, authorize("admin"), featureProduct);
router.route("/:id").delete(protect, authorize("vendor"), deleteProduct);
router.route("/").get(getProducts);
router.route("/product/:id").get(getProduct);
router.route("/featured").get(getFeaturedProducts);
router.route("/categories/:category").get(getProductsByCategory);
router.route("/search/:query").get(getProductsByName);
router.route("/search/autocomplete/:query").get(searchAutoComplete);
router
  .route("/vendor/:vendorId")
  .get(protect, authorize("vendor"), getProductsByVendor);

export default router;
