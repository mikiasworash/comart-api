import express from "express";

const router = express.Router();

import { addProduct, updateProduct } from "../controllers/productController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("vendor"), addProduct);
router.route("/:id").put(protect, authorize("vendor"), updateProduct);

export default router;
