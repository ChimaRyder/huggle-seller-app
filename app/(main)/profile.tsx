import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, ImageBackground, ImageProps } from 'react-native';
import { Layout, Text, Icon, Button, Avatar, TopNavigation, Divider, Menu, MenuItem, Spinner } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { IconProps, IconElement } from '@ui-kitten/components';
import { useClerk, useUser, useAuth } from '@clerk/clerk-expo'; 
import { Redirect } from "expo-router";
import axios from 'axios';

const ArrowIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="chevron-right-outline" pack="eva" />
);

const spinnerIcon = (props: ImageProps) => (
  <View style={[props.style, styles.spinnerContainer]}>
    <Spinner size="small" status="control"/>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const {signOut} = useClerk();
  const [loading, setLoading] = useState(false);
  const {user} = useUser();
  const {getToken} = useAuth();
  const [profileDetails, setUser] = useState({});

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(`https://huggle-backend-jh2l.onrender.com/api/sellers/get/${user?.id}`, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          }
        });
        setUser(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      } 
    }; 
    getUser();
  }, []);

  const navigateToReviews = () => {
    router.push('/(main)/profile/reviewsSummary');
  };

  const navigateToSettings = () => {
    router.push('/(main)/profile/settings');
  };

  const handleSignOut = async () => {
    // Handle sign out logic here
    setLoading(true);
    console.log('Signing out...');
    try {
      await signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
    // Navigate to login or home screen after sign out

    router.replace("/");

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
        accessoryLeft={loading ? spinnerIcon : undefined}
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
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
