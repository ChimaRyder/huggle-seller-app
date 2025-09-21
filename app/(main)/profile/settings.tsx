import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, MapPin, Moon, Store, Shield, FileText, Info, ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

const SettingsScreen = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const navigateToEditStore = () => {
    router.push('/(main)/profile/shopDetails');
  };

  const navigateToVerification = () => {
    router.push('/(main)/profile/storeVerification/');
  };

  const handlePrivacyPolicy = () => {
    // Navigate to privacy policy screen
    console.log('Navigate to privacy policy');
  };

  const handleTermsOfService = () => {
    // Navigate to terms and conditions screen
    console.log('Navigate to terms and conditions');
  };

  const handleAboutUs = () => {
    // Navigate to about us screen
    console.log('Navigate to about us');
  };

  const accountItems = [
    {
      id: 'editStore',
      title: 'Edit Store',
      subtitle: 'Update your store information and settings',
      type: 'navigate',
      icon: Store,
      onPress: navigateToEditStore,
    },
    {
      id: 'verification',
      title: 'Store Verification',
      subtitle: 'Verify your store for enhanced credibility',
      type: 'navigate',
      icon: Shield,
      onPress: navigateToVerification,
    },
  ];

  const preferencesItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive order updates and customer messages',
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
      icon: Bell,
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Help customers find your store location',
      type: 'toggle',
      value: locationEnabled,
      onToggle: setLocationEnabled,
      icon: MapPin,
    },
    {
      id: 'darkmode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme throughout the app',
      type: 'toggle',
      value: darkModeEnabled,
      onToggle: setDarkModeEnabled,
      icon: Moon,
    },
  ];

  const aboutItems = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      onPress: handlePrivacyPolicy,
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      onPress: handleTermsOfService,
    },
    {
      id: 'about',
      title: 'About Huggle',
      icon: Info,
      onPress: handleAboutUs,
    },
  ];

  const renderSettingItem = (item: any) => {
    const IconComponent = item.icon;

    if (item.type === 'toggle') {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <IconComponent size={20} color={colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: colors.border.secondary,
              true: colors.primary,
            }}
            thumbColor={colors.background.primary}
          />
        </View>
      );
    }

    // Navigate type items
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
      >
        <View style={styles.settingItemLeft}>
          <View style={styles.iconContainer}>
            <IconComponent size={20} color={colors.primary} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  const renderSimpleItem = (item: any) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
      >
        <View style={styles.settingItemLeft}>
          <View style={styles.iconContainer}>
            <IconComponent size={20} color={colors.primary} />
          </View>
          <Text style={styles.settingTitle}>{item.title}</Text>
        </View>
        <ChevronRight size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {accountItems.map(renderSettingItem)}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {preferencesItems.map(renderSettingItem)}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {aboutItems.map(renderSimpleItem)}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Huggle Seller App v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 24, // Same width as icons for centering
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.tight * typography.fontSizes.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  versionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
});

export default SettingsScreen;