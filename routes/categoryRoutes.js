import express from "express";

const router = express.Router();

import {
  addCategory,
  updateCategory,
} from "../controllers/categoryController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("admin"), addCategory);
router.route("/:id").put(protect, authorize("admin"), updateCategory);

export default router;
