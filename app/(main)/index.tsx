import React, { useState } from "react";
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
import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

// const HomeIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="shopping-bag-outline"
//     pack="eva"
//   />
// );

// const HomeFilledIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="shopping-bag"
//     pack="eva"
//   />
// );

// const OrdersIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="file-text-outline"
//     pack="eva"
//   />
// );

// const OrdersFilledIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="file-text"
//     pack="eva"
//   />
// );

// const AnalyticsIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="bar-chart-outline"
//     pack="eva"
//   />
// );

// const AnalyticsFilledIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="bar-chart"
//     pack="eva"
//   />
// );

// const GiftIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="gift-outline"
//     pack="eva"
//   />
// );

// const GiftFilledIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="gift"
//     pack="eva"
//   />
// );

// const ProfileIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="person-outline"
//     pack="eva"
//   />
// );

// const ProfileFilledIcon = (props: IconProps): IconElement => (
//   <Icon
//     {...props}
//     name="person"
//     pack="eva"
//   />
// );

export default function BottomNav() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user } = useUser();

  if (!user) {
    return <Redirect href="/(login)" />;
  }

  return (
    <Layout level="1" style={styles.layout}>
      <SafeAreaView style={styles.container}>
        <ViewPager
          selectedIndex={selectedIndex}
          onSelect={(index) => setSelectedIndex(index)}
          style={styles.viewPager}
          swipeEnabled={false}
        >
          <HomeScreen />
          <OrdersScreen />
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
          // icon={selectedIndex === 0 ? HomeFilledIcon : HomeIcon}
          />
          <BottomNavigationTab
          // icon={selectedIndex === 1 ? OrdersFilledIcon : OrdersIcon}
          />
          <BottomNavigationTab
          // icon={selectedIndex === 2 ? AnalyticsFilledIcon : AnalyticsIcon}
          />
          <BottomNavigationTab
          // icon={selectedIndex === 3 ? GiftFilledIcon : GiftIcon}
          />
          <BottomNavigationTab
          // icon={selectedIndex === 4 ? ProfileFilledIcon : ProfileIcon}
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
