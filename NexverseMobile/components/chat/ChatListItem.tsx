import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';
import { getImageUrl } from '@/lib/utils';

interface ChatListItemProps {
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    isRead?: boolean;
    isOnline?: boolean;
    isSentByMe?: boolean;
}

// Default avatar
const DEFAULT_AVATAR = require('@/assets/images/avatar.png');

export default function ChatListItem({
    id,
    name,
    avatar,
    lastMessage,
    timestamp,
    unreadCount = 0,
    isRead = false,
    isOnline = false,
    isSentByMe = false,
    messageType = 'text',
}: ChatListItemProps & { messageType?: string }) {
    const { theme } = useThemeStore();
    const router = useRouter();
    const colors = Colors[theme];

    const handlePress = () => {
        router.push(`/chat/${id}`);
    };

    const imageUrl = getImageUrl(avatar);
    const [imageError, setImageError] = React.useState(false);

    const imageSource = (imageUrl && !imageError) ? { uri: imageUrl } : DEFAULT_AVATAR;

    // Helper to get icon for message type
    const getMediaIcon = (type: string) => {
        switch (type) {
            case 'image': return 'camera';
            case 'video': return 'video';
            case 'audio': return 'mic';
            case 'document': return 'file-text';
            default: return null;
        }
    };

    const mediaIconName = getMediaIcon(messageType);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.divider,
                },
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <Image
                    source={imageSource}
                    style={styles.avatar}
                    onError={() => setImageError(true)}
                />
                {isOnline && <View style={styles.onlineIndicator} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.name,
                            { color: colors.text },
                            !isRead && styles.nameBold,
                        ]}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    <Text
                        style={[
                            styles.timestamp,
                            {
                                color: unreadCount > 0 ? colors.unreadBadge : colors.timestamp,
                            },
                            unreadCount > 0 && styles.timestampBold,
                        ]}
                    >
                        {timestamp}
                    </Text>
                </View>

                <View style={styles.messageRow}>
                    <View style={styles.messageContent}>
                        {isSentByMe && isRead && (
                            <LucideIcon
                                name="check-check"
                                size={16}
                                color={colors.checkmark}
                                style={styles.checkmark}
                            />
                        )}
                        {isSentByMe && !isRead && (
                            <LucideIcon
                                name="check"
                                size={16}
                                color={colors.icon}
                                style={styles.checkmark}
                            />
                        )}

                        {/* Media Icon */}
                        {mediaIconName && (
                            <LucideIcon
                                name={mediaIconName}
                                size={14}
                                color={colors.icon}
                                style={{ marginRight: 4, marginTop: 1 }}
                            />
                        )}

                        <Text
                            style={[
                                styles.lastMessage,
                                { color: colors.icon },
                                !isRead && styles.lastMessageBold,
                            ]}
                            numberOfLines={1}
                        >
                            {isSentByMe && <Text style={styles.youPrefix}>You: </Text>}
                            {lastMessage}
                        </Text>
                    </View>

                    {unreadCount > 0 && (
                        <View
                            style={[
                                styles.unreadBadge,
                                { backgroundColor: colors.unreadBadge },
                            ]}
                        >
                            <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: Spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: BorderRadius.full,
        backgroundColor: '#25D366',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    name: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.normal,
        flex: 1,
    },
    nameBold: {
        fontWeight: Typography.weights.semibold,
    },
    timestamp: {
        fontSize: Typography.sizes.xs,
        marginLeft: Spacing.sm,
    },
    timestampBold: {
        fontWeight: Typography.weights.semibold,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkmark: {
        marginRight: 4,
    },
    lastMessage: {
        fontSize: Typography.sizes.sm,
        flex: 1,
    },
    lastMessageBold: {
        fontWeight: Typography.weights.medium,
        color: '#000000',
    },
    youPrefix: {
        fontWeight: Typography.weights.medium,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: Spacing.sm,
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
    },
});
