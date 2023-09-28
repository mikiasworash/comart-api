import express from "express";

const router = express.Router();

import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getVendors,
  updateVendorStatus,
} from "../controllers/userController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

router.post("/auth", authUser);
router.post("/", registerUser);
router.post("/logout", logoutUser);
router.route("/vendors").get(protect, authorize("admin"), getVendors);
router
  .route("/vendors/:id")
  .put(protect, authorize("admin"), updateVendorStatus);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
