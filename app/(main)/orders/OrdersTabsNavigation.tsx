import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Tab, TabBar, useTheme } from '@ui-kitten/components';
import renderOrderItem from './components/orderItem';
import { useRouter } from 'expo-router';
import { Order, getAllOrders } from '@/utils/Controllers/OrderController';
import { useAuth } from '@clerk/clerk-expo';
import OrderItem from './components/orderItem';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Ready For Pickup',
  'Completed',
  'Canceled',
];

// Placeholder orders data
const ORDERS = [
  {
    id: 'ORD-1001',
    date: 'YESTERDAY, 8:20 AM',
    price: '₱290',
    status: 'Pending',
    buyerName: 'Adrian Pangilinan',
    products: [
      { name: 'Sunrise Starter Bundle', price: '₱200' },
      { name: 'Egg Sandwich', price: '₱90' },
    ],
    total: '₱290',
  },
  {
    id: 'ORD-1002',
    date: 'MARCH 19, 2025',
    price: '₱150',
    status: 'Completed',
    buyerName: 'Adrian Pangilinan',
    products: [
      { name: 'Chop & Drop Bundle', price: '₱150' },
    ],
    total: '₱150',
  },
  {
    id: 'ORD-1003',
    date: 'MARCH 17, 2025',
    price: '₱700',
    status: 'Ready For Pickup',
    buyerName: 'Adrian Pangilinan',
    products: [
      { name: 'Choco Moist Cake', price: '₱700' },
    ],
    total: '₱700',
  },
  {
    id: 'ORD-1004',
    date: 'MARCH 16, 2025',
    price: '₱500',
    status: 'Confirmed',
    buyerName: 'Jane Doe',
    products: [
      { name: 'Fruit Basket', price: '₱500' },
    ],
    total: '₱500',
  },
  {
    id: 'ORD-1005',
    date: 'MARCH 15, 2025',
    price: '₱350',
    status: 'Canceled',
    buyerName: 'John Smith',
    products: [
      { name: 'Veggie Platter', price: '₱350' },
    ],
    total: '₱350',
  },
];

export default function OrdersTabsNavigation() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [orders, setOrders] = useState<Array<Order>>([]);
  const theme = useTheme();
  const router = useRouter();
  const {getToken} = useAuth();

  const filteredOrders = orders.filter(
    (order) => order.status === selectedIndex
  );

  const getOrders = async () => {
    try {
        const token = await getToken({template: "seller_app"});
        const response = await getAllOrders(token ?? "");

        console.log(response.data);
        setOrders(response.data);
    } catch(error) {
        console.error("Error getting orders: " + error);
    }
  }

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <View style={{display: "flex", gap: 10}}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarScroll}
      >
        <TabBar
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          style={[styles.tabBar, { width: 'auto', minWidth: 500 }]}
          indicatorStyle={styles.tabIndicator}
        >
          {ORDER_STATUSES.map((status) => (
            <Tab key={status} title={status} style={styles.tab} />
          ))}
        </TabBar>
      </ScrollView>
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <OrderItem item={item} theme={theme} onPress={() => router.push({ pathname: '/(main)/orders/orderDetails', params: { id: item.id } })}/>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        ListEmptyComponent={<View style={styles.empty}><></></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarScroll: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  tabBar: {
    marginBottom: 8,
    flexGrow: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    elevation: 0,
  },
  tab: {
    minWidth: 150,
  },
  tabIndicator: {
    height: 3,
    borderRadius: 2,
  },
  ordersList: {
    padding: 16,
    paddingBottom: 80,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
}); 