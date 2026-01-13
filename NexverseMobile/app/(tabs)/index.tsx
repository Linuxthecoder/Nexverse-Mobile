import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Switch,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import LucideIcon from '@/components/LucideIcon';
import ChatListItem from '@/components/chat/ChatListItem';
import ContactSelectionModal from '@/components/chat/ContactSelectionModal';
import { formatLastSeen } from '../../lib/utils';

// Constants
const GOLD = '#D4AF37';
const SEARCH_DEBOUNCE_MS = 300;

// Types
interface User {
  _id: string;
  fullName: string;
  profilePic?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageType?: string;
  email?: string;
  [key: string]: any;
}

// Header component
const ChatHeader = React.memo<{
  theme: string;
  colors: any;
  onCameraPress: () => void;
}>(({ colors, onCameraPress }) => (
  <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
    <View style={styles.topBar}>
      <Image
        source={require('../../assets/images/header.png')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <TouchableOpacity onPress={onCameraPress} style={styles.cameraButton}>
        <LucideIcon name="camera" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  </View>
));

// Search bar component
const SearchBar = React.memo<{
  theme: string;
  colors: any;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClear: () => void;
}>(({ theme, colors, searchQuery, onSearchChange, onClear }) => (
  <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
    <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? '#23282e' : '#EAEAEA' }]}>
      <LucideIcon name="search" size={16} color={colors.icon} />
      <TextInput
        placeholder="Search chats"
        placeholderTextColor={colors.icon}
        style={[styles.searchInput, { color: colors.text }]}
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <LucideIcon name="x-circle" size={16} color={colors.icon} />
        </TouchableOpacity>
      )}
    </View>
  </View>
));

