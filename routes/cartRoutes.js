import express from "express";
const router = express.Router();

import { getCart, addCart, updateCart } from "../controllers/cartController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/:id").get(protect, authorize("buyer"), getCart);
router.route("/:id").post(protect, authorize("buyer"), addCart);
router.route("/:id").put(protect, authorize("buyer"), updateCart);

export default router;
