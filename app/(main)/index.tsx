import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { BottomNavigation, BottomNavigationTab, Icon, IconElement, IconProps, ViewPager } from '@ui-kitten/components';
import HomeScreen from './home';
import AnalyticsScreen from './analytics';
import ChatScreen from './chats';
import ProfileScreen from './profile';

const HomeIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="shopping-bag-outline"
    pack="eva"
  />
);

const HomeFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="shopping-bag"
    pack="eva"
  />
);

const AnalyticsIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="bar-chart-outline"
    pack="eva"
  />
);

const AnalyticsFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="bar-chart"
    pack="eva"
  />
);

const ChatIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="message-square-outline"
    pack="eva"
  />
);

const ChatFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="message-square"
    pack="eva"
  />
);

const ProfileIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="person-outline"
    pack="eva"
  />
);

const ProfileFilledIcon = (props: IconProps): IconElement => (
  <Icon
    {...props}
    name="person"
    pack="eva"
  />
);

export default function BottomNav() {
  const [selectedIndex, setSelectedIndex] = useState(0);


  return (
    <SafeAreaView style={styles.container}>
      <ViewPager
        selectedIndex={selectedIndex}
        onSelect={index => setSelectedIndex(index)}
        style={styles.viewPager}
      >
        <HomeScreen />
        <AnalyticsScreen />
        <ChatScreen />
        <ProfileScreen />

      </ViewPager>
      <BottomNavigation
        selectedIndex={selectedIndex}
        onSelect={index => setSelectedIndex(index)}
        style={styles.bottomNavigation}
        appearance="noIndicator"
      >
        <BottomNavigationTab icon={selectedIndex === 0 ? HomeFilledIcon : HomeIcon} />
        <BottomNavigationTab icon={selectedIndex === 1 ? AnalyticsFilledIcon : AnalyticsIcon} />
        <BottomNavigationTab icon={selectedIndex === 2 ? ChatFilledIcon : ChatIcon} />
        <BottomNavigationTab icon={selectedIndex === 3 ? ProfileFilledIcon : ProfileIcon} />
      </BottomNavigation>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {
    paddingBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  viewPager: {
    flex: 1,
  },
});