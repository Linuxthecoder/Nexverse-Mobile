import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";
import { createActivityNotification } from "../controllers/notification.controller.js";
import { FRONTEND_URL, EXPO_DEV_URL } from "./config.js";

const app = express();
const server = http.createServer(app);

// Dynamic CORS origins based on environment
const getAllowedOrigins = () => {
  // In development, allow all origins for easier testing
  if (process.env.NODE_ENV === 'development') {
    return true; // Allow all origins
  }
  
  const origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8081",           // Expo dev server
    "http://192.168.29.109:8081",      // Your Expo server IP
    "exp://192.168.29.109:8081",       // Expo protocol
    "http://10.0.2.2:8081",            // Android emulator
    "http://192.168.29.109:5001",      // Physical device API
    EXPO_DEV_URL,
    FRONTEND_URL
  ];
  
  // Add production frontend URL if different from FRONTEND_URL
  if (process.env.NODE_ENV === 'production' && process.env.PRODUCTION_FRONTEND_URL) {
    origins.push(process.env.PRODUCTION_FRONTEND_URL);
  }
  
  return [...new Set(origins)]; // Remove duplicates
};

const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ["GET", "POST"]
  },
  // Enhanced security for production
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  // Add ping timeout and interval for better connection handling
  pingTimeout: 60000,
  pingInterval: 25000
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

// Function to get online users
export function getOnlineUsers() {
  return Object.keys(userSocketMap);
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Update lastSeen when user connects and create login notification
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      const user = await User.findById(userId);
      if (user) {
        io.emit("user-online", { userId, fullName: user.fullName, profilePic: user.profilePic });
        // Create login notification for socket connection
        await createActivityNotification(userId, 'login', {
          connectionType: 'socket',
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {}
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- Typing Indicator ---
  socket.on("typing", async ({ to, from, isTyping = true }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      // Fetch sender info
      let senderUser = null;
      try {
        senderUser = await User.findById(from);
      } catch (e) {}
      io.to(receiverSocketId).emit("typing", {
        from,
        isTyping,
        senderName: senderUser?.fullName || "A user",
        senderProfilePic: senderUser?.profilePic || "/avatar.png"
      });
    }
  });

  // --- Message Delivered ---
  socket.on("delivered", ({ to, messageId }) => {
    const senderSocketId = userSocketMap[to];
    if (senderSocketId) {
      io.to(senderSocketId).emit("delivered", { messageId });
    }
  });

  // --- Message Seen ---
  socket.on("seen", ({ to, messageIds }) => {
    const senderSocketId = userSocketMap[to];
    if (senderSocketId) {
      io.to(senderSocketId).emit("seen", { messageIds });
    }
  });

  // --- Messages Seen (New Format) ---
  socket.on("messagesSeen", ({ senderId, receiverId, messageIds }) => {
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { 
        receiverId, 
        messageIds,
        timestamp: new Date()
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // Update lastSeen when user disconnects and create logout notification
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        const user = await User.findById(userId);
        if (user) {
          io.emit("user-offline", { userId, fullName: user.fullName, profilePic: user.profilePic });
          // Create logout notification for socket disconnection
          await createActivityNotification(userId, 'logout', {
            connectionType: 'socket',
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {}
    }
  });
});

export { io, app, server };
