import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get all notifications for authenticated user
router.get("/", protectRoute, getNotifications);

// Mark specific notification as read
router.patch("/:notificationId/read", protectRoute, markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", protectRoute, markAllAsRead);

// Delete specific notification
router.delete("/:notificationId", protectRoute, deleteNotification);

// Clear all notifications
router.delete("/", protectRoute, clearAllNotifications);

export default router;
