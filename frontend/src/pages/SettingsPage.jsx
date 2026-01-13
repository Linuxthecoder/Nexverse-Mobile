import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  Send,
  LogOut,
  Palette,
  User,
  Settings as SettingsIcon,
  CheckCircle,
  Info,
  Brush,
  Lock,
  Phone,
  Shield,
  AlertTriangle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Save,
  X,
  Clock,
  MessageSquare,
  Monitor,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [activeSection, setActiveSection] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || ""
  });
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: localStorage.getItem("show-online-status") !== "false",
    showLastSeen: localStorage.getItem("show-last-seen") !== "false",
    allowTypingIndicator: localStorage.getItem("typing-indicator") !== "false"
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    try {
      await updateProfile(profileData);
      setEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };


  const handlePrivacySettingChange = (setting, value) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    localStorage.setItem(
      setting === "showOnlineStatus" ? "show-online-status" :
      setting === "showLastSeen" ? "show-last-seen" :
      "typing-indicator",
      value.toString()
    );
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  };



  // Update profile data when authUser changes
  useEffect(() => {
    if (authUser) {
      setProfileData({
        fullName: authUser.fullName || "",
        email: authUser.email || ""
      });
    }
  }, [authUser]);

  const sections = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "account", label: "Account", icon: User },
  ];

  return (
    <>
      <Navbar />
      <div className="h-screen container mx-auto px-4 pt-20 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Sidebar */}
          {activeSection && (
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-base-100 rounded-xl border border-base-300 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  <h1 className="text-xl font-semibold">Settings</h1>
                </div>

                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-200 text-base-content"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Back Button */}
                <div className="mt-6 pt-4 border-t border-base-300">
                  <button
                    onClick={() => setActiveSection(null)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-base-200 text-base-content"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Back to Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {!activeSection && (
              <div className="bg-base-100 rounded-xl border border-base-300 p-8 shadow-sm text-center max-w-2xl mx-auto">
                <SettingsIcon className="w-20 h-20 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-semibold mb-3">App Settings</h2>
                <p className="text-base-content/70 mb-8 text-lg">Customize your NexVerse experience</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                  <button
                    onClick={() => setActiveSection("appearance")}
                    className="flex flex-col items-center gap-3 p-6 bg-base-200 hover:bg-primary hover:text-primary-content rounded-xl transition-all duration-200 hover:shadow-lg"
                  >
                    <Palette className="w-8 h-8" />
                    <div>
                      <div className="font-semibold text-lg">Appearance</div>
                      <div className="text-sm opacity-70">Themes & UI</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveSection("account")}
                    className="flex flex-col items-center gap-3 p-6 bg-base-200 hover:bg-primary hover:text-primary-content rounded-xl transition-all duration-200 hover:shadow-lg"
                  >
                    <User className="w-8 h-8" />
                    <div>
                      <div className="font-semibold text-lg">Account</div>
                      <div className="text-sm opacity-70">Profile & Security</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <div className="space-y-6">
                {/* Theme Selection */}
                <div className="bg-base-100 rounded-xl border border-base-300 p-6 shadow-sm">
                  <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Theme Selection
                    </h2>
                    <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {THEMES.map((t) => (
                      <button
                        key={t}
                        className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 border-2 ${
                          theme === t
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-base-300 hover:border-primary/50 hover:bg-base-200/50"
                        }`}
                        onClick={() => setTheme(t)}
                      >
                        <div className="relative h-10 w-full rounded-lg overflow-hidden shadow-sm" data-theme={t}>
                          <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                            <div className="rounded bg-primary"></div>
                            <div className="rounded bg-secondary"></div>
                            <div className="rounded bg-accent"></div>
                            <div className="rounded bg-neutral"></div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium truncate w-full text-center ${
                            theme === t ? "text-primary font-semibold" : "text-base-content"
                          }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                        {theme === t && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="bg-base-100 rounded-xl border border-base-300 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                  <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
                    <div className="p-4 bg-base-200">
                      <div className="max-w-lg mx-auto">
                        <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                          {/* Chat Header */}
                          <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                                N
                              </div>
                              <div>
                                <h3 className="font-medium text-sm">NexVerse Preview</h3>
                                <p className="text-xs text-base-content/70">Online</p>
                              </div>
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                            {PREVIEW_MESSAGES.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                                    message.isSent
                                      ? "bg-primary text-primary-content"
                                      : "bg-base-200 text-base-content"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-[10px] mt-1.5 ${
                                      message.isSent ? "text-primary-content/70" : "text-base-content/70"
                                    }`}
                                  >
                                    12:00 PM
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Input */}
                          <div className="p-4 border-t border-base-300 bg-base-100">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="input input-bordered flex-1 text-sm h-10"
                                placeholder="Type a message..."
                                value="This is a preview"
                                readOnly
                              />
                              <button className="btn btn-primary h-10 min-h-0">
                                <Send size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Privacy & Security Section */}
            {activeSection === "privacy" && (
              <div className="space-y-6">
                {/* Privacy Settings */}
                <div className="bg-base-100 rounded-xl border border-base-300 p-6 shadow-sm">
                  <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Privacy Settings
                    </h2>
                    <p className="text-sm text-base-content/70">Control your privacy and visibility</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {privacySettings.showOnlineStatus ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-base-content/50" />}
                        <div>
                          <h4 className="font-medium">Show Online Status</h4>
                          <p className="text-sm text-base-content/70">Let others see when you're online</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={privacySettings.showOnlineStatus}
                        onChange={(e) => handlePrivacySettingChange('showOnlineStatus', e.target.checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium">Show Last Seen</h4>
                          <p className="text-sm text-base-content/70">Display when you were last active</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={privacySettings.showLastSeen}
                        onChange={(e) => handlePrivacySettingChange('showLastSeen', e.target.checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium">Typing Indicator</h4>
                          <p className="text-sm text-base-content/70">Show when you're typing to others</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={privacySettings.allowTypingIndicator}
                        onChange={(e) => handlePrivacySettingChange('allowTypingIndicator', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Security Information */}
                <div className="bg-base-100 rounded-xl border border-base-300 p-6 shadow-sm">
                  <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      Security Information
                    </h2>
                    <p className="text-sm text-base-content/70">Your account security details</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <h4 className="font-medium text-success">Account Verified</h4>
                      </div>
                      <p className="text-sm text-base-content/70">Your email address is verified</p>
                    </div>

                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h4 className="font-medium text-primary">Encrypted Connection</h4>
                      </div>
                      <p className="text-sm text-base-content/70">All messages are end-to-end encrypted</p>
                    </div>

                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <h4 className="font-medium text-warning">Password Security</h4>
                      </div>
                      <p className="text-sm text-base-content/70">Consider updating your password regularly</p>
                    </div>

                    <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Monitor className="w-5 h-5 text-info" />
                        <h4 className="font-medium text-info">Active Session</h4>
                      </div>
                      <p className="text-sm text-base-content/70">Currently logged in on this device</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "account" && (
              <div className="space-y-6">
                {/* Account Info */}
                <div className="bg-base-100 rounded-xl border border-base-300 p-6 shadow-sm">
                  <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Account Information
                    </h2>
                    <p className="text-sm text-base-content/70">Your profile and account details</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                      <img
                        src={authUser?.profilePic || "/avatar.png"}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{authUser?.fullName}</h3>
                        <p className="text-base-content/70">{authUser?.email}</p>
                        <div className="text-xs text-success mt-1 flex items-center gap-1">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                          Online
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-base-200 rounded-lg">
                        <h4 className="font-medium text-sm text-base-content/70 mb-1">Full Name</h4>
                        <p className="font-semibold">{authUser?.fullName}</p>
                      </div>
                      <div className="p-4 bg-base-200 rounded-lg border border-base-300">
                        <h4 className="font-medium text-sm text-base-content/70 mb-1">Email</h4>
                        <p className="font-semibold break-all">{authUser?.email}</p>
                      </div>
                      <div className="p-4 bg-base-200 rounded-lg">
                        <h4 className="font-medium text-sm text-base-content/70 mb-2 flex items-center gap-2">
                          Account ID
                          <AlertTriangle className="w-3 h-3 text-warning" />
                        </h4>
                        <p className="font-semibold text-xs truncate mb-2">{authUser?._id}</p>
                        <div className="p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
                          ⚠️ Never share your Account ID with anyone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout Section */}
                <div className="bg-base-100 rounded-xl border border-error p-6 shadow-sm">
                  <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-lg font-semibold text-error flex items-center gap-2">
                      <LogOut className="w-5 h-5" />
                      Session Management
                    </h2>
                    <p className="text-sm text-base-content/70">End your current session securely</p>
                  </div>

                  {/* Warning Note */}
                  <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-semibold text-red-500 mb-1 block">Note:</span>
                        <span className="text-sm text-yellow-700 block">
                          Only log out if you remember your password. You'll need it to sign in again.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <LogOut className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-error mb-2">Logout</h4>
                        <div className="text-sm text-base-content/70 mb-4 leading-relaxed">
                          This will end your current session and log you out of NexVerse.
                          You'll need to sign in again to access your account.
                        </div>
                        <button
                          onClick={handleLogout}
                          className="btn btn-error gap-2 w-full sm:w-auto"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout from Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;