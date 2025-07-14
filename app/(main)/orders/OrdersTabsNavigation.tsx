import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Tab, TabBar, useTheme } from '@ui-kitten/components';
import renderOrderItem from './components/orderItem';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
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

export default function OrdersTabsNavigation() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [orders, setOrders] = useState<Array<Order>>([]);
  const params = useLocalSearchParams();
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

  useFocusEffect(
    useCallback(() => {
      console.log("focused");
      getOrders();

      return () => {
        console.log("not focused");
      }
    }, [])
  )



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