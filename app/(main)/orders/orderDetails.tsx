import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Layout, Text, Divider, List, ListItem, useTheme, Spinner, Button, TopNavigation, TopNavigationAction, Icon, IconProps } from '@ui-kitten/components';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useAuth} from '@clerk/clerk-expo';
import { Order, getOrderbyID, updateOrder } from '@/utils/data/OrderController';
import { Buyer, getBuyer } from '@/utils/data/BuyerController';
import { Product, getProductbyID } from '@/utils/data/ProductController';
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

const BackIcon = (props : IconProps) => (
  <Icon {...props} name="ArrowLeft"/>
)

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

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const renderLeftActions = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()}/>
  )

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
      setLoading(true);
      const buyerResponse = await getBuyer(token ?? "", order.buyerId);
      setBuyer(buyerResponse.data);
    } catch (error) {
      console.error("Error getting buyer: ", error); 
    } finally {
      setLoading(false);
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
      setSubmitting(true);
      const token = await getToken({template: "seller_app"});

      console.log(status);
      const orderResponse = await updateOrder(token ?? "", {...order, status});
      
      console.log("Order accepted:", orderResponse.data);
      router.dismissTo("/(main)");
    
      switch (status) {
        case 1:
          showToast('success', 'Order Accepted!', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been updated successfully.`);
          break;
        case 2:
          showToast('success', 'Order Notified!', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been notified for pickup.`);
          break;
        case 3:
          showToast('success', 'Order Completed!', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been completed.`);
          break;
        case 4:
          showToast('success', 'Order Canceled', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been canceled.`);
          break;
      }
    } catch (error) {
      console.error("Error updating order: ", error);
      showToast('error', 'Uh Oh', `Something went wrong with updating the order. Please try again.`);
    } finally {
      setSubmitting(false);
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
            <TopNavigation
              title={'Order Details'}
              alignment='center'
              accessoryLeft={renderLeftActions}
            />

            <Divider/>

            <View style={styles.metaData}>
              <View style={styles.row}>
                <Text category="s1">Order ID </Text>
                {
                  !loading ?
                    <Text>#{Date.parse(order.createdAt.toString()).toString(36).toUpperCase()}</Text>
                    :
                    <Layout level="2" style={{minWidth: 100}}/>
                }
              </View>

              <View style={styles.row}>
                <Text category="s1">Buyer's Name</Text>
                {
                  !loading ?
                    <Text>{buyer.name}</Text>
                    :
                    <Layout level="2" style={{minWidth: 150}}/>
                }
              </View>

              <View style={styles.row}>
                <Text category="s1">Status</Text>
                {
                  !loading ?
                    <Text>{ORDER_STATUSES[order.status]}</Text>
                    :
                    <Layout level="2" style={{minWidth: 120}}/>
                }
              </View>
            </View>

            <Divider style={{ marginVertical: 8 }} />
            <Text category="s1" style={{ paddingTop: 10 }}>Items</Text>
            {
              !loading ?
              <List
                  data={products}
                  renderItem={({ item, index }) => <ProductItem product={item} quantity={order.quantity[index]} />}
                  style={styles.productList}
              />
              :
              <Layout style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Spinner size='large'/>
              </Layout>
            }
            
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.row}>
              <Text category="s1">Total Price:</Text>
              {
                !loading ?
                  <Text category="h6" status='primary'>₱ {order.totalPrice.toFixed(2)}</Text>
                  :
                  <Layout level="2" style={{minWidth: 90}}/>
              }
            </View>
            
            {/* Accept/Reject buttons if status is 0 */}
            {order.status === 0 && (
              <View style={styles.actionRow}>
                <Button disabled={submitting} status="danger" style={styles.actionButton} onPress={() => handleStatusUpdate(ORDER_STATUSES.indexOf('Canceled'))}>Reject</Button>
                <Button disabled={submitting} status="success" style={styles.actionButton} onPress={()=> handleStatusUpdate(ORDER_STATUSES.indexOf('Confirmed'))}>Accept</Button>
              </View>
            )}

            {order.status === 1 && (
              <View style={styles.actionRow}>
                <Button disabled={submitting} status="success" style={styles.actionButton} onPress={()=> handleStatusUpdate(ORDER_STATUSES.indexOf('Ready For Pickup'))}>Ready Order For Pickup</Button>
              </View>
            )}

            {order.status === 2 && (
              <View style={styles.actionRow}>
                <Button disabled={submitting} status="success" style={styles.actionButton} onPress={()=> handleStatusUpdate(ORDER_STATUSES.indexOf('Completed'))}>Complete Order</Button>
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