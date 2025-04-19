import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Layout, Text, Icon, TopNavigation, Divider } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { IconProps, IconElement } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';

const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

const ArrowIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="chevron-right-outline" pack="eva" />
);

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const navigateBack = () => {
    router.back();
  };

  const navigateToEditProfile = () => {
    router.push('/(main)/profile/shopDetails');
  };

  const navigateToPermissions = () => {
    // Navigate to permissions screen
    console.log('Navigate to permissions');
  };

  const navigateToAboutUs = () => {
    // Navigate to about us screen
    console.log('Navigate to about us');
  };

  const navigateToPrivacyPolicy = () => {
    // Navigate to privacy policy screen
    console.log('Navigate to privacy policy');
  };

  const navigateToTermsAndConditions = () => {
    // Navigate to terms and conditions screen
    console.log('Navigate to terms and conditions');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavigation
        title="SETTINGS"
        alignment="center"
        accessoryLeft={() => (
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <BackIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
        )}
        style={styles.topNavigation}
      />
      <Divider />

      <ScrollView style={styles.scrollView}>
        <View style={styles.sectionContainer}>
          <Text category="h6" style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToEditProfile}>
            <Text category="s1">Edit profile</Text>
            <ArrowIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
          
          <View style={styles.menuItem}>
            <Text category="s1">Push notifications</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#D3D3D3', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.menuItem}>
            <Text category="s1">Dark mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#D3D3D3', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToPermissions}>
            <Text category="s1">Permissions</Text>
            <ArrowIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text category="h6" style={styles.sectionTitle}>More</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToAboutUs}>
            <Text category="s1">About us</Text>
            <ArrowIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToPrivacyPolicy}>
            <Text category="s1">Privacy policy</Text>
            <ArrowIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToTermsAndConditions}>
            <Text category="s1">Terms and conditions</Text>
            <ArrowIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    marginVertical: 12,
    fontWeight: '400',
    color: '#888',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
