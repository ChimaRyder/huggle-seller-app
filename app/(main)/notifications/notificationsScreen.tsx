import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Notification, getNotifications, markRead } from "@/utils/data/NotificationsController";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

// Get icon based on notification type
const getIconForType = (type: number) => {
  switch (type) {
    case 1: // Order notification
      return "bag";
    case 2: // Review notification
      return "star";
    case 3: // Stock notification
      return "warning";
    case 4: // Payment notification
      return "card";
    case 5: // Verification notification
      return "checkmark-circle";
    default:
      return "notifications";
  }
};

// Get background color based on notification type
const getColorForType = (type: number) => {
  switch (type) {
    case 1: // Order notification
      return colors.info;
    case 2: // Review notification
      return colors.warning;
    case 3: // Stock notification
      return colors.danger;
    case 4: // Payment notification
      return colors.success;
    case 5: // Verification notification
      return colors.primary;
    default:
      return colors.gray500;
  }
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  if (interval === 1) return "1 year ago";

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  if (interval === 1) return "1 month ago";

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return "1 day ago";

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return "1 hour ago";

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  if (interval === 1) return "1 minute ago";

  return "Just now";
};

const NotificationScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  const getAllNotifs = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getNotifications(token ?? "", user?.id as string);

      setNotifications((response as any).data);
    } catch (error) {
      console.error("Error getting notifications: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await markRead(token ?? "", user?.id as string);

      router.back();
    } catch (error) {
      console.error("Error updating notifications: ", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      await markRead(token ?? "", user?.id as string);
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      Alert.alert("Success", "All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read: ", error);
    }
  };

  const handlePress = (notif: Notification) => {
    if (!notif.isRead) {
      // Mark as read locally
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }

    // Handle navigation based on notification type
    try {
      switch (notif.type) {
        case 1: // Order notification (NewOrder, OrderPickedUp)
          if (notif.relatedEntityId) {
            router.push({
              pathname: '/(main)/orders/orderDetails' as any,
              params: { id: notif.relatedEntityId },
            });
          } else {
            router.push('/(main)/orders');
          }
          break;
        case 2: // Review/Report notification
          router.push('/(main)/analytics');
          break;
        case 5: // Verification notification
          router.push('/(main)/profile/storeVerification');
          break;
        default:
          // For other types, stay in notifications screen
          console.log('Notification tapped, no specific navigation defined for type:', notif.type);
          break;
      }
    } catch (error) {
      console.error('Navigation error from notification card:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getAllNotifs().finally(() => setRefreshing(false));
  };

  useFocusEffect(
    useCallback(() => {
      getAllNotifs();

      return () => {
        console.log("Notifs not focused")
      }
    }, [])
  );

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, item.isRead ? styles.readCard : {}]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: `${getColorForType(item.type)}20` }
        ]}
      >
        <Ionicons
          name={getIconForType(item.type) as any}
          size={24}
          color={getColorForType(item.type)}
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>
          {formatTimeAgo(item.createdAt)}
        </Text>
      </View>
      {!item.isRead && (
        <View style={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
        >
          <Ionicons
            name="checkmark-done"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off"
                size={64}
                color={colors.text.tertiary}
              />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>We'll notify you when something important happens</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  markAllButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  readCard: {
    opacity: 0.7,
    borderLeftColor: colors.text.tertiary,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    fontWeight: '400',
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '400',
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

export default NotificationScreen;