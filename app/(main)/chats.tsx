import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';

interface ChatConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  orderNumber?: string;
}

const generateMockChats = (): ChatConversation[] => {
  return [
    {
      id: 'chat-1',
      customerId: 'customer-1',
      customerName: 'Sarah Johnson',
      customerAvatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Is my order ready for pickup?',
      lastMessageTime: '5m ago',
      unreadCount: 2,
      isOnline: true,
      orderNumber: '#12345'
    },
    {
      id: 'chat-2',
      customerId: 'customer-2',
      customerName: 'Mike Chen',
      customerAvatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'Thank you for the quick delivery!',
      lastMessageTime: '1h ago',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: 'chat-3',
      customerId: 'customer-3',
      customerName: 'Emily Davis',
      customerAvatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: 'Do you have organic apples in stock?',
      lastMessageTime: '3h ago',
      unreadCount: 1,
      isOnline: false,
    },
    {
      id: 'chat-4',
      customerId: 'customer-4',
      customerName: 'Alex Rodriguez',
      customerAvatar: 'https://i.pravatar.cc/150?img=4',
      lastMessage: 'Great service as always!',
      lastMessageTime: '1d ago',
      unreadCount: 0,
      isOnline: false,
    },
  ];
};


export default function ChatListScreen({ unread = 0 }: { unread?: number }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats] = useState<ChatConversation[]>(generateMockChats());

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chat: ChatConversation) => {
    router.push(`/(main)/chats/${chat.customerId}` as any);
  };

  const renderChatItem = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.customerAvatar }} style={styles.customerAvatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.customerName}
          </Text>
          <Text style={styles.messageTime}>{item.lastMessageTime}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="MessageCircle" width={24} height={24} fill={colors.primary} />
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(main)/notifications/notificationsScreen')}
          style={styles.notificationButton}
        >
          <Bell size={25} color={unread > 0 ? colors.primary : colors.text.secondary} />
          {unread > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="Search" width={20} height={20} fill={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="X" width={20} height={20} fill={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat List */}
      {filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="MessageCircle" width={64} height={64} fill={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No conversations found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.length > 0
              ? "Try searching for a different customer"
              : "Customer messages will appear here when they contact you!"
            }
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  searchContainer: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    width: '100%',
    maxWidth: 400,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: spacing.xs,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.tertiary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  customerName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  messageTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadCount: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
});