import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { Alert } from 'react-native';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.29.109:1200';

interface AuthUser {
    _id: string;
    fullName: string;
    email: string;
    profilePic?: string;
    createdAt: string;
}

interface AuthStore {
    authUser: AuthUser | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: Socket | null;

    checkAuth: () => Promise<void>;
    signup: (data: { fullName: string; email: string; password: string }) => Promise<void>;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { profilePic?: string }) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            // 1. Try to load from local storage first (Offline support)
            const storedUser = await AsyncStorage.getItem('authUser');
            if (storedUser) {
                set({ authUser: JSON.parse(storedUser) });
            }

            // 2. Verify with backend
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data });
            await AsyncStorage.setItem('authUser', JSON.stringify(res.data));
            get().connectSocket();
        } catch (error: any) {
            console.error('Error in checkAuth:', error);

            // Only logout if explicit 401 or no stored user
            if (error.response?.status === 401) {
                set({ authUser: null });
                await AsyncStorage.removeItem('authUser');
            } else {
                // If it's a network error (offline), we keep the stored user if it exists
                const storedUser = await AsyncStorage.getItem('authUser');
                if (storedUser) {
                    // Ensure socket connection logic is skipped or handled on reconnection
                } else {
                    // No stored user and API failed -> assume logged out
                    set({ authUser: null });
                }
            }
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({ authUser: res.data });
            await AsyncStorage.setItem('authUser', JSON.stringify(res.data));
            Alert.alert('Success', 'Account created successfully');
            get().connectSocket();
        } catch (error: any) {
            console.error('Error in signup:', error);
            const message = error.response?.data?.message || error.message || 'Signup failed';
            Alert.alert('Error', message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({ authUser: res.data });
            await AsyncStorage.setItem('authUser', JSON.stringify(res.data));
            Alert.alert('Success', 'Logged in successfully');
            get().connectSocket();
        } catch (error: any) {
            console.error('Error in login:', error);
            let message = error.response?.data?.message || error.message || 'Login failed';

            if (error.response?.status === 429) {
                message = 'Too many login attempts. Please wait 15 minutes.';
            } else if (error.response?.status === 400) {
                message = 'Invalid email or password.';
            }

            Alert.alert('Error', message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            await AsyncStorage.removeItem('authUser');
            get().disconnectSocket();
            Alert.alert('Success', 'Logged out successfully');
        } catch (error: any) {
            console.error('Error in logout:', error);
            Alert.alert('Error', 'Logout failed');
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data });
            await AsyncStorage.setItem('authUser', JSON.stringify(res.data));
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            console.error('Error in update profile:', error);
            Alert.alert('Error', 'Profile update failed');
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(SOCKET_URL, {
            query: {
                userId: authUser._id,
            },
        });

        socket.connect();
        set({ socket });

        socket.on('getOnlineUsers', (userIds: string[]) => {
            set({ onlineUsers: userIds });
        });

        socket.on('user-online', (data: any) => {
            console.log('User online:', data.fullName);
        });

        socket.on('user-offline', (data: any) => {
            console.log('User offline:', data.fullName);
        });

        socket.on('connect_error', (err: Error) => {
            console.error('Socket connect_error:', err);
        });

        socket.on('disconnect', (reason: string) => {
            console.warn('Socket disconnected:', reason);
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket?.disconnect();
        }
    },
}));
