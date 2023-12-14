import express from "express";
const router = express.Router();

import { getRatings, addRating } from "../controllers/ratingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.route("/:id").get(protect, authorize("buyer"), getRatings);
router.route("/:id").post(protect, authorize("buyer"), addRating);

export default router;
