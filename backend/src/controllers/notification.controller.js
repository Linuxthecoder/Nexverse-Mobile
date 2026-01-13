import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 50, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('senderId', 'fullName profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        unreadCount
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ userId });

    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create notification (internal function)
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Create notification for offline message
export const createOfflineMessageNotification = async (senderId, receiverId, messageType, messageContent) => {
  try {
    const sender = await User.findById(senderId);
    if (!sender) return;

    let title, message;
    
    switch (messageType) {
      case 'text':
        title = `New message from ${sender.fullName}`;
        message = messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent;
        break;
      case 'image':
        title = `${sender.fullName} sent you an image`;
        message = "📷 Image message";
        break;
      case 'video':
        title = `${sender.fullName} sent you a video`;
        message = "🎥 Video message";
        break;
      case 'audio':
        title = `${sender.fullName} sent you a voice message`;
        message = "🎵 Voice message";
        break;
      default:
        title = `New message from ${sender.fullName}`;
        message = "You have a new message";
    }

    const notificationData = {
      userId: receiverId,
      type: 'message',
      title,
      message,
      senderId,
      senderName: sender.fullName,
      senderProfilePic: sender.profilePic,
      metadata: {
        messageType,
        originalContent: messageContent
      }
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating offline message notification:", error);
  }
};

// Create login/logout notification
export const createActivityNotification = async (userId, activityType, metadata = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let title, message;
    
    switch (activityType) {
      case 'login':
        title = "Welcome back!";
        message = `You logged in at ${new Date().toLocaleString()}`;
        break;
      case 'logout':
        title = "Logged out";
        message = `You logged out at ${new Date().toLocaleString()}`;
        break;
      default:
        title = "Account Activity";
        message = `Account activity recorded at ${new Date().toLocaleString()}`;
    }

    const notificationData = {
      userId,
      type: activityType,
      title,
      message,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error("Error creating activity notification:", error);
  }
};
