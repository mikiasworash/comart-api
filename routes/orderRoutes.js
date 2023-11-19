import express from "express";
const router = express.Router();

import { addOrder, updateOrder } from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("buyer"), addOrder);
router.route("/:id").put(protect, authorize("buyer"), updateOrder);

export default router;
