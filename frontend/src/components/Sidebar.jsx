import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, X, Zap } from "lucide-react"; // Removed `Info` since not used
import { formatLastSeen } from "../lib/utils";
import { axiosInstance } from "../lib/axios";

const Sidebar = ({ isOpen, onClose }) => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    subscribeToUserStatus,
    unreadCounts,
  } = useChatStore();

  const { onlineUsers = [], authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [lastMessages, setLastMessages] = useState({});

  // Ensure onlineUsers is always an array to prevent errors
  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];

  useEffect(() => {
    getUsers();
    subscribeToUserStatus();
  }, [getUsers, subscribeToUserStatus]);

  // Fetch last message for a user when hovered
  const fetchLastMessage = async (userId) => {
    if (lastMessages[userId] !== undefined) return; // Already fetched (including empty state)
    
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const messages = res.data || [];
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        setLastMessages(prev => ({ ...prev, [userId]: lastMsg }));
      } else {
        // No messages found - mark as empty
        setLastMessages(prev => ({ ...prev, [userId]: null }));
      }
    } catch (error) {
      console.error("Error fetching last message:", error);
      // Mark as empty on error too
      setLastMessages(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleMouseEnter = (userId) => {
    setHoveredUser(userId);
    fetchLastMessage(userId);
  };

  const handleMouseLeave = () => {
    setHoveredUser(null);
  };

  // Ensure users is always an array to prevent .map() errors
  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = showOnlineOnly
    ? safeUsers.filter((user) => safeOnlineUsers.includes(user._id))
    : safeUsers;

  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts || {}).reduce((sum, count) => sum + count, 0);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`
          h-full w-80 sm:w-20 lg:w-72 border-r border-base-300 flex flex-col
          bg-gradient-to-br from-base-100/95 to-base-200/80 backdrop-blur-sm
          text-base-content transition-all duration-300 ease-in-out
          fixed sm:static z-50 left-0 top-0
          ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"} sm:translate-x-0
        `}
      >
        {/* Close Button (Mobile) */}
        <div className="flex sm:hidden items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="text-primary" />
            <span className="hidden sm:inline">Contacts</span>
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        {authUser && (
          <div className="flex items-center gap-3 p-4 border-b border-base-300">
            <div className="relative">
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt={authUser.fullName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
              />
              <span className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full ring ring-base-100 animate-pulse"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{authUser.fullName}</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Online
              </p>
            </div>
          </div>
        )}

        {/* Header & Filter */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base hidden sm:flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Contacts
            </h3>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <div className="badge badge-error badge-sm px-2 py-1 text-xs font-bold text-white shadow-lg">
                  {totalUnread > 99 ? '99+' : totalUnread} new messages
                </div>
              )}
              <div className="badge badge-primary badge-sm px-3 py-1 text-xs font-medium animate-pulse-glow">
                {filteredUsers.length} total
              </div>
            </div>
          </div>

          {/* Online Filter */}
          <label className="flex items-center justify-between text-sm cursor-pointer hover:bg-base-300 p-2 rounded transition-all">
            <span>Show online only</span>
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="toggle toggle-primary toggle-sm"
            />
          </label>
          <p className="text-xs text-zinc-500 mt-1 pl-1">
            {safeOnlineUsers.length - 1} online {safeOnlineUsers.length - 1 === 1 ? "user" : "users"}
          </p>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => {
                  if (user && user._id && typeof user._id === "string" && user._id.length === 24) {
                    setSelectedUser(user);
                  }
                }}
                onMouseEnter={() => handleMouseEnter(user._id)}
                onMouseLeave={handleMouseLeave}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all
                  hover:bg-primary/10 hover:shadow-md hover:scale-102
                  ${selectedUser?._id === user._id ? "bg-primary/15 ring-1 ring-primary/30 scale-102" : "hover:bg-base-300"}
                `}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-base-100 shadow-sm"
                  />
                  {safeOnlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-base-100 rounded-full animate-pulse"></span>
                  )}
                </div> 
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm truncate">{user.fullName}</p>
                  <p className="text-xs truncate">
                    {hoveredUser === user._id && lastMessages[user._id] !== undefined ? (
                      lastMessages[user._id] ? (
                        <span className="flex items-center gap-1">
                          {lastMessages[user._id].senderId === authUser?._id && (
                            <span className={`text-xs ${lastMessages[user._id].read ? 'text-blue-400' : 'text-gray-400'}`}>
                              {lastMessages[user._id].read ? '✓✓' : '✓'}
                            </span>
                          )}
                          {lastMessages[user._id].senderId === authUser?._id && <span className="text-gray-500 mx-1">·</span>}
                          <span className="truncate font-medium text-base-content">
                            {lastMessages[user._id].text || "📎 Media message"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-base-content/60 italic font-light">
                          No chat started
                        </span>
                      )
                    ) : safeOnlineUsers.includes(user._id) ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Online
                      </span>
                    ) : (
                      <span className="text-gray-500">{formatLastSeen(user.lastSeen)}</span>
                    )}
                  </p>
                </div>
                {/* Unread message badge */}
                {unreadCounts?.[user._id] > 0 && (
                  <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {unreadCounts[user._id] > 99 ? '99+' : unreadCounts[user._id]}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="text-center text-zinc-500 py-6 text-sm italic">
              <p>No users online</p>
            </div>
          )}
        </div>

        {/* Footer - NexVerse Branding */}
        <div className="p-4 border-t border-base-300 bg-base-200/50">
          <a
            href="https://nexverse-com.vercel.app" 
            target="_blank"
            rel="noopener noreferre"
            className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-1 group"
          >
            <span className="group-hover:underline">✨ What's new in NexVerse 3.3 →</span>
          </a>
        </div>
      </aside>
    </>
  );
};


export default Sidebar;



