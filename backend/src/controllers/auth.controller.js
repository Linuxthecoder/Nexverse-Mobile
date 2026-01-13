import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { createActivityNotification } from "./notification.controller.js";
import Joi from "joi";
import createError from "http-errors";
import { logFailedLogin, logSuccessfulLogin, logSecurityEvent } from "../lib/logger.js";
import { passwordPolicy } from "../lib/security.js";

// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>"'&]/g, '');
};

const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().custom((value) => sanitizeInput(value)),
  email: Joi.string().email().required().custom((value) => sanitizeInput(value).toLowerCase()),
  password: Joi.string()
    .min(passwordPolicy.minLength)
    .max(passwordPolicy.maxLength)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .message('Password must contain at least one lowercase letter, one uppercase letter, and one number')
    .required(),
  metadata: Joi.object(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().custom((value) => sanitizeInput(value).toLowerCase()),
  password: Joi.string().min(1).max(128).required(),
  metadata: Joi.object(),
});

export const signup = async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) throw createError(400, error.details[0].message);
    const { fullName, email, password, metadata } = req.body;
    const user = await User.findOne({ email });
    if (user) throw createError(409, "Email already exists");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ fullName, email, password: hashedPassword, metadata });
    if (!newUser) throw createError(400, "Invalid user data");
    generateToken(newUser._id, res);
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw createError(400, error.details[0].message);

    const { email, password, metadata } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logFailedLogin(email, req.ip, req.get('User-Agent'));
      throw createError(400, "Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      logFailedLogin(email, req.ip, req.get('User-Agent'));
      throw createError(400, "Invalid credentials");
    }

    // Log successful login
    logSuccessfulLogin(user._id, req.ip, req.get('User-Agent'));

    if (metadata) {
      user.metadata = metadata;
      await user.save();
    }

    generateToken(user._id, res);

    // Create login notification
    await createActivityNotification(user._id, 'login', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    // Create logout notification if user is authenticated
    if (req.user && req.user._id) {
      await createActivityNotification(req.user._id, 'logout', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    // PRODUCTION SECURITY: Block metadata access with legal warning
    if (process.env.NODE_ENV === 'production' && req.query.includeMetadata === 'true') {
      logSecurityEvent('UNAUTHORIZED_METADATA_ACCESS_ATTEMPT', {
        userId: req.user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: "ACCESS DENIED",
        message: "⚠️ ILLEGAL ACCESS ATTEMPT DETECTED",
        warning: "Unauthorized access to sensitive user metadata is strictly prohibited and may constitute a violation of privacy laws including GDPR, CCPA, and other data protection regulations.",
        legal: "This action has been logged and reported. Continued attempts may result in account suspension, legal action, and criminal prosecution under applicable cyber security laws.",
        code: "METADATA_ACCESS_FORBIDDEN",
        timestamp: new Date().toISOString(),
        reportedTo: "Security Team"
      });
    }

    // Return sanitized user data - exclude sensitive metadata
    const sanitizedUser = {
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      profilePic: req.user.profilePic,
      lastSeen: req.user.lastSeen,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.status(200).json(sanitizedUser);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

import Message from "../models/message.model.js";

// ... existing imports

// ...

// Get last online status for all users with last message
export const getLastOnlineStatus = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    // Get all users except the logged in user
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("_id fullName profilePic lastSeen")
      .sort({ lastSeen: -1 });

    // Get online users from socket
    const { getOnlineUsers } = await import("../lib/socket.js");
    const onlineUsers = getOnlineUsers();

    // Fetch last message for each user to show in the list
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: loggedInUserId, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUserId }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(1);

      let lastMessageText = null;
      let lastMessageTime = null;
      let isLastMessageMyOwn = false;
      let lastMessageType = 'text';

      if (lastMsg) {
        if (lastMsg.text) {
          lastMessageText = lastMsg.text;
          lastMessageType = 'text';
        } else if (lastMsg.image) {
          lastMessageText = 'Photo';
          lastMessageType = 'image';
        } else if (lastMsg.video) {
          lastMessageText = 'Video';
          lastMessageType = 'video';
        } else if (lastMsg.audio) {
          lastMessageText = 'Audio';
          lastMessageType = 'audio';
        } else if (lastMsg.document) {
          lastMessageText = 'Document';
          lastMessageType = 'document';
        }

        lastMessageTime = lastMsg.createdAt;
        isLastMessageMyOwn = lastMsg.senderId.toString() === loggedInUserId.toString();
      }

      return {
        _id: user._id,
        fullName: user.fullName,
        profilePic: user.profilePic,
        lastSeen: user.lastSeen,
        isOnline: onlineUsers.includes(user._id.toString()),
        lastMessage: lastMessageText,
        lastMessageTime: lastMessageTime,
        lastMessageType,
        isLastMessageMyOwn
      };
    }));

    // Sort by last message time if available, otherwise by lastSeen
    usersWithDetails.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;

      if (timeA > 0 || timeB > 0) {
        return timeB - timeA;
      }

      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });

    res.status(200).json(usersWithDetails);
  } catch (error) {
    next(error);
  }
};
