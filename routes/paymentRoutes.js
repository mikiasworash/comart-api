import express from "express";
const router = express.Router();

import { payment, verifyPayment } from "../utils/payment.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("buyer"), payment);
router.route("/verify/:tx").get(protect, authorize("buyer"), verifyPayment);

export default router;
