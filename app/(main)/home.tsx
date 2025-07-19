import React from "react";
import { StyleSheet } from "react-native";
import {
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";

import ProductsTab from "./home/products/productsTab";

// Icons for the tabs
// const BellIcon = (props: IconProps): IconElement => (
//   <Icon {...props} name="bell-outline" pack="eva" />
// );

export default function HomeScreen() {
  const theme = useTheme();

  // const renderRightActions = () => (
  //   <TopNavigationAction icon={BellIcon} />
  // );

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title={() => (
          <Text category="h5">
            Good{" "}
            <Text status="primary" category="h5">
              {new Date().getHours() < 12
                ? "morning"
                : new Date().getHours() < 18
                ? "afternoon"
                : "evening"}
              !
            </Text>
          </Text>
        )}
        alignment="start"
        // accessoryRight={renderRightActions}
        style={styles.topNavigation}
      />

      <ProductsTab theme={theme} />
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
