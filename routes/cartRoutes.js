import express from "express";
const router = express.Router();

import { getCart, addCart } from "../controllers/cartController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/:id").get(protect, authorize("buyer"), getCart);
router.route("/:id").post(protect, authorize("buyer"), addCart);

export default router;
