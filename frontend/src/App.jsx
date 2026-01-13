import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationPage from "./pages/NotificationPage";
import NotFoundPage from "./pages/NotFoundPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect, useState } from "react";
import Intro from "./components/Intro";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, connectSocket } = useAuthStore();
  const { theme } = useThemeStore();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Always show intro on every page load/refresh
    setShowIntro(true);
  }, []);

  const handleIntroEnd = () => {
    setShowIntro(false);
    checkAuth();
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      connectSocket();
    }
  };

  if (showIntro) {
    return <Intro onIntroEnd={handleIntroEnd} />;
  }

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <ErrorBoundary>
      <div data-theme={theme}>

        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Toaster />
      </div>
    </ErrorBoundary>
  );
};
export default App;
