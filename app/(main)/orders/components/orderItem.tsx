import {useEffect, useState} from "react";
import { Card, Text, useTheme, ThemeType, Icon, IconProps } from '@ui-kitten/components';
import { StyleSheet, View, Appearance, TouchableOpacity } from 'react-native';
import {Buyer, getBuyer} from "@/utils/Controllers/BuyerController";
import {useAuth} from "@clerk/clerk-expo"


interface OrderItemProps {
  item: any;
  theme: ThemeType;
  onPress?: () => void;
}

const UserIcon = (props : IconProps) => (
  <Icon {...props} name='person-outline' pack='eva' ></Icon>
)

const OrderItem = ({ item, theme, onPress }: OrderItemProps) => {
  const colorScheme = Appearance.getColorScheme();
  const [buyer, setBuyer] = useState<Buyer>({} as Buyer);
  const {getToken} = useAuth();

  const getUser = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getBuyer(token ?? "", item.buyerId);

      setBuyer(response.data);
    } catch (error) {
      console.error("Error getting buyer:", error);
    }
  }

  useEffect(() => {
    getUser();
  })

  return (
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
              <UserIcon width="18" height="18" fill={theme['color-basic-600']}/>
              <Text category="s2" style={[styles.buyerName, {color: theme['color-basic-600']}]}>{buyer?.name}</Text>
            </View>
          </View>
          <Text category="h6" style={[styles.price, {color: theme['color-primary-500']}]}>₱ {item.totalPrice.toFixed(2)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
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