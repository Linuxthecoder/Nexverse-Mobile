import express from "express";
import { logActivity } from "../controllers/activity.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/log", protectRoute, logActivity);

export default router;
