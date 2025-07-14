import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Divider, List, ListItem, useTheme } from '@ui-kitten/components';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useAuth} from '@clerk/clerk-expo';
import { Order, getOrderbyID } from '@/utils/Controllers/OrderController';
import { Buyer, getBuyer } from '@/utils/Controllers/BuyerController';
import { Product, getProductbyID } from '@/utils/Controllers/ProductController';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Ready For Pickup',
  'Completed',
  'Canceled',
];

export default function OrderDetailsScreen() {
  const {getToken} = useAuth();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  // const order = ORDERS.find((o) => o.id === params.id) || ORDERS[0];

  const [order, setOrder] = useState<Order>({} as Order);
  const [buyer, setBuyer] = useState<Buyer>({} as Buyer);
  const [products, setProducts] = useState<Array<Product>>([]);

  const getOrder = async (token : string) => {
    try {
      const orderResponse = await getOrderbyID(params.id as string, token ?? "");
      setOrder(orderResponse.data);
    } catch (error) {
      console.error("Error getting order: ", error);
    }
  }

  const getUser = async (token : string) => {
    try {
      const buyerResponse = await getBuyer(token ?? "", order.buyerId);
      setBuyer(buyerResponse.data);
    } catch (error) {
      console.error("Error getting buyer: ", error); 
    } 
  }

  const getProducts = (token : string ) => {
    try {
      order.productId.forEach(async (id) => {
        const productResponse = await getProductbyID(id, token ?? "");
        setProducts([...products, productResponse.data]);
      })
    } catch (error) {
      console.error("Error getting products: ", error); 
    }
  }

  useEffect(() => {
    getToken({template: "seller_app"})
    .then(token => {
      getOrder(token as string);
    })
  }, [])

  useEffect(() => {
    if (order.id === undefined) return;

    getToken({template: "seller_app"})
    .then(token => {
      getUser(token as string);
      getProducts(token as string);
    })
  }, [order])

  return ( order.id !== undefined &&
    <Layout style={styles.container}>
        <SafeAreaView style={{flex: 1}}>
            <Text category="h5" style={styles.header}>Order Details</Text>
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.row}><Text category="s1">Order ID: </Text><Text>#{Date.parse(order.createdAt.toString()).toString(36).toUpperCase()}</Text></View>
            <View style={styles.row}><Text category="s1">Buyer's Name:</Text><Text>{buyer.name}</Text></View>
            <View style={styles.row}><Text category="s1">Status:</Text><Text>{ORDER_STATUSES[order.status]}</Text></View>
            <Divider style={{ marginVertical: 8 }} />
            <Text category="s1" style={{ marginBottom: 4 }}>Products Ordered:</Text>
            <List
                data={products}
                renderItem={({ item }) => (
                <ListItem
                    title={item.name}
                    description={item.description}
                    style={styles.productItem}
                />
                )}
                style={styles.productList}
            />
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.row}><Text category="s1">Total Price:</Text><Text category="h6">₱ {order.totalPrice.toFixed(2)}</Text></View>
        </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productList: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  productItem: {
    backgroundColor: 'transparent',
  },
}); 