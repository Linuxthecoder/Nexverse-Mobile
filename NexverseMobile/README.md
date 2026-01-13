# Nexverse Mobile Chat App 📱

A WhatsApp-like mobile chat application built with React Native (Expo), featuring real-time messaging, typing indicators, read receipts, and more!

## ✨ Features

- 🔐 **Authentication** - Login/Signup with session persistence
- 💬 **Real-time Messaging** - Socket.IO powered instant messaging
- 👥 **Online Status** - See who's online in real-time
- ✍️ **Typing Indicators** - Know when someone is typing
- ✓✓ **Read Receipts** - Message status (sent, delivered, seen)
- 📸 **Image Sharing** - Send images from gallery
- 🔔 **Unread Badges** - Never miss a message
- 🎨 **WhatsApp-style UI** - Familiar and intuitive interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Backend server running on `http://localhost:5001`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run start
   ```

3. **Run on device/simulator**:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on your phone

## 🔧 Configuration

The app connects to your backend server. Update `.env` if needed:

```env
EXPO_PUBLIC_API_URL=http://localhost:5001
EXPO_PUBLIC_SOCKET_URL=http://localhost:5001
```

## 📱 Usage

1. **Sign Up** - Create a new account with full name, email, and password
2. **Login** - Sign in with your credentials
3. **Chat** - Tap on any user to start chatting
4. **Send Messages** - Type and send text messages or images
5. **Real-time Updates** - See online status, typing indicators, and message status

## 🏗️ Project Structure

```
├── app/
│   ├── (auth)/          # Authentication screens
│   ├── (tabs)/          # Main tab navigation
│   ├── chat/            # Individual chat screens
│   └── _layout.tsx      # Root layout with auth routing
├── store/               # Zustand state management
│   ├── useAuthStore.ts  # Authentication & Socket.IO
│   ├── useChatStore.ts  # Messages & users
│   └── useThemeStore.ts # Theme preferences
├── lib/                 # Utilities
│   ├── axios.ts         # API client
│   └── utils.ts         # Helper functions
└── components/          # Reusable components
```

## 🔌 API Endpoints

The app uses the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/check` - Session validation
- `POST /api/auth/logout` - User logout
- `GET /api/auth/last-online` - Get users list
- `GET /api/messages/:userId` - Get messages
- `POST /api/messages/send/:userId` - Send message
- `POST /api/messages/read/:userId` - Mark as read
- `GET /api/messages/unread-counts` - Get unread counts

## 🌐 Socket.IO Events

### Listening to:
- `getOnlineUsers` - Online users list
- `user-online` / `user-offline` - User status changes
- `newMessage` - New message received
- `typing` - Typing indicator
- `delivered` / `messagesSeen` - Message status updates

### Emitting:
- `typing` - Notify typing status
- `delivered` - Confirm message delivery
- `messagesSeen` - Confirm messages read

## 🎨 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Zustand** - State management
- **Socket.IO** - Real-time communication
- **Axios** - HTTP client
- **AsyncStorage** - Local persistence
- **Expo Image Picker** - Image selection

## 📝 Notes

- Make sure your backend server is running before starting the app
- For iOS, you may need to run `npx pod-install` in the `ios` directory
- Images are sent as base64 encoded strings
- The app uses AsyncStorage for session persistence

## 🐛 Troubleshooting

**Socket connection issues?**
- Verify backend URL in `.env`
- Check if backend server is running
- Ensure Socket.IO is properly configured on backend

**Authentication not working?**
- Clear app data and try again
- Check backend API endpoints
- Verify credentials are correct

**Images not sending?**
- Grant camera/gallery permissions
- Check image size (should be < 2MB)
- Verify backend supports image uploads

## 📄 License

This project is part of the Nexverse chat application.

---

Built with ❤️ using React Native & Expo
