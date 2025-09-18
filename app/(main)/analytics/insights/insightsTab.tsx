import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import TopProductItem from './components/topProductItem';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getStoreAnalytics, StoreAnalytics } from '@/utils/data/AnalyticsController';
import { useFocusEffect } from 'expo-router';
import { TrendingUp, TrendingDown, Eye, ShoppingCart, ShoppingBag, DollarSign, Users, Target, Zap } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';

const timeSpanConvert = (timeSpan: number) => {
  switch (timeSpan) {
    case 1:
      return 0;
    case 3:
      return 1;
    case 6:
      return 2;
    case 12:
      return 3;
    default:
      return 0;
  }
}

const timeSpanOptions = ["1 Month", "3 Months", "6 Months", "1 Year"];

// Helper functions for calculations
const calculateConversionRate = (purchases: number, views: number): number => {
  return views > 0 ? (purchases / views) * 100 : 0;
};

const calculateCartConversion = (purchases: number, cartAdds: number): number => {
  return cartAdds > 0 ? (purchases / cartAdds) * 100 : 0;
};

const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getGrowthIndicator = (current: number, previous: number) => {
  if (previous === 0) return { isPositive: true, percentage: 0 };
  const growth = ((current - previous) / previous) * 100;
  return { isPositive: growth >= 0, percentage: Math.abs(growth) };
};

const InsightsTab = ({analytics, setTimeSpan, timeSpan} : {analytics : StoreAnalytics, setTimeSpan: (timeSpan: number) => void, timeSpan: number}) => {
  const [selectedTimeSpan, setSelectedTimeSpan] = useState(timeSpanConvert(timeSpan));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Trigger analytics refresh in parent component
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleTimeSpanChange = useCallback((index: number) => {
    setSelectedTimeSpan(index);
    switch (index) {
      case 0: setTimeSpan(1); break;
      case 1: setTimeSpan(3); break;
      case 2: setTimeSpan(6); break;
      case 3: setTimeSpan(12); break;
    }
  }, [setTimeSpan]);

  // Calculate derived metrics
  const conversionRate = calculateConversionRate(analytics.totalPurchases || 0, analytics.totalViews || 0);
  const cartConversion = calculateCartConversion(analytics.totalPurchases || 0, analytics.totalCartAdds || 0);
  const totalRevenue = (analytics.averageRevenuePerProduct || 0) * (analytics.totalProducts || 0);
  const avgOrderValue = analytics.totalPurchases > 0 ? totalRevenue / analytics.totalPurchases : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Time Period Selector */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Business Insights</Text>
          <Text style={styles.headerSubtitle}>Track your store's performance</Text>
        </View>
        <View style={styles.timeSelector}>
          {timeSpanOptions.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.timeSelectorOption,
                selectedTimeSpan === index && styles.timeSelectorActive
              ]}
              onPress={() => handleTimeSpanChange(index)}
            >
              <Text style={[
                styles.timeSelectorText,
                selectedTimeSpan === index && styles.timeSelectorActiveText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Revenue Highlight Card */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueHeader}>
          <DollarSign size={24} color={colors.success} />
          <Text style={styles.revenueTitle}>Total Revenue</Text>
        </View>
        <Text style={styles.revenueAmount}>{formatCurrency(totalRevenue)}</Text>
        <View style={styles.revenueStats}>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueStatLabel}>Avg Order Value</Text>
            <Text style={styles.revenueStatValue}>{formatCurrency(avgOrderValue)}</Text>
          </View>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueStatLabel}>Revenue/Product</Text>
            <Text style={styles.revenueStatValue}>{formatCurrency(analytics.averageRevenuePerProduct || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Key Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Target size={20} color={colors.primary} />
              <Text style={styles.metricLabel}>Conversion Rate</Text>
            </View>
            <Text style={styles.metricValue}>{conversionRate.toFixed(2)}%</Text>
            <Text style={styles.metricSubtext}>Views to Purchases</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <ShoppingCart size={20} color={colors.warning} />
              <Text style={styles.metricLabel}>Cart Conversion</Text>
            </View>
            <Text style={styles.metricValue}>{cartConversion.toFixed(2)}%</Text>
            <Text style={styles.metricSubtext}>Cart to Purchase</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Eye size={20} color={colors.info} />
              <Text style={styles.metricLabel}>Total Views</Text>
            </View>
            <Text style={styles.metricValue}>{(analytics.totalViews || 0).toLocaleString()}</Text>
            <Text style={styles.metricSubtext}>Product impressions</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <ShoppingBag size={20} color={colors.success} />
              <Text style={styles.metricLabel}>Orders</Text>
            </View>
            <Text style={styles.metricValue}>{analytics.totalPurchases || 0}</Text>
            <Text style={styles.metricSubtext}>Completed purchases</Text>
          </View>
        </View>
      </View>

      {/* Business Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Performance</Text>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceCard}>
            <View style={styles.performanceIcon}>
              <Users size={20} color={colors.primary} />
            </View>
            <View style={styles.performanceContent}>
              <Text style={styles.performanceLabel}>Avg. Views per Product</Text>
              <Text style={styles.performanceValue}>{(analytics.averageViewsPerProduct || 0).toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.performanceCard}>
            <View style={styles.performanceIcon}>
              <Zap size={20} color={colors.warning} />
            </View>
            <View style={styles.performanceContent}>
              <Text style={styles.performanceLabel}>Active Products</Text>
              <Text style={styles.performanceValue}>{analytics.totalProducts || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Top Performing Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performing Products</Text>
        <View style={styles.topProducts}>
          {(analytics.topProducts || []).slice(0, 5).map((item, index) => (
            <TopProductItem key={item.productId} item={item} index={index} />
          ))}
          {(!analytics.topProducts || analytics.topProducts.length === 0) && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No product data available</Text>
              <Text style={styles.emptyStateSubtext}>Start selling to see your top products here</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerLeft: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
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

  // Revenue Card
  revenueCard: {
    backgroundColor: colors.background.primary,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  revenueTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  revenueAmount: {
    fontSize: typography.fontSizes.hero,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
    marginBottom: spacing.lg,
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

  // Sections
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '48%',
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

  // Performance Grid
  performanceGrid: {
    gap: spacing.md,
  },
  performanceCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  performanceContent: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  performanceValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },

  // Top Products
  topProducts: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    overflow: 'hidden',
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
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default InsightsTab; 