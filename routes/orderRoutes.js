import express from "express";
const router = express.Router();

import {
  addOrder,
  updateOrder,
  getOrders,
  getOrdersByVendor,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("buyer"), addOrder);
router.route("/").get(protect, authorize("admin"), getOrders);
router.route("/:vendorId").get(protect, authorize("vendor"), getOrdersByVendor);
router.route("/update").post(updateOrder);

export default router;
