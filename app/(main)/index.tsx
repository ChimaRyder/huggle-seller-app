import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  IconElement,
  IconProps,
  ViewPager,
  Layout,
} from "@ui-kitten/components";
import HomeScreen from "./home";
import OrdersScreen from "./orders";
import AnalyticsScreen from "./analytics";
import ProfileScreen from "./profile";
import PromotionsScreen from "./promotions";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, useFocusEffect } from "expo-router";
import { getUnreadCount } from "@/utils/Controllers/NotificationsController.";

const HomeIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="ShoppingBag"
  />
);

const HomeFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="ShoppingBag"
  />
);

const OrdersIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="ClockArrowUp"
  />
);

const OrdersFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="ClockArrowUp"
  />
);

const AnalyticsIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="ChartColumn"
  />
);

const AnalyticsFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="ChartColumn"
  />
);

const GiftIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="Gift"
  />
);

const GiftFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="Gift"
  />
);

const ProfileIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="User"
  />
);

const ProfileFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="User"
  />
);

export default function BottomNav() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [unread, setUnread] = useState(0);
  const { user } = useUser();
  const {getToken} = useAuth();

  if (!user) {
    return <Redirect href="/(login)" />;
  }

  const checkUnread = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getUnreadCount(token ?? "", user?.id);

      console.log(response.data.unreadCount);
      setUnread(response.data.unreadCount)
    } catch (error) {
      console.error("Error getting unread count: ", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      checkUnread();
    }, [])
  )

  return (
    <Layout level="1" style={styles.layout}>
      <SafeAreaView style={styles.container}>
        <ViewPager
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelectedIndex(index)}
          style={styles.viewPager}
          swipeEnabled={false}
        >
          <HomeScreen unread={unread} />
          <OrdersScreen unread={unread}/>
          <AnalyticsScreen />
          <PromotionsScreen />
          <ProfileScreen />
        </ViewPager>
        <BottomNavigation
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelectedIndex(index)}
          style={styles.bottomNavigation}
          appearance="noIndicator"
        >
          <BottomNavigationTab
          icon={selectedIndex === 0 ? HomeFilledIcon : HomeIcon}
          />
          <BottomNavigationTab
          icon={selectedIndex === 1 ? OrdersFilledIcon : OrdersIcon}
          />
          <BottomNavigationTab
          icon={selectedIndex === 2 ? AnalyticsFilledIcon : AnalyticsIcon}
          />
          <BottomNavigationTab
          icon={selectedIndex === 3 ? GiftFilledIcon : GiftIcon}
          />
          <BottomNavigationTab
          icon={selectedIndex === 4 ? ProfileFilledIcon : ProfileIcon}
          />
        </BottomNavigation>
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {
    paddingBottom: 10,
  },
  container: {
    flex: 1,
  },
  viewPager: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },
});
