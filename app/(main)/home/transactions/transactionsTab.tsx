import { StyleSheet, View, FlatList } from 'react-native';
import { Text } from '@ui-kitten/components';
import renderTransactionItem from './components/transactionItem';

// Transactions Tab Component
const TransactionsTab = () => {
  // Sample transaction data
  const transactions = [
    { id: 1, name: 'Chris Smith', time: '10:55 AM', amount: '+ 50.00' },
    { id: 2, name: 'Chris Smith', time: '10:55 AM', amount: '+ 50.00' },
    { id: 3, name: 'Chris Smith', time: '10:55 AM', amount: '+ 50.00' },
    { id: 4, name: 'Chris Smith', time: '10:55 AM', amount: '+ 50.00' },
    { id: 5, name: 'Chris Smith', time: '10:55 AM', amount: '+ 50.00' },
    { id: 6, name: 'Chris Smith', time: '10:55 AM', amount: '+ 50.00' },
  ];

  return (
    <View style={styles.tabContent}>
      <View style={styles.earningsContainer}>
        <View style={styles.earningsHeader}>
          <Text category="h5">Earnings</Text>
          <Text category="p2" status="primary">See all</Text>
        </View>
        
        <Text category="c1" appearance="hint" style={styles.totalRevenueLabel}>Total Revenue</Text>
        <Text category="h2" style={styles.totalRevenue}>₱ 438.00</Text>
        
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCard}>
            <Text category="c1" appearance="hint">Average per week</Text>
            <Text category="h6">₱ 617.00</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text category="c1" appearance="hint">Earning Growth</Text>
            <Text category="h6">65%</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text category="h6">Transactions</Text>
          <Text category="p2" status="primary">See all</Text>
        </View>
        
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.transactionsList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  earningsContainer: {
    backgroundColor: '#fff',
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
    marginBottom: 4,
  },
  totalRevenue: {
    marginBottom: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#0D2B47',
    borderRadius: 8,
    padding: 16,
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
});
  
export default TransactionsTab;
