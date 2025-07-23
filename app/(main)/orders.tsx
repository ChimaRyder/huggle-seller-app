import React from "react";
import { StyleSheet } from "react-native";
import {
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
  Icon,
  IconProps,
  IconElement
} from "@ui-kitten/components";

import OrdersTabsNavigation from "./orders/OrdersTabsNavigation";
import { BellDot } from "lucide-react-native";

const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Bell" />
);

export default function OrdersScreen({unread} : {unread : number}) {
  const theme = useTheme();

  const renderRightActions = () => (
    <TopNavigationAction icon={unread > 0 ? () => <BellDot size={25} color={theme['color-primary-500']}/> : BellIcon} />
  );

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title={() => <Text category="h5">Orders</Text>}
        alignment="start"
        accessoryRight={renderRightActions}
        style={styles.topNavigation}
      />
      <OrdersTabsNavigation />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavigation: {
    marginTop: 10,
    marginHorizontal: 5,
  },
});
