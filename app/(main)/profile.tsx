import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Layout, Text, Icon, Button, Avatar, TopNavigation, Divider, Menu, MenuItem } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { IconProps, IconElement } from '@ui-kitten/components';

const ArrowIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="chevron-right-outline" pack="eva" />
);

export default function ProfileScreen() {
  const router = useRouter();

  const navigateToReviews = () => {
    router.push('/(main)/profile/reviewsSummary');
  };

  const navigateToSettings = () => {
    router.push('/(main)/profile/settings');
  };

  const handleSignOut = () => {
    // Handle sign out logic here
    console.log('Signing out...');
    // Navigate to login or home screen after sign out
    router.replace('/');
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.profileContainer}>
        <ImageBackground
          style={styles.profileBackground}
          source={require('../../assets/images/welcome-screen-background.jpg')}
        />
        <View style={styles.profileContent}>
          <Avatar
            source={require('../../assets/images/profile-placeholder.jpg')}
            style={styles.avatar}
            size="giant"
          />
          <Text style={styles.storeName} category="h5" status="primary">SM Supermarket - Seaside</Text>
        </View>
      </View>

      <Layout level='2' style={styles.menuContainer}>
        <Menu>
          <MenuItem
            title="Review Summary"
            accessoryRight={ArrowIcon}
            onPress={navigateToReviews}
        />
          <MenuItem
            title="Settings"
            accessoryRight={ArrowIcon}
            onPress={navigateToSettings}
          />
        </Menu>
      </Layout>

      <Button
        style={styles.signOutButton}
        status="danger"
        onPress={handleSignOut}
      >
        Sign out
      </Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    height: 200,
    position: 'relative',
  },
  profileBackground: {
    alignItems: 'center',
    flex: 1,
    height: 200,
    width: '100%',
    paddingTop: 20,
  },
  profileContent: {
    position: 'absolute',
    alignItems: 'center',
    bottom: -100,
  },
  avatar: {
    width: 125,
    height: 125,
    borderRadius: 100,
    marginBottom: 16,
  },
  storeName: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuContainer: {
    marginTop: 150,
  },
  signOutButton: { 
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 20,
  },
});
