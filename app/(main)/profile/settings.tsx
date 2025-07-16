import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Layout, Text, Icon, TopNavigation, Divider, Menu, MenuItem, Toggle, useTheme } from '@ui-kitten/components';
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
  const theme = useTheme();
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
    <Layout style={{ flex: 1 }} level="1">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <TopNavigation
          title="Settings"
          alignment="center"
          accessoryLeft={() => (
            <View style={styles.backButton}>
              <BackIcon width={24} height={24} fill={theme['color-basic-100']} onPress={navigateBack} />
            </View>
          )}
          style={styles.topNavigation}
        />
        <Divider />
        <View style={{ flex: 1 }}>
          <Layout style={styles.sectionLayout} level="1">
            <Text category="h6" style={styles.sectionTitle}>Account Settings</Text>
            <Menu style={styles.menu}>
              <MenuItem
                title='Edit profile'
                accessoryRight={ArrowIcon}
                onPress={navigateToEditProfile}
              />
              <MenuItem
                title="Push Notifications"
                accessoryRight={() => <Toggle checked={pushNotifications} onChange={setPushNotifications} style={styles.toggle}/>}
              />
              <MenuItem
                title="Dark Mode"
                accessoryRight={() => <Toggle checked={darkMode} onChange={setDarkMode} style={styles.toggle} />}
              />
              <MenuItem
                title='Permissions'
                accessoryRight={ArrowIcon}
                onPress={navigateToPermissions}
              />
            </Menu>
          </Layout>
          <Layout style={styles.sectionLayout} level="1">
            <Text category="h6" style={styles.sectionTitle}>More</Text>
            <Menu style={styles.menu}>
              <MenuItem
                title='About us'
                accessoryRight={ArrowIcon}
                onPress={navigateToAboutUs}
              />
              <MenuItem
                title='Privacy policy'
                accessoryRight={ArrowIcon}
                onPress={navigateToPrivacyPolicy}
              />
              <MenuItem
                title='Terms and conditions'
                accessoryRight={ArrowIcon}
                onPress={navigateToTermsAndConditions}
              />
            </Menu>
          </Layout>
        </View>
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavigation: {},
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  sectionLayout: {
    gap: 10,
    padding: 15,
    paddingTop: 20,
  },
  sectionTitle: {
    paddingHorizontal: 10
  },
  menu: {
    marginHorizontal: 0,
    marginBottom: 8,
    borderRadius: 8,
  },
  toggle: {
    marginLeft: 8,
  },
});
