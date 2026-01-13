import { useState, useEffect } from "react";
import { Bell, Check, X, MessageCircle, UserPlus, Settings, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

const NotificationPage = () => {
  const { authUser } = useAuthStore();
  const { 
    notifications, 
    isLoading,
    loadNotifications, 
    markAsRead: storeMarkAsRead, 
    markAllAsRead,
    removeNotification, 
    clearNotifications 
  } = useNotificationStore();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Load notifications when component mounts
    if (authUser?._id) {
      loadNotifications();
    }
  }, [authUser, loadNotifications]);

  const handleMarkAsRead = (id) => {
    storeMarkAsRead(id);
  };

  const handleDeleteNotification = (id) => {
    removeNotification(id);
  };

  const handleClearAllNotifications = () => {
    clearNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "video_call":
        return <Settings className="w-5 h-5 text-purple-500" />;
      case "audio_call":
        return <Settings className="w-5 h-5 text-green-500" />;
      case "login":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "logout":
        return <UserPlus className="w-5 h-5 text-red-500" />;
      case "system":
        return <Settings className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full overflow-x-hidden bg-base-200">
        <div className="container mx-auto px-4 pt-20 max-w-4xl">
          {/* Header */}
          <div className="bg-base-100 rounded-xl border border-base-300 p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Notifications</h1>
                  <p className="text-base-content/70">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                  </p>
                </div>
              </div>
              
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="btn btn-sm btn-outline gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClearAllNotifications}
                    className="btn btn-sm btn-error btn-outline gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-6">
              {["all", "unread", "read"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterType
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 hover:bg-base-300 text-base-content"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === "unread" && unreadCount > 0 && (
                    <span className="ml-2 bg-error text-error-content px-2 py-0.5 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="bg-base-100 rounded-xl border border-base-300 p-12 shadow-sm text-center">
                <Bell className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                <p className="text-base-content/70">
                  {filter === "unread" 
                    ? "You're all caught up! No unread notifications."
                    : filter === "read"
                    ? "No read notifications to show."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-base-100 rounded-xl border border-base-300 p-4 shadow-sm transition-all hover:shadow-md ${
                    !notification.read ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-medium ${!notification.read ? "text-base-content" : "text-base-content/80"}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-base-content/70 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-base-content/50 mt-2">
                            {new Date(notification.createdAt || notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="btn btn-xs btn-ghost gap-1"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="btn btn-xs btn-ghost text-error gap-1"
                            title="Delete notification"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPage;
