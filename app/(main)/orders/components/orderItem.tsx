import {useEffect, useState} from "react";
import { Card, Text, useTheme, ThemeType, Icon, IconProps, IconElement, Layout } from '@ui-kitten/components';
import { StyleSheet, View, Appearance, TouchableOpacity } from 'react-native';
import {Buyer, getBuyer} from "@/utils/data/BuyerController";
import {useAuth} from "@clerk/clerk-expo"


interface OrderItemProps {
  item: any;
  theme: ThemeType;
  onPress?: () => void;
}

const UserIcon = (props : IconProps) : IconElement => (
  <Icon {...props} name='User' />
)

const OrderItem = ({ item, theme, onPress }: OrderItemProps) => {
  const colorScheme = Appearance.getColorScheme();
  const [loading, setLoading] = useState(false);
  const [buyer, setBuyer] = useState<Buyer>({} as Buyer);
  const {getToken} = useAuth();


  const getUser = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getBuyer(token ?? "", item.buyerId);

      setBuyer(((response as any).data));
    } catch (error) {
      console.error("Error getting buyer:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUser();
  }, [item]);

  return ( !loading ? 
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={[styles.orderCard, { backgroundColor: colorScheme === 'dark' ? theme['color-basic-900'] : theme['color-basic-200'] }]}
        disabled={true}
      >
        <View style={styles.orderHeader}>
          <Text category="c1" appearance="hint">{new Date(item.createdAt).toLocaleString(
            'en-PH',
            {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              hour12: true,
              minute: "2-digit",
            }
          )}</Text>
        </View>
        <View style={styles.orderInfoRow}>
          <View style={styles.orderInfoCol}>
            <Text category="h6" style={styles.orderId}>Order #{Date.parse(item.createdAt).toString(36).toUpperCase()}</Text>
            <View style={styles.orderMetaRow}>
              <UserIcon style={{height: 18, tintColor: theme['color-basic-600']}}/>
              <Text category="s2" style={[styles.buyerName, {color: theme['color-basic-600']}]}>{buyer?.name}</Text>
            </View>
          </View>
          <Text category="h6" style={[styles.price, {color: theme['color-primary-500']}]}>₱ {item.totalPrice.toFixed(2)}</Text>
        </View>
      </Card>
      
    </TouchableOpacity>
    :
    <Card style={[styles.orderCard, { backgroundColor: colorScheme === 'dark' ? theme['color-basic-900'] : theme['color-basic-200'] }]}
        disabled={true}
      >
        <View style={styles.orderHeader}>
          <Layout level="3" style={{minHeight: 16, maxWidth: 125 }}></Layout>
        </View>
        <View style={styles.orderInfoRow}>
          <View style={styles.orderInfoCol}>
            <Layout level="3" style={{minHeight: 24, maxWidth: 160}}></Layout>
            <View style={styles.orderMetaRow}>
              <Layout level="3" style={{minHeight: 20, minWidth: 20, borderRadius: 20}}></Layout>
              <Layout level="3" style={{minHeight: 16, minWidth: 150 }}></Layout>
            </View>
          </View>
          <Layout level="3" style={{minHeight: 25, minWidth: 80 }}></Layout>
        </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  orderHeader: {
    marginBottom: 8,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderInfoCol: {
    flexDirection: 'column',
  },
  orderId: {
    fontWeight: 'bold',
  },
  buyerName: {
    marginTop: 2,
  },
  price: {
    fontWeight: 'bold',
  },
  orderMetaRow: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    paddingTop: 5,
  },
});

export default OrderItem;