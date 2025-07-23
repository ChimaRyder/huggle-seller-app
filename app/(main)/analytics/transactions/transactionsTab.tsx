import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Layout, Divider, useTheme } from '@ui-kitten/components';
import renderTransactionItem from './components/transactionItem';
import { StoreAnalytics } from '@/utils/Controllers/AnalyticsController';
import { useCallback, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { getAllOrders, Order } from '@/utils/Controllers/OrderController';
import { useFocusEffect } from 'expo-router';
import { CookingPot } from 'lucide-react-native';

// Transactions Tab Component
const TransactionsTab = ({analytics} : {analytics : StoreAnalytics}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Array<Order>>({} as Order[]);
  const { getToken } = useAuth();

  const getOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getAllOrders(token ?? "");

      setOrders(response.data.filter((data : Order) => data.status === 3));
    } catch(error) {
      console.error("Error getting orders: ", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getOrders();
    }, [analytics])
  )

  return (
    <View style={styles.tabContent}>
      <Layout level='2' style={styles.earningsContainer}>
        <View style={styles.earningsHeader}>
          {/* <Text category="h5">Earnings</Text> */}
        </View>
        
        <Text category="h2" style={styles.totalRevenue}>₱ { analytics.totalRevenue.toFixed(2) }</Text>
        <Text category="c1" appearance="hint" style={styles.totalRevenueLabel}>Total Revenue</Text>
        
        {/* <View style={styles.analyticsRow}>
          <Layout level='3' style={styles.analyticsCard}>
            <Text category="c1" appearance="hint">Average per week</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>₱ 00.00</Text>
          </Layout>
          <Layout level='3' style={styles.analyticsCard}>
            <Text category="c1" appearance="hint">Earning Growth</Text>
            <Text appearance="basic" category="h6" style={styles.BoxValue}>0%</Text>
          </Layout>
        </View> */}
      </Layout>
      
      <Layout level='2' style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text category="h6">Completed Orders</Text>
        </View>
        
        <FlatList
          refreshing={loading}
          onRefresh={getOrders}
          data={orders}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.transactionsList, orders.length === 0 && {flex: 1}]}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={
            <Layout level="2" style={styles.emptyContainer}>
              <CookingPot size={40} color={theme['color-basic-100']}/>
              <Text category='h6'>No Orders Found</Text>
              <Text category='p2'>No orders have been completed yet</Text>
            </Layout>
          }
        />
      </Layout>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  earningsContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalRevenueLabel: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  totalRevenue: {
    marginBottom: 4,
    alignSelf: 'center',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  analyticsCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  transactionsContainer: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 80,
  },
  BoxValue: {
  marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  }
});
  
export default TransactionsTab;
