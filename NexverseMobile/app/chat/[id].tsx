import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { formatMessageTime } from '@/lib/utils';
import ScreenWrapper from '@/components/ScreenWrapper';

// Encryption Notice Component
const EncryptionNotice = () => (
    <View style={styles.encryptionContainer}>
        <View style={styles.encryptionBubble}>
            <LucideIcon name="lock" size={12} color="#FFD700" style={{ marginTop: 2 }} />
            <Text style={styles.encryptionText}>
                Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.
            </Text>
        </View>
    </View>
);

export default function ChatScreen() {
    // ... existing hooks
    const { id } = useLocalSearchParams();
    const { theme } = useThemeStore();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    const {
        messages,
        getMessages,
        isMessagesLoading,
        subscribeToMessages,
        unsubscribeFromMessages,
        sendMessage,
        users,
    } = useChatStore();

    const { authUser, onlineUsers } = useAuthStore();
    const colors = Colors[theme];

    // Find selected user details
    const selectedUser = users.find((u) => u._id === id);
    const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false;

    useEffect(() => {
        if (id) {
            getMessages(id as string);
            subscribeToMessages();
        }
        return () => unsubscribeFromMessages();
    }, [id]);

    // Handle message sending
    const handleSend = async (payload: { text?: string; image?: string | null; document?: any }) => {
        const hasContent = (payload.text && payload.text.trim().length > 0) || payload.image || payload.document;
        if (!hasContent) return;
        try {
            await sendMessage({
                text: payload.text?.trim() || '',
                image: payload.image || null,
                document: payload.document || null,
            });
            // Scroll to bottom after sending
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === authUser?._id;
        return (
            <MessageBubble
                message={item.text}
                timestamp={formatMessageTime(item.createdAt)}
                isMe={isMe}
                image={item.image}
                status={item.status}
            />
        );
    };

    // Chat Header Component
    const renderHeader = () => (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <LucideIcon name="chevron-left" size={28} color={colors.tint} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerProfile}>
                    <Image
                        source={selectedUser?.profilePic && selectedUser.profilePic !== '/avatar.png'
                            ? { uri: selectedUser.profilePic }
                            : require('@/assets/images/avatar.png')}
                        style={styles.headerAvatar}
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerName, { color: colors.text }]}>
                            {selectedUser?.fullName || 'User'}
                        </Text>
                        <Text style={[styles.headerStatus, { color: colors.icon }]}>
                            {/* Simple status logic, could be more complex */}
                            {isOnline ? 'Online' : 'Tap for contact info'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (!selectedUser && !isMessagesLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>User not found</Text>
            </View>
        );
    }

    return (
        <ScreenWrapper bg={colors.background}>
            <View style={[styles.container, { backgroundColor: colors.chatBackground }]}>
                {renderHeader()}

                {isMessagesLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.tint} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.messagesList}
                        ListHeaderComponent={<EncryptionNotice />}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    />
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    style={{ paddingBottom: insets.bottom || 8 }}
                >
                    <ChatInput
                        onSend={handleSend}
                        initialImageUri={useLocalSearchParams().initialImage as string}
                    />
                </KeyboardAvoidingView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 4,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    headerName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    headerStatus: {
        fontSize: Typography.sizes.xs,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        padding: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    encryptionContainer: {
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    encryptionBubble: {
        backgroundColor: '#262D31', // WhatsApp-like dark grey bubble
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'flex-start',
        maxWidth: '85%',
        gap: 6,
    },
    encryptionText: {
        color: '#FFD700', // Gold color
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
        flex: 1,
    },
});