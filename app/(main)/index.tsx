import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  IconElement,
  IconProps,
  Layout,
} from "@ui-kitten/components";
import ProductsScreen from "./products";
import OrdersScreen from "./orders";
import ChatsScreen from "./chats";
import ProfileScreen from "./profile";
import PromotionsScreen from "./promotions";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { getUnreadCount } from "@/utils/data/NotificationsController";

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

const ChatIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="MessageCircle"
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

import { StatusBar } from "expo-status-bar";

export default function BottomNav() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();


  const checkUnread = async () => {
    try {
      const token = await getToken({ template: "seller_app" });
      const response = await getUnreadCount(token ?? "", user?.id as string);
      console.log('🔔 Seller app received notification count response:', JSON.stringify(response));

      const count = ((response as any).data).count;
      console.log('🔔 Seller app parsed count:', count);
      setUnread(count);
    } catch (error) {
      console.error("🔔 Seller app error getting unread count: ", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      checkUnread();
    }, [])
  )

  // Poll for unread count every 10 seconds like buyer app
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, [user, getToken]);

  useEffect(() => {
    if (!user) {
      router.replace('/(login)')
    }
  }, [user]);

  return (
    <Layout level="1" style={styles.layout}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.viewPager}>
          <View style={selectedIndex === 0 ? { flex: 1 } : { display: 'none' }}>
            <ProductsScreen unread={unread} />
          </View>
          <View style={selectedIndex === 1 ? { flex: 1 } : { display: 'none' }}>
            <OrdersScreen unread={unread} />
          </View>
          <View style={selectedIndex === 2 ? { flex: 1 } : { display: 'none' }}>
            <ChatsScreen unread={unread} />
          </View>
          <View style={selectedIndex === 3 ? { flex: 1 } : { display: 'none' }}>
            <PromotionsScreen />
          </View>
          <View style={selectedIndex === 4 ? { flex: 1 } : { display: 'none' }}>
            <ProfileScreen />
          </View>
        </View>
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
            icon={ChatIcon}
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
