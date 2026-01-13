
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

interface NotificationSender {
    _id: string;
    fullName: string;
    profilePic?: string;
}

export interface Notification {
    _id: string;
    userId: string;
    type: 'message' | 'login' | 'logout' | 'alert' | 'info';
    title: string;
    message: string;
    senderId?: NotificationSender;
    read: boolean;
    metadata?: any;
    createdAt: string;
}

interface NotificationStore {
    notifications: Notification[];
    isLoading: boolean;
    unreadCount: number;

    getNotifications: (page?: number) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    isLoading: false,
    unreadCount: 0,

    getNotifications: async (page = 1) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/notifications?page=${page}`);
            set({
                notifications: res.data.notifications,
                unreadCount: res.data.pagination.unreadCount
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            await axiosInstance.patch(`/notifications/${notificationId}/read`);
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await axiosInstance.patch('/notifications/mark-all-read');
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    },

    clearAllNotifications: async () => {
        try {
            await axiosInstance.delete('/notifications');
            set({ notifications: [], unreadCount: 0 });
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }
}));
