import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Layout, Text, Spinner, Divider } from '@ui-kitten/components';
import TopProductItem from './components/topProductItem';

const placeholderAnalytics = {
  storeName: "Shrak",
  monthIndex: 0,
  totalProducts: 5,
  totalViews: 66,
  totalCartAdds: 1,
  totalPurchases: 1,
  averageEngagementScore: 0.162,
  averageViewsPerProduct: 13.2,
  averageRevenuePerProduct: 385,
  topProducts: [
    {
      productId: "bb94b04e-5f36-448a-9867-212b3ed6b8f5",
      productName: "Bro Product",
      views: 43,
      cartAdds: 0,
      purchases: 1,
      revenue: 1925,
      engagementScore: 0.53,
    },
    {
      productId: "028340e7-df22-483a-bbd9-c92bfe0f5661",
      productName: "Hhfhh",
      views: 10,
      cartAdds: 1,
      purchases: 0,
      revenue: 0,
      engagementScore: 0.12,
    },
    // Add up to 5 products as needed
  ],
};

const InsightsTab = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAnalytics(placeholderAnalytics);
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="giant" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContent}>
      <Layout level='2' style={styles.analyticsContainer}>
        <View style={styles.analyticsHeader}>
          <Text category="h5">Monthly Insights</Text>
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
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.averageEngagementScore}</Text>
          </Layout>
        </View>
        <View style={styles.metricsRowSingle}>
          <Layout level='3' style={styles.analyticsCardSingle}>
            <Text category="c1" appearance="hint">Avg. Views/Product</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>{analytics.averageViewsPerProduct}</Text>
          </Layout>
        </View>
        <View style={styles.metricsRowSingle}>
          <Layout level='3' style={styles.analyticsCardSingle}>
            <Text category="c1" appearance="hint">Avg. Revenue/Product</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>₱ {analytics.averageRevenuePerProduct}</Text>
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