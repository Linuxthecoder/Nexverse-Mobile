import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isError: false,
  error: null,
  typingUsers: {}, // { userId: boolean } - tracks who is typing
  unreadCounts: {}, // { userId: count } - tracks unread message counts per user

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/auth/last-online");
      // Ensure users is always an array
      const usersData = Array.isArray(res.data) ? res.data : [];
      set({ users: usersData });
      // Also fetch unread counts when getting users
      get().getUnreadCounts();
    } catch (error) {
      console.error("Error in getUsers:", error);
      let message = error.response?.data?.message || error.message || "Failed to load users.";
      toast.error(message);
      // Keep users as empty array on error
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/messages/unread-counts");
      set({ unreadCounts: res.data || {} });
    } catch (error) {
      console.error("Error in getUnreadCounts:", error);
      // Silently fail - not critical
      set({ unreadCounts: {} });
    }
  },

  incrementUnreadCount: (userId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [userId]: (state.unreadCounts[userId] || 0) + 1,
      },
    }));
  },

  clearUnreadCount: async (userId) => {
    try {
      // Mark messages as read on backend
      await axiosInstance.post(`/messages/read/${userId}`);
      // Clear count locally
      set((state) => {
        const newCounts = { ...state.unreadCounts };
        delete newCounts[userId];
        return { unreadCounts: newCounts };
      });
    } catch (error) {
      console.error("Error in clearUnreadCount:", error);
    }
  },

  subscribeToUserStatus: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // User comes online
    socket.on("user-online", (data) => {
      set((state) => ({
        users: state.users.map((user) =>
          user._id === data.userId
            ? { ...user, isOnline: true }
            : user
        ),
      }));
    });

    // User goes offline
    socket.on("user-offline", (data) => {
      set((state) => ({
        users: state.users.map((user) =>
          user._id === data.userId
            ? { ...user, isOnline: false, lastSeen: new Date().toISOString() }
            : user
        ),
      }));
    });
  },

  getMessages: async (userId) => {
    if (!userId || typeof userId !== 'string' || userId.length !== 24 || userId === 'unread-counts') {
      console.warn("[getMessages] HARD RETURN: invalid userId", userId);
      return;
    }
    set({ isMessagesLoading: true, isError: false, error: null });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data, isError: false, error: null });
    } catch (error) {
      console.error("Error in getMessages:", error);
      let message = error.response?.data?.message || error.message || "Failed to load messages.";
      toast.error(message);
      set({ isError: true, error: message });
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    // Create a temporary message with "sending" status
    const tempMessage = {
      _id: Date.now().toString(), // temporary ID
      senderId: useAuthStore.getState().authUser._id,
      receiverId: selectedUser._id,
      ...messageData,
      status: "sending",
      createdAt: new Date().toISOString()
    };
    
    // Add the temporary message to the messages array
    set({ messages: [...messages, tempMessage] });
    
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      // Update the temporary message with the actual message data and "sent" status
      const messageWithStatus = { ...res.data, status: "sent" };
      set({ 
        messages: [...messages.filter(msg => msg._id !== tempMessage._id), messageWithStatus] 
      });
    } catch (error) {
      console.error("Error in sendMessage:", error);
      // Update the temporary message with error status
      set({ 
        messages: [...messages.filter(msg => msg._id !== tempMessage._id), { ...tempMessage, status: "error" }] 
      });
      let message = error.response?.data?.message || error.message || "Failed to send message.";
      toast.error(message);
    }
  },

  // --- Typing Indicator ---
  setTypingIndicator: (userId, isTyping) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping
      }
    }));
  },

  // --- Message Status Updates ---
  updateMessageStatus: (messageId, status, updatedAt = null) => {
    set(state => ({
      messages: state.messages.map(message => 
        message._id === messageId 
          ? { ...message, status, updatedAt: updatedAt || message.updatedAt } 
          : message
      )
    }));
  },

  // --- Mark Messages as Seen ---
  markMessagesAsSeen: async (senderId) => {
    const { messages, selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    
    console.log("[markMessagesAsSeen] Called with senderId:", senderId);
    console.log("[markMessagesAsSeen] selectedUser:", selectedUser?._id);
    console.log("[markMessagesAsSeen] authUser:", authUser?._id);
    
    if (!selectedUser || selectedUser._id !== senderId || !authUser) {
      console.log("[markMessagesAsSeen] Early return - conditions not met");
      return;
    }

    // Find unread messages from this sender
    const unreadMessages = messages.filter(msg => 
      msg.senderId === senderId && 
      msg.receiverId === authUser._id && 
      !msg.read && 
      (msg.status !== "seen")
    );

    console.log("[markMessagesAsSeen] Found unread messages:", unreadMessages.length);

    if (unreadMessages.length > 0) {
      try {
        console.log("[markMessagesAsSeen] Calling backend API...");
        // Call backend API to mark messages as read
        await axiosInstance.post(`/messages/read/${senderId}`);
        
        console.log("[markMessagesAsSeen] Backend API success, updating local status...");
        // Update local status immediately
        unreadMessages.forEach(message => {
          get().updateMessageStatus(message._id, "seen", new Date());
        });

        // Emit seen event to sender via socket
        if (socket) {
          console.log("[markMessagesAsSeen] Emitting socket event...");
          socket.emit("messagesSeen", { 
            senderId: senderId,
            receiverId: authUser._id,
            messageIds: unreadMessages.map(msg => msg._id)
          });
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // Add status to received message
      const messageWithStatus = { ...newMessage, status: "delivered" };
      set({
        messages: [...get().messages, messageWithStatus],
      });

      // Emit delivered event back to sender
      if (socket) {
        socket.emit("delivered", {
          to: newMessage.senderId,
          messageId: newMessage._id
        });
      }

      // Mark messages as seen when received in active chat
      get().markMessagesAsSeen(newMessage.senderId);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: async (selectedUser) => {
    if (!selectedUser) {
      set({ selectedUser: null });
      return;
    }
    if (!selectedUser._id || typeof selectedUser._id !== "string" || selectedUser._id.length !== 24 || selectedUser._id === "unread-counts") {
      console.warn("[setSelectedUser] HARD RETURN: invalid selectedUser._id", selectedUser._id);
      set({ selectedUser: null });
      return;
    }
    set({ selectedUser });
    
    // Get messages for the selected user
    get().getMessages(selectedUser._id);
    
    // Clear unread count for this user
    get().clearUnreadCount(selectedUser._id);
    
    // Mark messages as seen when opening chat
    setTimeout(() => {
      get().markMessagesAsSeen(selectedUser._id);
    }, 500);
  },

  // Auto-mark messages as seen when user is actively viewing
  autoMarkAsSeen: () => {
    const { selectedUser } = get();
    if (selectedUser) {
      get().markMessagesAsSeen(selectedUser._id);
    }
  },
}));
