import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,
  unreadCount: 0,
  
  // Load notifications from backend API
  loadNotifications: async () => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.get("/notifications");
      const { notifications, pagination } = response.data;
      
      set({ 
        notifications: notifications || [],
        unreadCount: pagination?.unreadCount || 0,
        isLoading: false 
      });
    } catch (error) {
      console.error("Error loading notifications:", error);
      set({ notifications: [], unreadCount: 0, isLoading: false });
    }
  },
  
  // Mark notification as read
  markAsRead: async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      
      set((state) => {
        const updated = state.notifications.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        );
        const newUnreadCount = updated.filter(n => !n.read).length;
        return { notifications: updated, unreadCount: newUnreadCount };
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await axiosInstance.patch("/notifications/mark-all-read");
      
      set((state) => ({
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
  
  // Remove notification
  removeNotification: async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      
      set((state) => {
        const updated = state.notifications.filter((n) => n._id !== id);
        const newUnreadCount = updated.filter(n => !n.read).length;
        return { notifications: updated, unreadCount: newUnreadCount };
      });
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  },
  
  // Clear all notifications
  clearNotifications: async () => {
    try {
      await axiosInstance.delete("/notifications");
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },
  
  // Add notification locally (for real-time updates)
  addNotification: (notification) => {
    set((state) => {
      const newNotification = {
        _id: notification.id || Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString(),
        ...notification
      };
      
      const updated = [newNotification, ...state.notifications];
      const newUnreadCount = updated.filter(n => !n.read).length;
      
      return { 
        notifications: updated,
        unreadCount: newUnreadCount
      };
    });
  },
  
  // Get unread count
  getUnreadCount: () => {
    const { unreadCount } = get();
    return unreadCount;
  }
}));
// Notification type: { id, text, type, timestamp, senderName?, senderProfilePic?, showPopup? } 