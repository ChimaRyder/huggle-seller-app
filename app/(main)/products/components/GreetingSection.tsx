import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Bell, Plus } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface GreetingSectionProps {
  unread?: number;
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

const GreetingSection: React.FC<GreetingSectionProps> = ({ unread = 0 }) => {
  const { user } = useUser();
  const router = useRouter();

  const getUserName = () => {
    return user?.firstName || user?.fullName || "there";
  };

  const timeOfDay = getTimeOfDay();
  const greetingText = `Good ${timeOfDay}, ${getUserName()}!`;
  const parts = greetingText.split(timeOfDay);

  const NotificationBell = ({ unreadCount }: { unreadCount: number }) => (
    <TouchableOpacity
      onPress={() => router.push('/(main)/notifications/notificationsScreen')}
      style={styles.notificationContainer}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIconContainer}>
        <Bell size={24} color={unreadCount > 0 ? colors.success : colors.icon.primary} />
      </View>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const AddProductButton = () => (
    <TouchableOpacity
      onPress={() => router.push('/(main)/products/createProduct')}
      style={styles.addButton}
      activeOpacity={0.7}
    >
      <Plus size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Greeting and Actions */}
      <View style={styles.headerRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.headerGreetingText}>
            {parts[0]}
            <Text style={styles.headerTimeOfDayText}>{timeOfDay}</Text>
            {parts[1]}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <AddProductButton />
          <NotificationBell unreadCount={unread} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
    marginBottom: spacing.lg,
  },
  headerRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  greetingContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.background.successSubtle,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContainer: {
    position: "relative",
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 3,
  },
  headerGreetingText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  headerTimeOfDayText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
});

export default GreetingSection;