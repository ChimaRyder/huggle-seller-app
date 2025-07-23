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

import ProductsTab from "./home/products/productsTab";
import { useRouter } from "expo-router";
import { BellDot, BellDotIcon } from "lucide-react-native";

// Icons for the tabs
const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Bell" />
);

export default function HomeScreen({unread} : {unread : number}) {
  const theme = useTheme();
  const router = useRouter();

  const renderRightActions = () => (
    <TopNavigationAction icon={unread > 0 ? () => <BellDot size={25} color={theme['color-primary-500']}/> : BellIcon} onPress={() => router.push('/(main)/notifications/notificationsScreen')} />
  );

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
        accessoryRight={renderRightActions}
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
