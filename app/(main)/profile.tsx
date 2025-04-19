import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Layout, Text, Icon, Button, Avatar, TopNavigation, Divider } from '@ui-kitten/components';
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
      <ScrollView style={styles.scrollView}>
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
            <Text style={styles.storeName} category="h5">Rel & Frenz Store</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToReviews}>
            <Text style={styles.menuItemText} category="s1">Review Summary</Text>
            <ArrowIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
            <Text style={styles.menuItemText} category="s1">Settings</Text>
            <ArrowIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
        </View>

        <Button
          style={styles.signOutButton}
          status="danger"
          appearance="outline"
          onPress={handleSignOut}
        >
          Sign out
        </Button>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
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
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 150,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    color: '#2E7D32',
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#FFE4E1',
    borderColor: '#FF6B6B',
  },
});
