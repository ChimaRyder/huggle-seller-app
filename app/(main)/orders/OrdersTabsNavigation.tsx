import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Alert } from 'react-native';
import { Tab, TabBar, useTheme, Text, Spinner } from '@ui-kitten/components';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Order, getAllOrders } from '@/utils/Controllers/OrderController';
import { useAuth, useUser } from '@clerk/clerk-expo';
import OrderItem from './components/orderItem';
import { AlertCircle, CookingPot } from 'lucide-react-native';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Ready For Pickup',
  'Completed',
  'Canceled',
];

const STATUS_MAP: { [key: string]: number } = {
  'Pending': 0,
  'Confirmed': 1,
  'Ready For Pickup': 2,
  'Ready for Pickup': 2,
  'Completed': 3,
  'Canceled': 4,
  'Cancelled': 4,
};

const getStatusIndex = (status: string): number => {
  return STATUS_MAP[status] ?? 0;
};

const emptyMessages = (index : number) => {
  switch (index) {
    case 0:
      return <Text appearance='hint' category='s2'>No Pending orders yet</Text>
    case 1:
      return <Text appearance='hint' category='s2'>No Confirmed orders yet</Text>
    case 2:
      return <Text appearance='hint' category='s2'>No orders ready for pick-up yet</Text>
    case 3:
      return <Text appearance='hint' category='s2'>No orders completed yet</Text>
    case 4:
      return <Text appearance='hint' category='s2'>No orders canceled yet</Text>
  }
}

export default function OrdersTabsNavigation() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const {getToken} = useAuth();
  const {user} = useUser();

  const filteredOrders = orders.filter(
    (order) => getStatusIndex(order.status) === selectedIndex
  );

  const getOrders = async () => {
    try {
        setLoading(true);
        const token = await getToken({template: "seller_app"});
        
        if (!token) {
          console.error('No authentication token available');
          return;
        }
        
        const storeId = user?.publicMetadata?.storeId as string;
        const response = await getAllOrders(token, storeId);

        setOrders(response.data || []);
    } catch(error) {
        console.error("Error getting orders:", error);
    } finally {
      setLoading(false);
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
    <View style={{flex: 1}}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarScroll}
        style={{ flexGrow: 0 }}
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
        refreshing={loading}
        onRefresh={getOrders}
        data={filteredOrders}
        renderItem={({ item }) => (
          <OrderItem item={item} theme={theme} onPress={() => router.push({ pathname: '/(main)/orders/orderDetails', params: { id: item.id } })}/>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.ordersList,
          filteredOrders.length === 0 && { flex: 1, justifyContent: 'center' }
        ]}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <CookingPot size={40} color={theme['color-basic-600']} />
            {emptyMessages(selectedIndex)}
          </View> 
        }
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
}); 