import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';
import { useNotificationStore, Notification } from '@/store/useNotificationStore';
import { formatLastSeen } from '@/lib/utils'; // Reusing this for "2h ago" style format

export default function NotificationsScreen() {
    const { theme } = useThemeStore();
    const colors = Colors[theme];
    const {
        notifications,
        getNotifications,
        isLoading,
        markAsRead,
        clearAllNotifications,
        markAllAsRead
    } = useNotificationStore();

    useEffect(() => {
        getNotifications();
    }, []);

    const handleRefresh = useCallback(() => {
        getNotifications();
    }, []);

    const handleClearAll = () => {
        if (notifications.length === 0) return;

        Alert.alert(
            "Clear Notifications",
            "Are you sure you want to delete all notifications?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: clearAllNotifications }
            ]
        );
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    const handleNotificationPress = (item: Notification) => {
        if (!item.read) {
            markAsRead(item._id);
        }
    };

    const getIconInfo = (type: string) => {
        switch (type) {
            case 'alert': return { name: 'shield-alert', color: '#D32F2F', bg: '#FFEBEE' };
            case 'welcome': return { name: 'party-popper', color: '#1976D2', bg: '#E3F2FD' };
            case 'login': return { name: 'log-in', color: '#2E7D32', bg: '#E8F5E9' };
            case 'logout': return { name: 'log-out', color: '#757575', bg: '#F5F5F5' };
            case 'message': return { name: 'message-circle', color: '#7B1FA2', bg: '#F3E5F5' };
            default: return { name: 'info', color: '#1976D2', bg: '#E3F2FD' };
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const iconInfo = getIconInfo(item.type);

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    {
                        backgroundColor: item.read ? 'transparent' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                        borderBottomColor: colors.border
                    }
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : iconInfo.bg }]}>
                    <LucideIcon
                        name={iconInfo.name}
                        size={24}
                        color={theme === 'dark' ? colors.text : iconInfo.color}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.message, { color: colors.icon }]}>{item.message}</Text>
                    <Text style={[styles.time, { color: colors.icon }]}>{formatLastSeen(item.createdAt)}</Text>
                </View>
                {!item.read && (
                    <View style={[styles.dot, { backgroundColor: colors.tint }]} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper bg={colors.background}>
            <View style={styles.container}>
                <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                    {notifications.length > 0 && (
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={handleMarkAllRead} style={styles.actionButton}>
                                <LucideIcon name="check-check" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleClearAll} style={styles.actionButton}>
                                <LucideIcon name="trash-2" size={20} color={'#ef4444'} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {notifications.length === 0 && !isLoading ? (
                    <View style={styles.emptyState}>
                        <LucideIcon name="bell-off" size={64} color={colors.icon} style={{ opacity: 0.5, marginBottom: 16 }} />
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>No notifications</Text>
                        <Text style={{ color: colors.icon, marginTop: 8 }}>You're all caught up!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={colors.tint} />
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        padding: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    }
});
