import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useClerk, useUser, useAuth } from '@clerk/clerk-expo';
import {
  User,
  ChevronRight,
  LogOut,
  Store as StoreIcon,
  TrendingUp,
  Star,
  Settings,
  DollarSign,
  HelpCircle,
  PlusCircle,
  Megaphone,
  Package,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { getMyStore, Store } from '@/utils/Controllers/StoreController';
import { getStoreStatistics, StoreStatistics } from '@/utils/storeStats';
import { sellerProfileMenuItems, quickActionItems, type SellerProfileMenuItem } from '@/data/profile/sellerMenuItems';

const getIconComponent = (iconName: string, size: number = 24, color: string = colors.primary) => {
  switch (iconName) {
    case 'trending-up': return <TrendingUp size={size} color={color} />;
    case 'star': return <Star size={size} color={color} />;
    case 'store': return <StoreIcon size={size} color={color} />;
    case 'settings': return <Settings size={size} color={color} />;
    case 'dollar-sign': return <DollarSign size={size} color={color} />;
    case 'help-circle': return <HelpCircle size={size} color={color} />;
    case 'plus-circle': return <PlusCircle size={size} color={color} />;
    case 'megaphone': return <Megaphone size={size} color={color} />;
    case 'package': return <Package size={size} color={color} />;
    default: return <User size={size} color={color} />;
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [storeDetails, setStoreDetails] = useState<Store>({} as Store);
  const [storeStats, setStoreStats] = useState<StoreStatistics>({
    productCount: 0,
    totalViews: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Only load data if not already loaded or not currently loading
      if (!dataLoaded && !loading) {
        loadStoreData();
      }
    }, [dataLoaded, loading])
  );

  const loadStoreDetails = async (token: string) => {
    try {
      const response = await getMyStore(token);
      
      // Handle the nested response structure from backend
      const storeData = response.data?.data || response.data;
      
      // Ensure business hours are properly structured
      if (storeData) {
        const normalizedStore = {
          ...storeData,
          businessHours: storeData.businessHours && Array.isArray(storeData.businessHours) 
            ? storeData.businessHours.map((hours: any) => ({
                isOpen: hours?.isOpen || false,
                openTime: hours?.openTime || '',
                closeTime: hours?.closeTime || ''
              }))
            : Array(7).fill({ isOpen: false, openTime: '', closeTime: '' })
        };
        setStoreDetails(normalizedStore);
      }
    } catch (error) {
      console.error('Error getting store: ', error);
      // Set empty store details to prevent undefined errors
      setStoreDetails({
        id: '',
        sellerId: '',
        name: 'Store',
        storeType: '',
        description: '',
        profileImageUrl: '',
        coverImageUrl: '',
        tags: [],
        businessHours: Array(7).fill({ isOpen: false, openTime: '', closeTime: '' }),
        isOpen: true,
        isVerified: false,
        address: '',
        city: '',
        province: '',
        phoneNumber: '',
        Location: undefined,
        createdAt: '',
        updatedAt: '',
      });
    }
  };

  const loadStoreStats = async (token: string) => {
    try {
      const stats = await getStoreStatistics(token);
      setStoreStats(stats);
    } catch (error) {
      console.error('Error getting store stats: ', error);
    }
  };

  const loadStoreData = async () => {
    // Prevent multiple concurrent requests
    if (loading) return;
    
    try {
      setLoading(true);
      const token = await getToken({ template: 'seller_app' });
      
      if (token) {
        // Load store details and stats in parallel
        await Promise.all([
          loadStoreDetails(token),
          loadStoreStats(token)
        ]);
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('Error loading store data: ', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setDataLoaded(false); // Reset the flag to allow refresh
    await loadStoreData();
    setRefreshing(false);
  }, []);

  const handleMenuItemPress = (screen: string) => {
    router.push(screen as any);
  };

  const handleQuickActionPress = (screen: string) => {
    router.push(screen as any);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(login)');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = (item: SellerProfileMenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item.screen)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          {getIconComponent(item.icon, 20, colors.primary)}
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          )}
        </View>
      </View>
      <ChevronRight size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );

  const renderQuickAction = (item: SellerProfileMenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.quickActionItem}
      onPress={() => handleQuickActionPress(item.screen)}
      activeOpacity={0.7}
    >
      <View style={styles.quickActionIcon}>
        {getIconComponent(item.icon, 24, colors.text.inverse)}
      </View>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
      <Text style={styles.quickActionDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Banner Image */}
          <Image
            source={
              storeDetails?.coverImageUrl
                ? { uri: storeDetails.coverImageUrl }
                : require('../../assets/images/welcome-screen-background.jpg')
            }
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay} />

          {/* Profile Content */}
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  storeDetails?.profileImageUrl
                    ? { uri: storeDetails.profileImageUrl }
                    : require('../../assets/images/profile-placeholder.jpg')
                }
                style={styles.avatar}
              />
            </View>
            <Text style={styles.storeName}>
              {storeDetails?.name || 'Your Store'}
            </Text>
            <Text style={styles.userEmail}>{user?.emailAddresses[0]?.emailAddress}</Text>
            
            {/* Store Description */}
            {storeDetails?.description && (
              <Text style={styles.storeDescription}>{storeDetails.description}</Text>
            )}
            
            {/* Store Type and Verification Badge */}
            <View style={styles.storeBadges}>
              {storeDetails?.storeType && (
                <View style={styles.storeTypeBadge}>
                  <Text style={styles.storeTypeText}>{storeDetails.storeType}</Text>
                </View>
              )}
              {storeDetails?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
              <View style={[styles.statusBadge, storeDetails?.isOpen ? styles.openBadge : styles.closedBadge]}>
                <Text style={[styles.statusText, storeDetails?.isOpen ? styles.openText : styles.closedText]}>
                  {storeDetails?.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
            
            <View style={styles.storeStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {storeStats.averageRating > 0 ? storeStats.averageRating.toFixed(1) : '--'}
                </Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {storeStats.productCount.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {storeStats.totalReviews > 999 
                    ? `${(storeStats.totalReviews / 1000).toFixed(1)}k` 
                    : storeStats.totalReviews.toString()
                  }
                </Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActionItems.map(renderQuickAction)}
          </View>
        </View>


        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Your Business</Text>
          <View style={styles.menuContainer}>
            {sellerProfileMenuItems.map(renderMenuItem)}
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color={colors.text.inverse} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    position: 'relative',
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background.secondary,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  profileContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    marginTop: -50,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.lg,
    marginTop: -50,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  storeName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  storeDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  storeBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  storeTypeBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  storeTypeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  verifiedBadge: {
    backgroundColor: colors.success + '20',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  verifiedText: {
    fontSize: typography.fontSizes.sm,
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
  },
  statusBadge: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  openBadge: {
    backgroundColor: colors.success + '20',
  },
  closedBadge: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  openText: {
    color: colors.success,
  },
  closedText: {
    color: colors.error,
  },
  storeStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Sections
  section: {
    backgroundColor: colors.background.primary,
    marginTop: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  quickActionItem: {
    width: '31%',
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quickActionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  quickActionDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Menu Items
  menuContainer: {
    paddingBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  menuItemDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Bottom Section
  bottomContainer: {
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },

});
