import express from "express";
import { checkAuth, login, logout, signup, updateProfile, getLastOnlineStatus } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { blockMetadataAccess, strictProductionRateLimit } from "../middleware/production-security.middleware.js";

const router = express.Router();

// Apply production security to all routes
router.use(strictProductionRateLimit);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

// Protected routes with metadata access blocking
router.get("/check", protectRoute, blockMetadataAccess, checkAuth);
router.get("/last-online", protectRoute, getLastOnlineStatus);

export default router;
