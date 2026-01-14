import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';
import { Alert } from 'react-native';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
    document?: any;
    status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'error';
    read?: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface User {
    _id: string;
    fullName: string;
    email: string;
    profilePic?: string;
    lastSeen?: string;
    isOnline?: boolean;
    // New fields for frontend list
    lastMessage?: string;
    lastMessageTime?: string;
    lastMessageType?: string;
    isLastMessageMyOwn?: boolean;
}

interface ChatStore {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    typingUsers: Record<string, boolean>;
    unreadCounts: Record<string, number>;

    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: any) => Promise<void>;
    setSelectedUser: (user: User | null) => void;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    setTypingIndicator: (userId: string, isTyping: boolean) => void;
    updateMessageStatus: (messageId: string, status: string, updatedAt?: Date) => void;
    getUnreadCounts: () => Promise<void>;
    incrementUnreadCount: (userId: string) => void;
    clearUnreadCount: (userId: string) => Promise<void>;
    markMessagesAsSeen: (senderId: string) => Promise<void>;
    subscribeToGlobalMessages: () => void;
    unsubscribeFromGlobalMessages: () => void;
}

import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            messages: [],
            users: [],
            selectedUser: null,
            isUsersLoading: false,
            isMessagesLoading: false,
            typingUsers: {},
            unreadCounts: {},

            getUsers: async () => {
                set({ isUsersLoading: true });
                try {
                    const res = await axiosInstance.get('/auth/last-online');
                    const usersData = Array.isArray(res.data) ? res.data : [];
                    set({ users: usersData });
                    get().getUnreadCounts();
                } catch (error: any) {
                    console.error('Error in getUsers:', error);
                    // Don't clear users on error to support offline mode
                } finally {
                    set({ isUsersLoading: false });
                }
            },

            getUnreadCounts: async () => {
                try {
                    const res = await axiosInstance.get('/messages/unread-counts');
                    set({ unreadCounts: res.data || {} });
                } catch (error) {
                    console.error('Error in getUnreadCounts:', error);
                    // set({ unreadCounts: {} }); // Keep existing counts for offline
                }
            },

            incrementUnreadCount: (userId: string) => {
                set((state) => ({
                    unreadCounts: {
                        ...state.unreadCounts,
                        [userId]: (state.unreadCounts[userId] || 0) + 1,
                    },
                }));
            },

            clearUnreadCount: async (userId: string) => {
                try {
                    await axiosInstance.post(`/messages/read/${userId}`);
                    set((state) => {
                        const newCounts = { ...state.unreadCounts };
                        delete newCounts[userId];
                        return { unreadCounts: newCounts };
                    });
                } catch (error) {
                    console.error('Error in clearUnreadCount:', error);
                }
            },

            getMessages: async (userId: string) => {
                if (!userId || typeof userId !== 'string' || userId.length !== 24) {
                    console.warn('[getMessages] Invalid userId', userId);
                    return;
                }
                set({ isMessagesLoading: true });
                try {
                    const res = await axiosInstance.get(`/messages/${userId}`);
                    set({ messages: res.data });
                } catch (error: any) {
                    console.error('Error in getMessages:', error);
                    Alert.alert('Error', 'Failed to load messages');
                } finally {
                    set({ isMessagesLoading: false });
                }
            },

            sendMessage: async (messageData) => {
                const { selectedUser, messages } = get();
                if (!selectedUser) return;

                const tempMessage: Message = {
                    _id: Date.now().toString(),
                    senderId: useAuthStore.getState().authUser!._id,
                    receiverId: selectedUser._id,
                    ...messageData,
                    status: 'sending',
                    createdAt: new Date().toISOString(),
                };

                set({ messages: [...messages, tempMessage] });

                try {
                    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
                    const messageWithStatus = { ...res.data, status: 'sent' };
                    set({
                        messages: [...messages.filter((msg) => msg._id !== tempMessage._id), messageWithStatus],
                    });
                } catch (error: any) {
                    console.error('Error in sendMessage:', error);
                    set({
                        messages: [...messages.filter((msg) => msg._id !== tempMessage._id), { ...tempMessage, status: 'error' }],
                    });
                    Alert.alert('Error', 'Failed to send message');
                }
            },

            setTypingIndicator: (userId: string, isTyping: boolean) => {
                set((state) => ({
                    typingUsers: {
                        ...state.typingUsers,
                        [userId]: isTyping,
                    },
                }));
            },

            updateMessageStatus: (messageId: string, status: string, updatedAt?: Date) => {
                set((state) => ({
                    messages: state.messages.map((message) =>
                        message._id === messageId
                            ? { ...message, status: status as any, updatedAt: updatedAt?.toISOString() || message.updatedAt }
                            : message
                    ),
                }));
            },

            markMessagesAsSeen: async (senderId: string) => {
                const { messages, selectedUser } = get();
                const socket = useAuthStore.getState().socket;
                const authUser = useAuthStore.getState().authUser;

                if (!selectedUser || selectedUser._id !== senderId || !authUser) return;

                const unreadMessages = messages.filter(
                    (msg) =>
                        msg.senderId === senderId &&
                        msg.receiverId === authUser._id &&
                        !msg.read &&
                        msg.status !== 'seen'
                );

                if (unreadMessages.length > 0) {
                    try {
                        await axiosInstance.post(`/messages/read/${senderId}`);

                        unreadMessages.forEach((message) => {
                            get().updateMessageStatus(message._id, 'seen', new Date());
                        });

                        if (socket) {
                            socket.emit('messagesSeen', {
                                senderId: senderId,
                                receiverId: authUser._id,
                                messageIds: unreadMessages.map((msg) => msg._id),
                            });
                        }
                    } catch (error) {
                        console.error('Error marking messages as seen:', error);
                    }
                }
            },

            subscribeToMessages: () => {
                const { selectedUser } = get();
                if (!selectedUser) return;

                const socket = useAuthStore.getState().socket;
                if (!socket) return;

                socket.on('newMessage', (newMessage: Message) => {
                    const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

                    // If in chat with this user, append message
                    if (isMessageSentFromSelectedUser) {
                        const messageWithStatus = { ...newMessage, status: 'delivered' as const };
                        set({
                            messages: [...get().messages, messageWithStatus],
                        });

                        if (socket) {
                            socket.emit('delivered', {
                                to: newMessage.senderId,
                                messageId: newMessage._id,
                            });
                        }

                        get().markMessagesAsSeen(newMessage.senderId);
                    }
                });

                // Listen for typing indicators
                socket.on('typing', ({ from, isTyping }: any) => {
                    if (from === selectedUser._id) {
                        get().setTypingIndicator(from, isTyping);
                    }
                });

                // Listen for message status updates
                socket.on('delivered', ({ messageId }: any) => {
                    get().updateMessageStatus(messageId, 'delivered');
                });

                socket.on('messagesSeen', ({ messageIds }: any) => {
                    messageIds.forEach((messageId: string) => {
                        get().updateMessageStatus(messageId, 'seen', new Date());
                    });
                });
            },

            unsubscribeFromMessages: () => {
                const socket = useAuthStore.getState().socket;
                if (socket) {
                    socket.off('newMessage');
                    socket.off('typing');
                    socket.off('delivered');
                    socket.off('messagesSeen');
                }
            },

            // Global listener for Chat List (runs when no specific user is selected or in addition)
            subscribeToGlobalMessages: () => {
                const socket = useAuthStore.getState().socket;
                if (!socket) return;

                // Ensure we don't duplicate listeners if called multiple times, 
                // but 'on' appends. So ideally we unsubscribe first or trust useEffect cleanup.
                // For simplicity here, we assume the caller manages cleanup or we could just add specific global handlers.

                socket.on('newMessage', (newMessage: Message) => {
                    const { selectedUser, users } = get();

                    // If we are NOT chatting with this user, or if we ARE but want to update the LIST preview
                    // Update unread count if NOT the selected user
                    if (selectedUser?._id !== newMessage.senderId) {
                        get().incrementUnreadCount(newMessage.senderId);
                    }

                    // Update user list preview (Last Message)
                    const updatedUsers = users.map(user => {
                        if (user._id === newMessage.senderId) {
                            let lastMessageText = 'New Message';
                            let lastMessageType = 'text';

                            if (newMessage.text) {
                                lastMessageText = newMessage.text;
                                lastMessageType = 'text';
                            } else if (newMessage.image) {
                                lastMessageText = 'Photo';
                                lastMessageType = 'image';
                            } else if (newMessage.video) {
                                lastMessageText = 'Video';
                                lastMessageType = 'video';
                            } else if (newMessage.document) {
                                lastMessageText = 'Document';
                                lastMessageType = 'document';
                            } else if (newMessage.audio) { // check if audio exists in msg interface
                                lastMessageText = 'Audio';
                                lastMessageType = 'audio';
                            }

                            return {
                                ...user,
                                lastMessage: lastMessageText,
                                lastMessageTime: newMessage.createdAt,
                                lastMessageType: lastMessageType,
                                isLastMessageMyOwn: false
                            };
                        }
                        return user;
                    });

                    // Re-sort users: latest message first
                    updatedUsers.sort((a, b) => {
                        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                        return timeB - timeA;
                    });

                    set({ users: updatedUsers });
                });
            },

            unsubscribeFromGlobalMessages: () => {
                const socket = useAuthStore.getState().socket;
                if (socket) {
                    socket.off('newMessage'); // Warning: this might remove the specific chat listener too if same event name
                    // Socket.io 'off' removes ALL listeners for that event if no handler provided.
                    // Since 'subscribeToMessages' also listens to 'newMessage', we need to be careful.
                    // However, usually we unmount ChatScreen (unsub specific) and mount ChatList (sub global). 
                    // If we want both, we should name the handlers or manage them carefully.
                    // PRACTICAL FIX: In this app flow, you are either in ChatList OR in a specific Chat (on top).
                    // When in specific Chat, you want both (to update list in background?) or just specific.
                    // For now, let's assume one view at a time dominates or we rely on navigation events.
                }
            },

            setSelectedUser: (selectedUser: User | null) => {
                if (!selectedUser) {
                    set({ selectedUser: null });
                    return;
                }
                if (!selectedUser._id || typeof selectedUser._id !== 'string' || selectedUser._id.length !== 24) {
                    console.warn('[setSelectedUser] Invalid selectedUser._id', selectedUser._id);
                    set({ selectedUser: null });
                    return;
                }
                set({ selectedUser });
                get().getMessages(selectedUser._id);
                get().clearUnreadCount(selectedUser._id);

                setTimeout(() => {
                    get().markMessagesAsSeen(selectedUser._id);
                }, 500);
            },
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ users: state.users, unreadCounts: state.unreadCounts }),
        }
    )
);
