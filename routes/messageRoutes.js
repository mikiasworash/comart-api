import express from "express";
const router = express.Router();

import { protect, authorize } from "../middleware/authMiddleware.js";

export default router;
