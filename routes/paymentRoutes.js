import express from "express";
const router = express.Router();

import { payment } from "../utils/payment.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("buyer"), payment);

export default router;
