import React from "react";
import { StyleSheet } from "react-native";
import {
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";

import OrdersTabsNavigation from "./orders/OrdersTabsNavigation";

// const BellIcon = (props: IconProps): IconElement => (
//   <Icon {...props} name="bell-outline" pack="eva" />
// );

export default function OrdersScreen() {
  const theme = useTheme();

  // const renderRightActions = () => (
  //   <TopNavigationAction icon={BellIcon} />
  // );

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title={() => <Text category="h5">Orders</Text>}
        alignment="start"
        // accessoryRight={renderRightActions}
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
