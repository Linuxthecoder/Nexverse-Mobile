import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Settings, User, Bell, Menu } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";

const Navbar = ({ onHamburgerClick }) => {
  const { authUser } = useAuthStore();
  const { notifications, unreadCount, loadNotifications } = useNotificationStore();
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);

  // Load notifications when user is authenticated
  useEffect(() => {
    if (authUser?._id) {
      loadNotifications();
    }
  }, [authUser, loadNotifications]);

  // Handle logo click
  const handleLogoClick = () => {
    setSelectedUser(null);
  };

  return (
    <header className="bg-base-100/90 border-b border-base-300 backdrop-blur-lg fixed w-full top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo & Hamburger - moved slightly right */}
        <div className="flex items-center gap-2 ml-8">
          {/* Hamburger (Mobile) */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-base-200 transition-all"
            onClick={onHamburgerClick}
            aria-label="Toggle sidebar"
            type="button"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-lg hover:opacity-80 transition-all"
            onClick={handleLogoClick}
            aria-label="Go to home"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <span className="text-primary font-bold">NexVerse</span>
          </Link>
        </div>

        {/* Right: Actions - moved slightly left */}
        <div className="flex items-center gap-2 mr-8">
          {/* Notifications */}
          <Link
            to="/notifications"
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <span className="hidden sm:inline">Notifications</span>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {/* Profile */}
          {authUser ? (
            <Link
              to="/profile"
              className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-all"
              aria-label="Profile"
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="hidden sm:inline">Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;