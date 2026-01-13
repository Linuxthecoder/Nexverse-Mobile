import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
    StatusBar,
    Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import LucideIcon from '@/components/LucideIcon';
import { useThemeStore } from '@/store/useThemeStore';
import { getImageUrl } from '@/lib/utils';

interface User {
    _id: string;
    fullName: string;
    profilePic?: string;
    about?: string; // Adding about/status field
    phone?: string;
    [key: string]: any;
}

interface ContactSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (userId: string) => void;
    imageUri: string | null;
    users: User[];
}

export default function ContactSelectionModal({
    visible,
    onClose,
    onSelect,
    imageUri,
    users,
}: ContactSelectionModalProps) {
    const { theme } = useThemeStore();
    const colors = Colors[theme];
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter((user) =>
            user.fullName.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <LucideIcon name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Select contacts</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.icon }]}>{users.length} contacts</Text>
                    </View>

                    <TouchableOpacity onPress={() => setIsSearching(!isSearching)} style={styles.headerIcon}>
                        <LucideIcon name="search" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.headerIcon}>
                        <LucideIcon name="more-vertical" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Extended Header Search (if toggled) */}
                {isSearching && (
                    <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search..."
                            placeholderTextColor={colors.icon}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>
                )}

                {/* Contact List */}
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => onSelect(item._id)}
                        >
                            {/* Avatar */}
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={getImageUrl(item.profilePic) ? { uri: getImageUrl(item.profilePic) } : require('@/assets/images/avatar.png')}
                                    style={styles.avatar}
                                    defaultSource={require('@/assets/images/avatar.png')}
                                />
                            </View>

                            {/* Info */}
                            <View style={styles.contactInfo}>
                                <View style={styles.contactRow}>
                                    <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>{item.fullName}</Text>
                                </View>
                                <Text
                                    style={[styles.contactStatus, { color: colors.icon }]}
                                    numberOfLines={1}
                                >
                                    {item.about || item.lastMessage || "Hey there! I am using NexVerse."}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 50,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 13,
    },
    headerIcon: {
        marginLeft: 20,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    searchInput: {
        fontSize: 16,
    },
    listContent: {
        paddingTop: 8,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        // Typically no borders in modern flat lists unless grouped
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    contactInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    contactName: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
    },
    contactStatus: {
        fontSize: 14,
    },
});
