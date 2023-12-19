import express from "express";

const router = express.Router();

import {
  addCategory,
  updateCategory,
  getCategories,
  getCategory,
  deleteCategory,
  getCategoriesPaginated,
} from "../controllers/categoryController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").post(protect, authorize("admin"), addCategory);
router.route("/:id").put(protect, authorize("admin"), updateCategory);
router.route("/:id").delete(protect, authorize("admin"), deleteCategory);
router.route("/").get(getCategories);
router.route("/paginated").get(getCategoriesPaginated);
router.route("/:id").get(getCategory);

export default router;