// Stats/Filter bar component
const StatsBar = React.memo<{
  colors: any;
  totalChats: number;
  onlineCount: number;
  showOnlineOnly: boolean;
  onToggleOnline: (value: boolean) => void;
}>(({ colors, totalChats, onlineCount, showOnlineOnly, onToggleOnline }) => (
  <View style={[styles.statsBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>

    <View style={styles.statItem}>
      <Text style={[styles.statText, { color: colors.icon }]}>{totalChats} Chats</Text>
    </View>

    <View style={styles.filterContainer}>
      <Text style={[styles.statText, { color: showOnlineOnly ? GOLD : colors.icon, marginRight: 8 }]}>
        {onlineCount} Online
      </Text>
      <Switch
        value={showOnlineOnly}
        onValueChange={onToggleOnline}
        trackColor={{ false: colors.border, true: GOLD }}
        thumbColor={'#fff'}
        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
      />
    </View>
  </View>
));

// Empty state component
const EmptyState = React.memo<{
  colors: any;
  searchQuery: string;
  isOnlineFilter: boolean;
}>(({ colors, searchQuery, isOnlineFilter }) => (
  <View style={styles.emptyContainer}>
    <LucideIcon
      name={searchQuery ? "search-x" : "message-square"}
      size={64}
      color={colors.icon}
      style={styles.emptyIcon}
    />
    <Text style={[styles.emptyText, { color: colors.text }]}>
      {searchQuery ? 'No chats found' : isOnlineFilter ? 'No users online' : 'No chats yet'}
    </Text>
    <Text style={[styles.emptySubtext, { color: colors.icon }]}>
      {searchQuery
        ? 'Try searching for something else'
        : isOnlineFilter
          ? 'Check back later'
          : 'Start a new conversation'}
    </Text>
  </View>
));

export default function ChatsScreen() {
  const { theme } = useThemeStore();
  const router = useRouter();
  const { users, getUsers, isUsersLoading, unreadCounts, subscribeToGlobalMessages, unsubscribeFromGlobalMessages } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const colors = Colors[theme];

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);

  // Load users on mount
  useEffect(() => {
    getUsers();
    subscribeToGlobalMessages();

    return () => {
      unsubscribeFromGlobalMessages();
    };
  }, [getUsers]);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = (users || []) as User[];

    // 1. Online Filter
    if (showOnlineOnly) {
      filtered = filtered.filter(u => onlineUsers.includes(u._id));
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.lastMessage?.toLowerCase().includes(query)
      );
    }

    // 3. Sort
    return filtered.sort((a, b) => {
      const unreadA = unreadCounts[a._id] || 0;
      const unreadB = unreadCounts[b._id] || 0;

      // Unread messages first
      if (unreadA !== unreadB) return unreadB - unreadA;

      // Online users next
      const onlineA = onlineUsers.includes(a._id);
      const onlineB = onlineUsers.includes(b._id);
      if (onlineA !== onlineB) return onlineA ? -1 : 1;

      // Then by last message time
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [users, searchQuery, unreadCounts, onlineUsers, showOnlineOnly]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalChats = users?.length || 0;
    const onlineCount = users?.filter((u) => onlineUsers.includes(u._id)).length || 0;
    return { totalChats, onlineCount };
  }, [users, onlineUsers]);

  // Callbacks
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleToggleOnline = useCallback((val: boolean) => {
    setShowOnlineOnly(val);
  }, []);

  const handleRefresh = useCallback(() => {
    getUsers();
  }, [getUsers]);

  const handleCameraPress = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        setIsSelectionModalVisible(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleSelectUser = (userId: string) => {
    setIsSelectionModalVisible(false);
    // Navigate to chat with the image param or handle it via store
    // ideally we would pass the image data. For now, we simulate by navigating.
    // In a real app, we'd pass the image URI as a param or set it in a global 'pendingAttachment' store.
    router.push({
      pathname: `/chat/${userId}`,
      params: { initialImage: capturedImage }
    });
    setCapturedImage(null);
  };

  const handleCloseModal = () => {
    setIsSelectionModalVisible(false);
    setCapturedImage(null);
  };

  // Render user item
  const renderUser = useCallback(
    ({ item }: { item: User }) => {
      const isOnline = onlineUsers.includes(item._id);
      const unreadCount = unreadCounts[item._id] || 0;
      // Use the real last message from backend, or a default prompt if new
      const lastMessage = item.lastMessage || ' Tap to start chatting';
      // Use the real timestamp if available, otherwise just now or empty
      const timestamp = item.lastMessageTime ? formatLastSeen(item.lastMessageTime) : '';

      return (
        <ChatListItem
          id={item._id}
          name={item.fullName}
          avatar={item.profilePic}
          lastMessage={lastMessage}
          timestamp={timestamp}
          unreadCount={unreadCount}
          isRead={unreadCount === 0}
          isOnline={isOnline}
          isSentByMe={item.isLastMessageMyOwn} // Passed from backend
          messageType={item.lastMessageType}
        />
      );
    },
    [onlineUsers, unreadCounts]
  );

  const keyExtractor = useCallback((item: User) => item._id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80,
      offset: 80 * index,
      index,
    }),
    []
  );

  return (
    <ScreenWrapper bg={colors.background}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ChatHeader
          theme={theme}
          colors={colors}
          onCameraPress={handleCameraPress}
        />

        <SearchBar
          theme={theme}
          colors={colors}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClear={handleClearSearch}
        />

        <FlatList
          ListHeaderComponent={
            <StatsBar
              colors={colors}
              totalChats={stats.totalChats}
              onlineCount={stats.onlineCount}
              showOnlineOnly={showOnlineOnly}
              onToggleOnline={handleToggleOnline}
            />
          }
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          refreshControl={
            <RefreshControl
              refreshing={isUsersLoading}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            // Ensure no extra padding causes white space if list is short
            { backgroundColor: colors.background, flexGrow: 1 }
          ]}
          ListEmptyComponent={
            !isUsersLoading ? (
              <EmptyState
                colors={colors}
                searchQuery={searchQuery}
                isOnlineFilter={showOnlineOnly}
              />
            ) : null
          }
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          showsVerticalScrollIndicator={false}
        />

        <ContactSelectionModal
          visible={isSelectionModalVisible}
          onClose={handleCloseModal}
          onSelect={handleSelectUser}
          imageUri={capturedImage}
          users={filteredUsers}
        />

      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingVertical: Spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  headerImage: {
    height: 34,
    width: 140, // Approximate width, resizeMode="contain" will handle aspect ratio
  },
  cameraButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 15,
    borderRadius: 24, // Curved edges
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.md,
    padding: 0,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 11,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: Typography.sizes.md,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // default fallback
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  modalName: {
    fontSize: 16,
    flex: 1,
  }
});