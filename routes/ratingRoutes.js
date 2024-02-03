import express from "express";
const router = express.Router();

import {
  getRatings,
  getRating,
  addRating,
  updateRating,
  deleteRating,
} from "../controllers/ratingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/").get(getRatings);
router.route("/:id").get(getRating);
router.route("/:id").post(protect, authorize("buyer"), addRating);
router.route("/:id").put(protect, authorize("buyer"), updateRating);
router.route("/:id").delete(protect, authorize("buyer"), deleteRating);

export default router;
