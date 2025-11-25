import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Order, getAllOrders } from "@/utils/Controllers/OrderController";
import { getProductbyID } from "@/utils/Controllers/ProductController";
import { colors, spacing, typography } from "@/constants/theme";
import { Bell } from "lucide-react-native";

interface EnrichedOrder extends Order {
  buyerName?: string;
  productNames?: string[];
  formattedDate?: string;
  orderNumber?: string;
  statusIndex?: number;
}

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Ready For Pickup',
  'Completed',
  'Canceled',
];

const STATUS_MAP: { [key: string]: number } = {
  'Pending': 0,
  'Confirmed': 1,
  'Ready For Pickup': 2,
  'Ready for Pickup': 2, // Handle both variations
  'ReadyForPickup': 2, // Handle backend format (no spaces)
  'Completed': 3,
  'Canceled': 4,
  'Cancelled': 4, // Handle both variations
};

const getStatusIndex = (status: string): number => {
  return STATUS_MAP[status] ?? 0;
};

export default function OrdersScreen({ unread = 0 }: { unread?: number }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken({ template: "seller_app" });
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const storeId = user?.publicMetadata?.storeId as string;
      if (!storeId) {
        throw new Error('Store ID not found in user metadata');
      }
      
      console.log('Fetching orders for store:', storeId);
      const response = await getAllOrders(token, storeId);
      const ordersData = response.data || [];
      
      console.log(`Found ${ordersData.length} orders for store`);
      
      // Debug: Log the structure of the first order to see what we're getting
      if (ordersData.length > 0) {
        console.log('Sample order data:', JSON.stringify(ordersData[0], null, 2));
        console.log('All order statuses:', ordersData.map(o => o.status));
      }

      // Enrich orders with display data
      const enrichedOrders = ordersData.map((order: Order) => {
        // Extract product names from the items array
        const productNames = order.items.map(item => item.productName);
        
        const statusIndex = getStatusIndex(order.status);
        console.log(`Order ${order.id}: status="${order.status}" -> statusIndex=${statusIndex}`);
        
        return {
          ...order,
          buyerName: order.buyerName || "Customer",
          productNames,
          formattedDate: formatOrderDate(order.createdAt),
          orderNumber: generateOrderNumber(order.createdAt),
          // Convert string status to number for compatibility
          statusIndex: statusIndex
        };
      });

      // Sort by creation date, newest first
      enrichedOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setOrders(enrichedOrders);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      setError(error.message || "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getOrders();

      return () => {
        console.log("Orders screen not focused");
      };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getOrders();
    setRefreshing(false);
  };

  const generateOrderNumber = (createdAt: string | Date): string => {
    try {
      const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
      if (isNaN(date.getTime())) {
        return "#UNKNOWN";
      }
      return `#${date.getTime().toString(36).toUpperCase()}`;
    } catch (error) {
      console.error("Error generating order number:", error);
      return "#ERROR";
    }
  };

  const formatOrderDate = (date: string | Date): string => {
    try {
      const orderDate = date instanceof Date ? date : new Date(date);
      if (isNaN(orderDate.getTime())) {
        return "Invalid Date";
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return `Today, ${orderDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}`;
      } else if (diffDays === 2) {
        return `Yesterday, ${orderDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}`;
      } else {
        return orderDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown Date";
    }
  };

  const filteredOrders = orders.filter((order) => (order.statusIndex ?? getStatusIndex(order.status)) === selectedTab);

  const handleOrderPress = (order: EnrichedOrder) => {
    console.log('Order pressed:', order.id, 'Status:', order.status, 'StatusIndex:', order.statusIndex);
    router.push({
      pathname: "/(main)/orders/orderDetails" as any,
      params: { id: order.id },
    });
  };

  const getStatusColor = (status: number | string) => {
    const statusIndex = typeof status === 'string' ? getStatusIndex(status) : status;
    switch (statusIndex) {
      case 0: return colors.warning; // Pending
      case 1: return colors.info; // Confirmed
      case 2: return colors.primary; // Ready For Pickup
      case 3: return colors.success; // Completed
      case 4: return colors.danger; // Canceled
      default: return colors.gray500;
    }
  };

  const renderOrderCard = (order: EnrichedOrder) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.7}
    >
      <Text style={styles.dateText}>{order.formattedDate}</Text>

      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.buyerName}>{order.buyerName}</Text>
        </View>
        <Text style={styles.totalPrice}>₱{order.totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.productSection}>
        <Text style={styles.productNames}>
          {order.productNames && order.productNames.length > 1
            ? `${order.productNames[0]} + ${order.productNames.length - 1} more`
            : order.productNames?.[0] || "Unknown Product"}
        </Text>
        
        {/* Show item type for bundles */}
        {order.items[0]?.itemType === 'bundle' && order.items.length === 1 && (
          <Text style={styles.bundleTypeText}>
            Bundle
          </Text>
        )}
        
        {/* Show bundle description if available and single item */}
        {order.items[0]?.productDescription && order.items.length === 1 && (
          <Text style={styles.productDescription} numberOfLines={1}>
            {order.items[0].productDescription}
          </Text>
        )}
        
        <Text style={styles.quantityText}>
          {order.items.length > 1
            ? `${order.items.length} items`
            : `Qty: ${order.items[0]?.quantity || 1}`}
        </Text>
      </View>

      {(order.status !== "Completed" && order.status !== "Canceled") &&
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status}
            </Text>
          </View>
        </View>
      }
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Orders</Text>
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

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Orders</Text>
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

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Orders</Text>
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

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {ORDER_STATUSES.map((status, index) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.tab,
                selectedTab === index && styles.activeTab,
              ]}
              onPress={() => setSelectedTab(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === index && styles.activeTabText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyText}>
              No {ORDER_STATUSES[selectedTab].toLowerCase()} orders found
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 0
                ? "New orders will appear here"
                : `You don't have any ${ORDER_STATUSES[selectedTab].toLowerCase()} orders yet`}
            </Text>
          </View>
        ) : (
          filteredOrders.map(renderOrderCard)
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  tabContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tabsScrollContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    minWidth: 120,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.danger,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.bold,
  },
  scrollContainer: {
    paddingTop: spacing.lg,
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.tertiary,
  },
  orderCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  dateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  buyerName: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  totalPrice: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
  },
  productSection: {
    marginBottom: spacing.sm,
  },
  productNames: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  bundleTypeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.primary + '20',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  quantityText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    paddingHorizontal: 3,
  },
});