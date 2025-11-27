import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter , useFocusEffect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getStoreAnalyticsSummary, getStoreTopProducts, calculateConversionFunnel, StoreAnalyticsSummary, TopProductsResponse, ConversionFunnelResponse } from '@/utils/Controllers/AnalyticsController';
import { getAllOrders, Order } from '@/utils/Controllers/OrderController';
import { Bell, PhilippinePeso, TrendingUp, TrendingDown, Eye, ShoppingCart, ShoppingBag, Target, Users, Zap, Clock, Calendar, ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';

const TIME_PERIODS = ['1 Month', '3 Months', '6 Months', '1 Year'];

export default function AnalyticsScreen({ unread = 0 }: { unread?: number }) {
  const router = useRouter();
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState<StoreAnalyticsSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductsResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelResponse | null>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  const [timeSpan, setTimeSpan] = useState(1);

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateConversionRate = (purchases: number, views: number): number => {
    return views > 0 ? (purchases / views) * 100 : 0;
  };

  const getTimeSpanValue = (index: number): number => {
    const timeMap = [1, 3, 6, 12];
    return timeMap[index] || 1;
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getOrderId = (order: Order): string => {
    return `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()}`;
  };

  const getAnalytics = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const storeId = user?.publicMetadata?.storeId as string;
      
      if (!token || !storeId) {
        console.log('Missing token or storeId:', { token: !!token, storeId });
        return;
      }

      // Map timeSpan to period
      let period: 'current' | '6months' | 'year' | 'all';
      switch (timeSpan) {
        case 1:
          period = 'current';
          break;
        case 6:
          period = '6months';
          break;
        case 12:
          period = 'year';
          break;
        default:
          period = 'all';
          break;
      }
      
      // Fetch analytics summary, top products, and orders individually with better error handling
      let summaryResponse, topProductsResponse, ordersResponse;
      
      try {
        summaryResponse = await getStoreAnalyticsSummary(token, storeId, period);
        // Handle nested data structure from backend
        const summaryData = summaryResponse.data?.data || summaryResponse.data;
        setAnalyticsSummary(summaryData);
      } catch (error) {
        console.error('Error fetching analytics summary:', error);
      }
      
      try {
        topProductsResponse = await getStoreTopProducts(token, storeId, timeSpan === 1 ? undefined : timeSpan, 5);
        // Handle nested data structure from backend
        const topProductsData = topProductsResponse.data?.data || topProductsResponse.data;
        setTopProducts(topProductsData);
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
      
      try {
        ordersResponse = await getAllOrders(token, storeId);
        
        // Filter orders to show all orders, not just completed ones
        const allOrders = (ordersResponse.data as Order[]).sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(allOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
      
      // Calculate conversion funnel locally if we have summary data
      if (summaryResponse?.data) {
        try {
          const summaryData = summaryResponse.data?.data || summaryResponse.data;
          const topProductsData = topProductsResponse?.data?.data || topProductsResponse?.data;
          const funnel = calculateConversionFunnel(summaryData, topProductsData);
          setConversionFunnel(funnel);
        } catch (error) {
          console.error('Error calculating conversion funnel:', error);
        }
      }
      
    } catch (error) {
      console.error("Error getting analytics: ", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getAnalytics();
    setRefreshing(false);
  }, [timeSpan]);

  const handleTimeSpanChange = useCallback((index: number) => {
    setSelectedTimeIndex(index);
    setTimeSpan(getTimeSpanValue(index));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getAnalytics();
      return () => {
        console.log("analytics not focused");
      };
    }, [timeSpan])
  );

  // Calculate derived metrics
  const conversionRate = calculateConversionRate(analyticsSummary?.totalOrderCount || 0, analyticsSummary?.totalViewCount || 0);
  const totalRevenue = (analyticsSummary?.totalRevenue || 0);
  const avgOrderValue = (analyticsSummary?.totalOrderCount || 0) > 0 ? totalRevenue / (analyticsSummary?.totalOrderCount || 1) : 0;
  const completedOrders = orders.filter(order => order.status === 'Completed'); // Completed orders
  const recentOrders = orders.slice(0, 10); // Show 10 most recent orders

  const getOrderStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string, color: string, icon: any } } = {
      'Pending': { label: 'Pending', color: colors.warning, icon: Clock },
      'Confirmed': { label: 'Confirmed', color: colors.info, icon: ShoppingCart },
      'Ready For Pickup': { label: 'Ready', color: colors.primary, icon: ShoppingBag },
      'Ready for Pickup': { label: 'Ready', color: colors.primary, icon: ShoppingBag },
      'Completed': { label: 'Completed', color: colors.success, icon: Target },
      'Canceled': { label: 'Cancelled', color: colors.error, icon: Clock },
      'Cancelled': { label: 'Cancelled', color: colors.error, icon: Clock },
    };
    return statusMap[status] || statusMap['Pending'];
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo = getOrderStatusInfo(item.status);
    const StatusIcon = statusInfo.icon;

    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => router.push({
          pathname: "/(main)/orders/orderDetails" as any,
          params: { id: item.id },
        })}
      >
        <View style={styles.orderLeft}>
          <View style={[styles.orderStatusIcon, { backgroundColor: statusInfo.color + '20' }]}>
            <StatusIcon size={16} color={statusInfo.color} />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{getOrderId(item)}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.orderRight}>
          <Text style={styles.orderAmount}>{formatCurrency(item.totalAmount)}</Text>
          <Text style={[styles.orderStatus, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(main)/notifications/notificationsScreen')}
            style={styles.notificationButton}
          >
            <Bell size={25} color={unread > 0 ? colors.success : colors.text.secondary} />
            {unread > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Business Analytics</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(main)/notifications/notificationsScreen')}
          style={styles.notificationButton}
        >
          <Bell size={25} color={unread > 0 ? colors.success : colors.text.secondary} />
          {unread > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Selector */}
        <View style={styles.timePeriodSection}>
          <View style={styles.timeSelector}>
            {TIME_PERIODS.map((period, index) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timeSelectorOption,
                  selectedTimeIndex === index && styles.timeSelectorActive
                ]}
                onPress={() => handleTimeSpanChange(index)}
              >
                <Text style={[
                  styles.timeSelectorText,
                  selectedTimeIndex === index && styles.timeSelectorActiveText
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Revenue Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <PhilippinePeso size={28} color={colors.success} />
              <View style={styles.revenueHeaderText}>
                <Text style={styles.revenueTitle}>Total Revenue</Text>
                <Text style={styles.revenueAmount}>{formatCurrency(totalRevenue)}</Text>
              </View>
            </View>
            <View style={styles.revenueStats}>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatLabel}>Avg Order Value</Text>
                <Text style={styles.revenueStatValue}>{formatCurrency(avgOrderValue)}</Text>
              </View>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatLabel}>Completed Orders</Text>
                <Text style={styles.revenueStatValue}>{completedOrders.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Target size={20} color={colors.primary} />
                <Text style={styles.metricLabel}>Conversion Rate</Text>
              </View>
              <Text style={styles.metricValue}>{conversionRate.toFixed(2)}%</Text>
              <Text style={styles.metricSubtext}>Views to Sales</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Eye size={20} color={colors.info} />
                <Text style={styles.metricLabel}>Total Views</Text>
              </View>
              <Text style={styles.metricValue}>{(analyticsSummary?.totalViewCount || 0).toLocaleString()}</Text>
              <Text style={styles.metricSubtext}>Product impressions</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <ShoppingCart size={20} color={colors.warning} />
                <Text style={styles.metricLabel}>Cart Adds</Text>
              </View>
              <Text style={styles.metricValue}>{analyticsSummary?.totalAddToCartCount || 0}</Text>
              <Text style={styles.metricSubtext}>Items added to cart</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Users size={20} color={colors.success} />
                <Text style={styles.metricLabel}>Active Products</Text>
              </View>
              <Text style={styles.metricValue}>{topProducts?.topProducts?.length || 0}</Text>
              <Text style={styles.metricSubtext}>Live products</Text>
            </View>
          </View>
        </View>

        {/* Conversion Funnel */}
        {conversionFunnel && conversionFunnel.funnel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conversion Funnel</Text>
            <View style={styles.funnelCard}>
              <View style={styles.funnelStep}>
                <View style={styles.funnelStepLeft}>
                  <Eye size={20} color={colors.info} />
                  <View style={styles.funnelStepText}>
                    <Text style={styles.funnelStepLabel}>Views</Text>
                    <Text style={styles.funnelStepValue}>{(conversionFunnel.funnel.views || 0).toLocaleString()}</Text>
                  </View>
                </View>
                <Text style={styles.funnelStepRate}>100%</Text>
              </View>
              
              <View style={styles.funnelConnector} />
              
              <View style={styles.funnelStep}>
                <View style={styles.funnelStepLeft}>
                  <ShoppingCart size={20} color={colors.warning} />
                  <View style={styles.funnelStepText}>
                    <Text style={styles.funnelStepLabel}>Cart Adds</Text>
                    <Text style={styles.funnelStepValue}>{(conversionFunnel.funnel.addToCarts || 0).toLocaleString()}</Text>
                  </View>
                </View>
                <Text style={styles.funnelStepRate}>{(conversionFunnel.funnel.viewToCartRate || 0).toFixed(1)}%</Text>
              </View>
              
              <View style={styles.funnelConnector} />
              
              <View style={styles.funnelStep}>
                <View style={styles.funnelStepLeft}>
                  <ShoppingBag size={20} color={colors.success} />
                  <View style={styles.funnelStepText}>
                    <Text style={styles.funnelStepLabel}>Orders</Text>
                    <Text style={styles.funnelStepValue}>{(conversionFunnel.funnel.orders || 0).toLocaleString()}</Text>
                  </View>
                </View>
                <Text style={styles.funnelStepRate}>{(conversionFunnel.funnel.cartToOrderRate || 0).toFixed(1)}%</Text>
              </View>
              
              <View style={styles.funnelSummary}>
                <Text style={styles.funnelSummaryLabel}>Overall Conversion Rate</Text>
                <Text style={styles.funnelSummaryValue}>{(conversionFunnel.funnel.overallConversionRate || 0).toFixed(2)}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/orders')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersContainer}>
            {recentOrders.length > 0 ? (
              <FlatList
                data={recentOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.orderSeparator} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Calendar size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyStateText}>No orders yet</Text>
                <Text style={styles.emptyStateSubtext}>Orders will appear here when customers start buying</Text>
              </View>
            )}
          </View>
        </View>

        {/* Top Products */}
        {topProducts?.topProducts && topProducts.topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Performing Products</Text>
            <View style={styles.topProducts}>
              {topProducts.topProducts.slice(0, 3).map((product, index) => (
                <View key={product.productId} style={styles.topProductItem}>
                  <View style={[styles.productRank, {
                    backgroundColor: index === 0 ? colors.warning + '20' :
                                   index === 1 ? colors.info + '20' : colors.success + '20',
                    borderColor: index === 0 ? colors.warning :
                                index === 1 ? colors.info : colors.success,
                  }]}>
                    <Text style={styles.productRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.productName}</Text>
                    <Text style={styles.productStats}>
                      {product.viewCount} views • {product.orderCount} sales
                    </Text>
                  </View>
                  <Text style={styles.productScore}>{(product.conversionRate * 100).toFixed(1)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
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
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
  },

  // Time Period Section
  timePeriodSection: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.xs,
  },
  timeSelectorOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  timeSelectorActive: {
    backgroundColor: colors.primary,
  },
  timeSelectorText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  timeSelectorActiveText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.semibold,
  },

  // Sections
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },

  // Revenue Card
  revenueCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  revenueHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  revenueTitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  revenueAmount: {
    fontSize: typography.fontSizes.hero,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  revenueStat: {
    flex: 1,
  },
  revenueStatLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  revenueStatValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '47%',
    minHeight: 120,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  metricValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metricSubtext: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
  },

  // Orders Container
  ordersContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  orderStatus: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  orderSeparator: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginHorizontal: spacing.lg,
  },

  // Conversion Funnel
  funnelCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  funnelStep: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  funnelStepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  funnelStepText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  funnelStepLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  funnelStepValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  funnelStepRate: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
  funnelConnector: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.xs,
  },
  funnelSummary: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    alignItems: 'center',
  },
  funnelSummaryLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  funnelSummaryValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
  },

  // Top Products
  topProducts: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  productRankText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productStats: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  productScore: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },

  // Empty State
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
