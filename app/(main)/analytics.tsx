import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Icon, TopNavigationAction } from '@ui-kitten/components';
import { IconProps, IconElement } from '@ui-kitten/components';
import { Tab, TabBar, Spinner, TopNavigation, Text } from '@ui-kitten/components';
import TransactionsTab from './analytics/transactions/transactionsTab';
import InsightsTab from './analytics/insights/insightsTab';
import { useAuth, useUser} from '@clerk/clerk-expo'
import { StoreAnalytics, getStoreAnalytics } from '@/utils/Controllers/AnalyticsController';
import { useFocusEffect } from 'expo-router';

const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Bell" />
);

export default function AnalyticsScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<StoreAnalytics>({} as StoreAnalytics);
  const { getToken } = useAuth();
  const { user } = useUser();

  const [timeSpan, setTimeSpan] = useState(1);

  const getAnalytics = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getStoreAnalytics(token ?? "", user?.publicMetadata.storeId as string, timeSpan);

      setAnalytics(response.data.monthlyBreakdown[0]);
    } catch (error) {
      console.error("Error getting analytics: ", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getAnalytics();

      return () => {
        console.log("anaytics not focused");
      }
    }, [timeSpan])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="giant" />
      </View>
    );
  }
  
  return (
    <Layout style={styles.container}>
      <TopNavigation
        title={() => <Text category="h5">Analytics</Text>}
        alignment="start"
        style={styles.topNavigation}
      />
      <TabBar
        selectedIndex={selectedIndex}
        onSelect={index => setSelectedIndex(index)}
        style={styles.tabBar}
      >
        <Tab title="Transactions" />
        <Tab title="Insights" />
      </TabBar>

      {selectedIndex === 0 && <TransactionsTab analytics={analytics} />}

      {selectedIndex === 1 && <InsightsTab analytics={analytics} setTimeSpan={setTimeSpan} timeSpan={timeSpan} />}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tabBar: {
    margin: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  topNavigation: {
    marginTop: 10,
  },
});
