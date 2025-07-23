import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Layout, Text, Spinner, Divider, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TopProductItem from './components/topProductItem';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getStoreAnalytics, StoreAnalytics } from '@/utils/Controllers/AnalyticsController';
import { useFocusEffect } from 'expo-router';

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

const InsightsTab = ({analytics, setTimeSpan, timeSpan} : {analytics : StoreAnalytics, setTimeSpan: (timeSpan: number) => void, timeSpan: number}) => {
  const [selectedTimeSpan, setSelectedTimeSpan] = useState(new IndexPath(timeSpanConvert(timeSpan)));

  useFocusEffect(
    useCallback(() => {
      switch (selectedTimeSpan.row) {
        case 0:
          setTimeSpan(1);
          break;
        case 1:
          setTimeSpan(3);
          break;
        case 2:
          setTimeSpan(6);
          break;
        case 3:
          setTimeSpan(12);
          break;
      }
    }, [selectedTimeSpan])
  );

  return (
    <ScrollView style={styles.tabContent}>
      <Layout level='2' style={styles.analyticsContainer}>
        <View style={styles.headerRow}>
          <Text category="h6">Monthly Insights</Text>
          <Select
            value={timeSpanOptions[selectedTimeSpan.row]}
            selectedIndex={selectedTimeSpan}
            onSelect={index => setSelectedTimeSpan(index as IndexPath)}
            style={styles.timeSpanSelect}
            size="small"
          >
            {timeSpanOptions.map((option, idx) => (
              <SelectItem key={option} title={option} />
            ))}
          </Select>
        </View>
        {/* Views on its own row */}
        <View style={styles.metricsRowSingle}>
          <Layout level='3' style={styles.analyticsCardSingle}>
            <Text category="c1" appearance="hint">Views</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.totalViews}</Text>
          </Layout>
        </View>
        {/* Products, Cart Adds, Purchases in one row */}
        <View style={styles.metricsRowThree}>
          <Layout level='3' style={styles.analyticsCardThree}>
            <Text category="c1" appearance="hint">Products</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.totalProducts}</Text>
          </Layout>
          <Layout level='3' style={styles.analyticsCardThree}>
            <Text category="c1" appearance="hint">Cart Adds</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.totalCartAdds}</Text>
          </Layout>
          <Layout level='3' style={styles.analyticsCardThree}>
            <Text category="c1" appearance="hint">Purchases</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.totalPurchases}</Text>
          </Layout>
        </View>
        {/* Each average analytic on its own row */}
        <View style={styles.metricsRowSingle}>
          <Layout level='3' style={styles.analyticsCardSingle}>
            <Text category="c1" appearance="hint">Avg. Engagement</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.averageEngagementScore.toFixed(2)}</Text>
          </Layout>
        </View>
        <View style={styles.metricsRowSingle}>
          <Layout level='3' style={styles.analyticsCardSingle}>
            <Text category="c1" appearance="hint">Avg. Views/Product</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.averageViewsPerProduct.toFixed(2)}</Text>
          </Layout>
        </View>
        <View style={styles.metricsRowSingle}>
          <Layout level='3' style={styles.analyticsCardSingle}>
            <Text category="c1" appearance="hint">Avg. Revenue/Product</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>₱ {analytics.averageRevenuePerProduct.toFixed(2)}</Text>
          </Layout>
        </View>
      </Layout>
      <Layout level='2' style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text category="h6">Top Products</Text>
        </View>
        <FlatList
          scrollEnabled={false}
          data={analytics.topProducts.slice(0, 5)}
          renderItem={({ item, index }) => <TopProductItem item={item} index={index} />}
          keyExtractor={item => item.productId}
          ItemSeparatorComponent={Divider}
          contentContainerStyle={styles.productsList}
        />
      </Layout>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  analyticsContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeSpanSelect: {
    minWidth: 140,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricsRowSingle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  analyticsCardSingle: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 110,
    elevation: 2,
    marginHorizontal: 0,
  },
  metricsRowThree: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 20,
  },
  analyticsCardThree: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 10,
    alignItems: 'center',
    minHeight: 110,
    elevation: 2,
    marginHorizontal: 6,
  },
  BoxValue: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productsContainer: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsList: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  }
});

export default InsightsTab; 