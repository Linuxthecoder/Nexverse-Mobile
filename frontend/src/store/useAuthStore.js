import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNotificationStore } from "./useNotificationStore";
import { useChatStore } from "./useChatStore";
import { logActivity } from "../lib/activityLogger";

// Socket.IO connection - use environment variable or fallback
const getSocketURL = () => {
  // Check if running in Electron
  if (window.electron) {
    return "http://localhost:5001";
  }
  
  // Use environment variable or fallback to relative URL
  return import.meta.env.VITE_SOCKET_URL || "/";
};

const BASE_URL = getSocketURL();

export const useAuthStore = create((set, get) => {
  // Set up session tracking
  const handleBeforeUnload = () => {
    const { authUser, sessionStartTime } = get();
    if (authUser && sessionStartTime) {
      const durationInSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      logActivity({ userId: authUser._id, action: "session", durationInSeconds });
    }
  };

  // Add event listener once
  if (typeof window !== 'undefined') {
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  // Helper function to safely parse stored user data
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("authUser");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      localStorage.removeItem("authUser");
      return null;
    }
  };

  return {
  authUser: getStoredUser(),
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  sessionStartTime: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data, sessionStartTime: Date.now() });
      localStorage.setItem("authUser", JSON.stringify(res.data));
      // Don't log activity here - this is just verifying an existing session, not a new login
      get().connectSocket();
    } catch (error) {
      // Don't show error toast for 401 (unauthorized) - this is expected when not logged in
      if (error.response?.status !== 401) {
        console.error("Error in checkAuth:", error);
        let message = error.response?.data?.message || error.message || "Failed to check authentication. Please try again.";
        toast.error(message);
      }
      set({ authUser: null });
      localStorage.removeItem("authUser");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data, sessionStartTime: Date.now() });
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Error in signup:", error);
      let message = error.response?.data?.message || error.message || "Signup failed. Please try again.";
      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data, sessionStartTime: Date.now() });
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Error in login:", error);
      let message = error.response?.data?.message || error.message || "Login failed. Please try again.";
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        message = "Too many login attempts. Please wait 15 minutes before trying again.";
      } else if (error.response?.status === 400) {
        message = "Invalid email or password. Please check your credentials.";
      }
      
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    const { authUser, sessionStartTime } = get();
    if (authUser && sessionStartTime) {
      const durationInSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      logActivity({ userId: authUser._id, action: "session", durationInSeconds });
      logActivity({ userId: authUser._id, action: "logout" });
    }
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, sessionStartTime: null });
      localStorage.removeItem("authUser");
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.error("Error in logout:", error);
      let message = error.response?.data?.message || error.message || "Logout failed. Please try again.";
      toast.error(message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in update profile:", error);
      let message = error.response?.data?.message || error.message || "Profile update failed. Please try again.";
      toast.error(message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Save online/offline notifications and show toast with deduplication
    const recentToasts = new Set();
    
    socket.on("user-online", (data) => {
      if (data.userId !== authUser._id) {
        const toastKey = `online-${data.userId}-${Date.now()}`;
        
        // Prevent duplicate toasts within 5 seconds
        if (!recentToasts.has(`online-${data.userId}`)) {
          recentToasts.add(`online-${data.userId}`);
          setTimeout(() => recentToasts.delete(`online-${data.userId}`), 5000);
          
          // Add to notification store
          useNotificationStore.getState().addNotification({
            type: "online",
            title: "User Online",
            message: `${data.fullName} is now online`,
            senderName: data.fullName,
            senderProfilePic: data.profilePic || "/avatar.png",
          });
          
          // Show toast notification
          toast.success(`${data.fullName} is now online`, {
            duration: 3000,
            icon: "🟢",
            id: toastKey
          });
        }
      }
    });
    
    socket.on("user-offline", (data) => {
      if (data.userId !== authUser._id) {
        const toastKey = `offline-${data.userId}-${Date.now()}`;
        
        // Prevent duplicate toasts within 5 seconds
        if (!recentToasts.has(`offline-${data.userId}`)) {
          recentToasts.add(`offline-${data.userId}`);
          setTimeout(() => recentToasts.delete(`offline-${data.userId}`), 5000);
          
          // Add to notification store
          useNotificationStore.getState().addNotification({
            type: "offline",
            title: "User Offline", 
            message: `${data.fullName} went offline`,
            senderName: data.fullName,
            senderProfilePic: data.profilePic || "/avatar.png",
          });
          
          // Show toast notification
          toast(`${data.fullName} went offline`, {
            duration: 3000,
            icon: "🔴",
            id: toastKey
          });
        }
      }
    });
    socket.on("newMessage", (msg) => {
      if (msg.senderId !== authUser._id) {
        // Increment unread count for this sender
        const { selectedUser } = useChatStore.getState();
        // Only increment if not currently chatting with this user
        if (!selectedUser || selectedUser._id !== msg.senderId) {
          useChatStore.getState().incrementUnreadCount(msg.senderId);
        }
        
        useNotificationStore.getState().addNotification({
          type: "message",
          title: `New message from ${msg.senderName || "A user"}`,
          message: msg.text || "Sent an attachment",
          senderName: msg.senderName || msg.senderFullName || "A user",
          senderProfilePic: msg.senderProfilePic || "/avatar.png",
        });
      }
    });

    // Handle offline notifications when user comes back online
    socket.on("storeOfflineNotification", (data) => {
      if (data.userId === authUser._id) {
        useNotificationStore.getState().addNotification(data.notification);
      }
    });

    // --- Typing Indicator ---
    socket.on("typing", ({ from, isTyping = true, senderName, senderProfilePic }) => {
      if (from !== authUser._id) {
        useChatStore.getState().setTypingIndicator(from, isTyping);
        const { selectedUser } = useChatStore.getState();
        // Only show toast if not currently chatting with this user
        if (!selectedUser || selectedUser._id !== from) {
          // Use a unique toast id per user
          const toastId = `typing-${from}`;
          if (isTyping) {
            toast.dismiss(toastId); // Remove any existing
            toast(
              `${senderName || from} is typing to you...`,
              {
                id: toastId,
                duration: 3000,
                icon: "✍️",
              }
            );
          } else {
            toast.dismiss(toastId);
          }
        }
      }
    });

    // --- Message Delivered ---
    socket.on("delivered", ({ messageId }) => {
      useChatStore.getState().updateMessageStatus(messageId, "delivered");
    });

    // --- Message Seen ---
    socket.on("seen", ({ messageIds }) => {
      messageIds.forEach(messageId => {
        useChatStore.getState().updateMessageStatus(messageId, "seen", new Date());
      });
    });

    // --- Messages Seen (New Format) ---
    socket.on("messagesSeen", ({ receiverId, messageIds, timestamp }) => {
      console.log("[Socket] messagesSeen event received:", { receiverId, messageIds, timestamp });
      messageIds.forEach(messageId => {
        console.log("[Socket] Updating message status to seen:", messageId);
        useChatStore.getState().updateMessageStatus(messageId, "seen", timestamp || new Date());
      });
    });

    socket.on("connect_error", (err) => {
      toast.error("Socket connection error. Please check your network.");
      console.error("Socket connect_error:", err);
    });
    socket.on("disconnect", (reason) => {
      toast.error("Disconnected from chat server. Attempting to reconnect...");
      console.warn("Socket disconnected:", reason);
    });
    socket.io.on("reconnect", (attempt) => {
      toast.success("Reconnected to chat server.");
      console.info("Socket reconnected after attempts:", attempt);
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
  };
});
