import React, { useCallback, useEffect, useState } from "react";
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
import ProductsScreen from "./products";
import OrdersScreen from "./orders";
import AnalyticsScreen from "./analytics";
import ProfileScreen from "./profile";
import PromotionsScreen from "./promotions";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { getUnreadCount } from "@/utils/Controllers/NotificationsController.";

const HomeIcon = (props: IconProps): IconElement => (
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

const AnalyticsIcon = (props: IconProps): IconElement => (
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

const ProfileIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="User"
  />
);

export default function BottomNav() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const { user } = useUser();
  const {getToken} = useAuth();


  const checkUnread = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getUnreadCount(token ?? "", user?.id as string);

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

  useEffect(() => {
    if (!user) {
      router.replace('/(login)')
    }
  }, [user]);

  return (
    <Layout level="1" style={styles.layout}>
      <SafeAreaView style={styles.container}>
        <ViewPager
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelectedIndex(index)}
          style={styles.viewPager}
          swipeEnabled={false}
        >
          <ProductsScreen unread={unread} />
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
          icon={HomeIcon}
          />
          <BottomNavigationTab
          icon={OrdersIcon}
          />
          <BottomNavigationTab
          icon={AnalyticsIcon}
          />
          <BottomNavigationTab
          icon={GiftIcon}
          />
          <BottomNavigationTab
          icon={ProfileIcon}
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
