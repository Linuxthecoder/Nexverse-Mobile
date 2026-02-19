export interface Message {
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

export interface User {
    _id: string;
    fullName: string;
    email: string;
    profilePic?: string;
    lastSeen?: string;
    isOnline?: boolean;
    lastMessage?: string;
    lastMessageTime?: string;
    lastMessageType?: string;
    isLastMessageMyOwn?: boolean;
}
