import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Layout, Text, Divider, List, ListItem, useTheme, Avatar, Button } from '@ui-kitten/components';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useAuth} from '@clerk/clerk-expo';
import { Order, getOrderbyID, updateOrder } from '@/utils/Controllers/OrderController';
import { Buyer, getBuyer } from '@/utils/Controllers/BuyerController';
import { Product, getProductbyID } from '@/utils/Controllers/ProductController';
import { showToast } from "@/components/Toast";

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Ready For Pickup',
  'Completed',
  'Canceled',
];

interface ProductItemProps {
  product: Product;
  quantity: number,
}

const ProductItem: React.FC<ProductItemProps> = ({ product, quantity }) => (
  <View style={productItemStyles.container}>
    <Image source={{ uri: product.coverImage }} style={productItemStyles.image} />
    <View style={productItemStyles.info}>
      <View style={productItemStyles.row}>
        <Text category="s1" style={{flex: 1}}>{product.name}</Text>
        <Text status="primary" category='s1'>₱ {(product.discountedPrice * quantity).toFixed(2)}</Text>
      </View>
      <Text appearance="hint" style={{marginTop: 2}}>Quantity: {quantity}</Text>
    </View>
  </View>
);

const productItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default function OrderDetailsScreen() {
  const {getToken} = useAuth();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();

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
      let p : Array<Product> = [];

      order.productId.forEach(async (id) => {
        const productResponse = await getProductbyID(id, token ?? "");
        p.push(productResponse.data);
      })

      setProducts(p);
    } catch (error) {
      console.error("Error getting products: ", error); 
    }
  }
  
  const handleStatusUpdate = async (status : number) => {
    try {
      const token = await getToken({template: "seller_app"});

      const orderResponse = await updateOrder(token ?? "", {...order, status});
      
      console.log("Order accepted:", orderResponse.data);
      router.dismissTo("/(main)");
      showToast('success', 'Order Accepted!', `${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been updated successfully.`);
    } catch (error) {
      console.error("Error updating order: ", error);
      showToast('error', 'Uh Oh', `Something went wrong with updating the order. Please try again.`);
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

            <View style={styles.metaData}>
              <View style={styles.row}>
                <Text category="s1">Order ID </Text>
                <Text>#{Date.parse(order.createdAt.toString()).toString(36).toUpperCase()}</Text>
              </View>

              <View style={styles.row}>
                <Text category="s1">Buyer's Name</Text>
                <Text>{buyer.name}</Text>
              </View>

              <View style={styles.row}>
                <Text category="s1">Status</Text>
                <Text>{ORDER_STATUSES[order.status]}</Text>
              </View>
            </View>

            <Divider style={{ marginVertical: 8 }} />
            <Text category="s1" style={{ paddingTop: 10 }}>Items</Text>
            <List
                data={products}
                renderItem={({ item, index }) => <ProductItem product={item} quantity={order.quantity[index]} />}
                style={styles.productList}
            />
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.row}><Text category="s1">Total Price:</Text><Text category="h6" status='primary'>₱ {order.totalPrice.toFixed(2)}</Text></View>
            {/* Accept/Reject buttons if status is 0 */}
            {order.status === 0 && (
              <View style={styles.actionRow}>
                <Button status="danger" style={styles.actionButton} onPress={() => handleStatusUpdate(ORDER_STATUSES.indexOf('Canceled'))}>Reject</Button>
                <Button status="success" style={styles.actionButton} onPress={()=> handleStatusUpdate(ORDER_STATUSES.indexOf('Confirmed'))}>Accept</Button>
              </View>
            )}
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
    paddingVertical: 10
  },
  metaData: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  productList: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    marginBottom: 8,
  },
  productItem: {
    backgroundColor: 'transparent',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
}); 