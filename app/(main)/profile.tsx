import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction, Icon } from '@ui-kitten/components';
import BottomNav from '.';
import { IconProps, IconElement } from '@ui-kitten/components';

const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="bell-outline" pack="eva" />
);

export default function ProfileScreen() {
  const renderRightActions = () => (
    <TopNavigationAction icon={BellIcon} />
  );

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title={evaProps => <Text {...evaProps} category="h5">Profile</Text>}
        alignment="start"
        accessoryRight={renderRightActions}
        style={styles.topNavigation}
      />
      
      <View style={styles.content}>
        <Text category="h5">Profile Screen</Text>
        <Text category="p1">This is the Profile screen of your seller app.</Text>
      </View>
      
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  topNavigation: {
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
