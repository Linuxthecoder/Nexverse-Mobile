import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Validate and handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError("");

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image (JPG, PNG, WEBP)");
      e.target.value = ""; // Clear input
      return;
    }

    // Validate file size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
        // Optionally: show success toast
      } catch (err) {
        setError("Failed to update profile picture. Please try again.");
        console.error("Profile update error:", err);
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read image file.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  // Fallback image on error
  const handleImageError = (e) => {
    e.target.src = "/avatar.png"; // Fallback to default avatar
  };

  // Format date safely
  const getMemberSince = () => {
    if (!authUser?.createdAt) return "Unknown";
    const date = new Date(authUser.createdAt);
    if (isNaN(date.getTime())) return "Unknown";
    
    // Format as a more readable date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-100">
        <div className="flex justify-center items-start pt-20 pb-8">
          <div className="w-full max-w-2xl mx-4 sm:mx-6 lg:mx-8">
            <div className="bg-base-300 rounded-xl p-6 sm:p-8 space-y-8 shadow-lg">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-base-content">Profile</h1>
                <p className="mt-2 text-base-content/70">Manage your personal information</p>
              </div>

              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover border-4 border-primary/20 shadow-md"
                    onError={handleImageError}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`
                      absolute bottom-0 right-0 
                      bg-primary hover:scale-105 
                      p-3 rounded-full cursor-pointer 
                      transition-all duration-200 shadow-md
                      flex items-center justify-center
                      ${isUpdatingProfile || isUploading ? "animate-pulse pointer-events-none opacity-70" : ""}
                    `}
                    aria-label="Change profile picture"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile || isUploading}
                      aria-label="Upload profile image"
                    />
                  </label>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                {isUploading && (
                  <p className="text-sm text-primary">Uploading image...</p>
                )}
                {!error && !isUploading && (
                  <p className="text-sm text-base-content/60">Click the camera to change your photo</p>
                )}
              </div>

              {/* User Info Fields */}
              <div className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="text-sm text-base-content/70 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </div>
                  <p className="px-4 py-3 bg-base-200 rounded-lg border border-base-300/50 text-base-content">
                    {authUser?.fullName || "Not set"}
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <div className="text-sm text-base-content/70 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                  <p className="px-4 py-3 bg-base-200 rounded-lg border border-base-300/50 text-base-content">
                    {authUser?.email || "Not set"}
                  </p>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-base-200/50 rounded-xl p-6 border border-base-300/50">
                <h2 className="text-lg font-medium text-base-content mb-6">Account Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-base-300/30">
                    <span className="text-base-content/70">Member Since</span>
                    <span className="text-base-content font-medium">{getMemberSince()}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-base-content/70">Account Status</span>
                    <span className="text-green-500 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Privacy Info */}
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔐</span>
                  <h3 className="text-base font-medium text-green-400">Privacy-First Design</h3>
                </div>
                <p className="text-sm text-base-content/70 mb-3">
                  NexVerse never tracks your activity. Zero data stored on your conversations.
                </p>
                <a
                  href="https://nexverse-com.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-400 hover:text-green-300 hover:underline transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Learn more →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;