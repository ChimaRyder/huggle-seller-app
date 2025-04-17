import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ScrollView, SafeAreaView } from 'react-native';
import { Layout, Text, Tab, TabBar, Icon, Card, Input, Button, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import BottomNav from '.';
import { IconProps, IconElement } from '@ui-kitten/components';

// Icons for the tabs
const ProductsIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="shopping-bag-outline" pack="eva" />
);

const OrdersIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="shopping-cart-outline" pack="eva" />
);

const TransactionsIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="credit-card-outline" pack="eva" />
);

const PromotionsIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="gift-outline" pack="eva" />
);

const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="search-outline" pack="eva" />
);

const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="bell-outline" pack="eva" />
);

const FilterIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="options-2-outline" pack="eva" />
);

// Product Tab Component
const ProductsTab = () => {
  // Sample product data
  const products = [
    { id: 1, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 2, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 3, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 4, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 5, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 6, name: 'Lorem', items: 5, rating: 5.0 },
  ];

  const renderProductItem = ({ item }: { item: any }) => (
    <Card style={styles.productCard}>
      <View style={styles.productImagePlaceholder}></View>
      <Text category="s1">{item.name}</Text>
      <View style={styles.productDetails}>
        <Text category="c1">{item.items} items</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" pack="eva" width={12} height={12} fill="#FFC107" />
          <Text category="c1">{item.rating}</Text>
        </View>
      </View>
      <Button size="small" style={styles.editButton}>Edit</Button>
    </Card>
  );

  return (
    <View style={styles.tabContent}>
      <Input
        placeholder="Search your products"
        accessoryLeft={SearchIcon}
        style={styles.searchInput}
      />
      <View style={styles.basketHeader}>
        <Text category="h6">Your Baskets</Text>
        <Icon name="options-2-outline" pack="eva" width={24} height={24} />
      </View>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListFooterComponent={
          <Button
            style={styles.addProductButton}
            appearance="outline"
            accessoryLeft={(props) => <Icon {...props} name="plus-outline" pack="eva" />}
          >
            Add Product
          </Button>
        }
      />
    </View>
  );
};

// Orders Tab Component
const OrdersTab = () => {
  // Sample order data
  const orders = [
    { 
      id: 1, 
      date: 'YESTERDAY, 8:20 AM', 
      name: 'Sunrise Starter Bundle', 
      price: '₱290', 
      status: 'Pending',
      customerName: 'Adrian Pangilinan',
      deliveryMethod: 'Delivery via Grab'
    },
    { 
      id: 2, 
      date: 'MARCH 19, 2025', 
      name: 'Chop & Drop Bundle', 
      price: '₱150', 
      status: 'Completed',
      customerName: 'Adrian Pangilinan',
      deliveryMethod: 'Delivery via Lalamove'
    },
    { 
      id: 3, 
      date: 'MARCH 17, 2025', 
      name: 'Choco Moist Cake', 
      price: '₱700', 
      status: 'Completed',
      customerName: 'Adrian Pangilinan',
      deliveryMethod: 'Delivery via Grab'
    },
  ];

  const renderOrderItem = ({ item }: { item: any }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text category="c1" appearance="hint">{item.date}</Text>
        <View style={styles.orderImageContainer}>
          <View style={styles.orderImagePlaceholder}></View>
          <View style={styles.orderInfo}>
            <Text category="s1">{item.name}</Text>
            <Text category="p2">{item.price}</Text>
            <View style={styles.customerInfo}>
              <Icon name="person-outline" pack="eva" width={12} height={12} />
              <Text category="c1">{item.customerName}</Text>
            </View>
            <View style={styles.deliveryInfo}>
              <Icon name="car-outline" pack="eva" width={12} height={12} />
              <Text category="c1">{item.deliveryMethod}</Text>
            </View>
          </View>
        </View>
      </View>
      <Button 
        size="small" 
        status={item.status === 'Pending' ? 'warning' : 'basic'}
        style={styles.orderButton}
      >
        {item.status}
      </Button>
    </Card>
  );

  return (
    <View style={styles.tabContent}>
      <Input
        placeholder="Search in Orders"
        accessoryLeft={SearchIcon}
        accessoryRight={FilterIcon}
        style={styles.searchInput}
      />
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.ordersList}
      />
    </View>
  );
};

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

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <View style={styles.transactionImagePlaceholder}></View>
        <View>
          <Text category="s1">{item.name}</Text>
          <Text category="c1" appearance="hint">{item.time}</Text>
        </View>
      </View>
      <Text category="s1" status="success">{item.amount}</Text>
    </View>
  );

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

// Promotions Tab Component (Empty as requested)
const PromotionsTab = () => {
  return (
    <View style={[styles.tabContent, styles.emptyTabContent]}>
      <Text category="h5">Promotions</Text>
    </View>
  );
};

export default function HomeScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const renderRightActions = () => (
    <TopNavigationAction icon={BellIcon} />
  );

  return ( 
    <Layout style={styles.container}>
      <TopNavigation
        title={evaProps => <Text {...evaProps} category="h5">Good morning!</Text>}
        alignment="start"
        accessoryRight={renderRightActions}
        style={styles.topNavigation}
      />
      
      <TabBar
        selectedIndex={selectedIndex}
        onSelect={index => setSelectedIndex(index)}
        style={styles.tabBar}
      >
        <Tab title="Products"/>
        <Tab title="Orders"/>
        <Tab title="Transactions"/>
        <Tab title="Promotions"/>
      </TabBar>
      
      {selectedIndex === 0 && <ProductsTab />}
      {selectedIndex === 1 && <OrdersTab />}
      {selectedIndex === 2 && <TransactionsTab />}
      {selectedIndex === 3 && <PromotionsTab />}

      {/* <BottomNav/> */}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContent: {
    flex: 1,
  },
  topNavigation: {
    backgroundColor: '#fff',
  },
  tabBar: {
    margin: 3,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  emptyTabContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    marginBottom: 16,
    borderRadius: 8,
  },
  basketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    height: 120,
    backgroundColor: '#E4E9F2',
    borderRadius: 8,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButton: {
    borderRadius: 4,
  },
  addProductButton: {
    marginVertical: 16,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderImageContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  orderImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E4E9F2',
    borderRadius: 8,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  orderButton: {
    alignSelf: 'flex-end',
    borderRadius: 4,
  },
  ordersList: {
    paddingBottom: 80,
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
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionImagePlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#E4E9F2',
    borderRadius: 20,
    marginRight: 12,
  },
  transactionsList: {
    paddingBottom: 80,
  },
});
