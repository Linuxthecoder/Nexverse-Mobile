import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { createOfflineMessageNotification } from "./notification.controller.js";
import Joi from "joi";
import createError from "http-errors";
import mongoose from "mongoose";

const sendMessageSchema = Joi.object({
  text: Joi.string().allow('').max(1000),
  image: Joi.string().allow('', null),
  video: Joi.string().allow('', null),
  audio: Joi.string().allow('', null),
  audioDuration: Joi.number().allow(null),
  document: Joi.object({
    name: Joi.string().required(),
    size: Joi.number().required(),
    type: Joi.string().required(),
    data: Joi.string().required()
  }).allow(null),
});

export const sendMessage = async (req, res, next) => {
  try {
    const { error } = sendMessageSchema.validate(req.body);
    if (error) throw createError(400, "Please enter a message, image, video, audio, or document.");
    const { text, image, video, audio, audioDuration, document } = req.body;
    if (!text && !image && !video && !audio && !document) {
      throw createError(400, "Please enter a message, image, video, audio, or document.");
    }
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let videoUrl;
    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, { resource_type: "video" });
      videoUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, { resource_type: "video" });
      audioUrl = uploadResponse.secure_url;
    }

    let documentData;
    if (document) {
      // Upload document as raw resource to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(document.data, {
        resource_type: "raw",
        public_id: `documents/${Date.now()}_${document.name}`,
        format: document.type.split('/')[1] || 'bin'
      });
      documentData = {
        url: uploadResponse.secure_url,
        name: document.name,
        size: document.size,
        type: document.type
      };
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
      audio: audioUrl,
      audioDuration,
      document: documentData,
      read: false,
    });

    console.log("[sendMessage] Created new message with read:false", newMessage);

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    // Fetch sender info for notification
    const senderUser = await User.findById(senderId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage.toObject(),
        senderName: senderUser?.fullName || "A user",
        senderProfilePic: senderUser?.profilePic || "/avatar.png",
      });
    } else {
      // User is offline - create persistent notification
      let messageType = 'text';
      let messageContent = text;

      if (image) {
        messageType = 'image';
        messageContent = 'Image message';
      } else if (video) {
        messageType = 'video';
        messageContent = 'Video message';
      } else if (audio) {
        messageType = 'audio';
        messageContent = 'Audio message';
      } else if (document) {
        messageType = 'document';
        messageContent = `Document: ${document.name}`;
      }

      await createOfflineMessageNotification(senderId, receiverId, messageType, messageContent);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getUsersForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    console.log("[getMessages] userToChatId:", userToChatId, "myId:", myId);
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      console.warn("[getMessages] Invalid userToChatId:", userToChatId);
      throw createError(400, "Invalid user ID. Please select a valid chat.");
    }
    if (!mongoose.Types.ObjectId.isValid(myId)) {
      console.warn("[getMessages] Invalid myId:", myId);
      throw createError(400, "Invalid session. Please log in again.");
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// Mark all messages from a specific user as read
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    console.log("[markMessagesAsRead] userToChatId:", userToChatId, "myId:", myId);
    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      console.warn("[markMessagesAsRead] Invalid userToChatId:", userToChatId);
      throw createError(400, "Invalid user ID. Please select a valid chat.");
    }
    const updatedMessages = await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, read: false },
      { $set: { read: true, updatedAt: new Date() } }
    );

    // Get the messages that were just marked as read
    const readMessages = await Message.find({
      senderId: userToChatId,
      receiverId: myId,
      read: true,
      updatedAt: { $gte: new Date(Date.now() - 5000) } // Only recently updated messages
    }).select('_id updatedAt');

    const messageIds = readMessages.map(msg => msg._id);

    // Notify sender that their messages were seen via socket
    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId && messageIds.length > 0) {
      io.to(senderSocketId).emit("messagesSeen", {
        receiverId: myId,
        messageIds,
        timestamp: new Date()
      });
    }

    res.status(200).json({ message: "Messages marked as read." });
  } catch (error) {
    next(error);
  }
};

// Get unread message counts per user
export const getUnreadCounts = async (req, res, next) => {
  try {
    console.log("[getUnreadCounts] req.user:", req.user);
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const myId = req.user._id;
    try {
      console.log("[getUnreadCounts] Aggregating for myId:", myId);
      // Fix: always convert myId to string for ObjectId
      const myIdStr = typeof myId === 'string' ? myId : myId.toString();
      const counts = await Message.aggregate([
        { $match: { receiverId: mongoose.Types.ObjectId(myIdStr), read: false } },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
      ]);
      const result = {};
      counts.forEach((item) => {
        result[item._id] = item.count;
      });
      console.log("[getUnreadCounts] Result:", result);
      res.status(200).json(result);
    } catch (err) {
      console.warn("[getUnreadCounts] Aggregate failed for myId:", myId, err);
      res.status(200).json({});
    }
  } catch (error) {
    console.error("[getUnreadCounts] Unexpected error:", error);
    res.status(200).json({});
  }
};