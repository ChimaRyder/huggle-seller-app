import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Store,
  Camera,
  MapPin,
  Clock,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { getStore, updateStore } from '@/utils/data/StoreController';
import { showToast } from '@/components/Toast';
import BusinessHoursPicker from '../../(seller-registration)/components/BusinessHoursPicker';
import * as ImagePicker from 'expo-image-picker';

const shopCategories = ["Restaurant", "Grocery", "Market", "Store"];

const IMAGE_SIZE = 120;

const initialStore = {
  id: '',
  sellerId: '',
  name: '',
  storeDescription: '',
  storeImageUrl: '',
  storeCoverUrl: '',
  storeCategory: '',
  tags: [],
  businessHours: Array(7).fill({ isOpen: false, openTime: '', closeTime: '' }),
  isClosedOverride: false,
  address: '',
  city: '',
  province: '',
  zipCode: '',
  latitude: 0,
  longitude: 0,
};

export default function ShopDetailsScreen() {
  const router = useRouter();
  const {getToken} = useAuth();
  const {user} = useUser();
  const [store, setStore] = useState(initialStore);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: any) => {
    setStore(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const navigateBack = () => {
    router.back();
  };

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleChange('storeCoverUrl', result.assets[0].uri);
    }
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleChange('storeImageUrl', result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!store.name.trim()) {
      newErrors.name = 'Shop name is required';
    }

    if (!store.storeDescription.trim()) {
      newErrors.storeDescription = 'Shop description is required';
    } else if (store.storeDescription.length < 20) {
      newErrors.storeDescription = 'Description must be at least 20 characters';
    }

    if (!store.storeCategory) {
      newErrors.storeCategory = 'Please select a category';
    }

    if (!store.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!store.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!store.province.trim()) {
      newErrors.province = 'Province is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const token = await getToken({template: "seller_app"});
      await updateStore(store, token ?? "");

      showToast('success', 'Store Updated!', "Your store details have been updated.");
      router.back();
    } catch (error) {
      console.log("Error updating store: ", error);
      showToast('error', 'Uh Oh!', "An error occured while updating the store. Please try again later.");
    } finally {
      setSaving(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      const loadStoreDetails = async () => {
        try {
          const token = await getToken({template: "seller_app"});
          const response = await getStore(user?.publicMetadata.storeId as string, token ?? "");

          const storeData = (response as any).data;
          setStore(storeData);
        } catch(error) {
          console.error('Error getting store: ', error);
        }
      };

      loadStoreDetails();

      return () => {
        console.log("shop details not focused");
      }
    }, [getToken, user?.publicMetadata.storeId])
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Shop Details</Text>
          <Text style={styles.headerSubtitle}>Edit your store information</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveHeaderButton, (!store.name.trim() || !store.storeDescription.trim()) && styles.saveHeaderButtonDisabled]}
          onPress={handleSave}
          disabled={!store.name.trim() || !store.storeDescription.trim() || saving}
        >
          {saving ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <Check size={20} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Store Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ImageIcon size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Store Images</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Add attractive images to showcase your store
          </Text>

          {/* Cover Image */}
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Cover Photo</Text>
            <TouchableOpacity style={styles.coverImageContainer} onPress={pickCoverImage}>
              {store.storeCoverUrl ? (
                <>
                  <Image source={{ uri: store.storeCoverUrl }} style={styles.coverImage} />
                  <View style={styles.imageOverlay}>
                    <Camera size={20} color={colors.text.inverse} />
                    <Text style={styles.overlayText}>Change Cover</Text>
                  </View>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Camera size={32} color={colors.primary} />
                  <Text style={styles.placeholderText}>Add Cover Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile Image */}
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Profile Photo</Text>
            <TouchableOpacity style={styles.profileImageContainer} onPress={pickProfileImage}>
              {store.storeImageUrl ? (
                <>
                  <Image source={{ uri: store.storeImageUrl }} style={styles.profileImage} />
                  <View style={styles.profileImageOverlay}>
                    <Camera size={16} color={colors.text.inverse} />
                  </View>
                </>
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Camera size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Store size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shop Name *</Text>
            {errors.name && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.name}</Text>
              </View>
            )}
            <TextInput
              style={[styles.textInput, errors.name && { borderColor: colors.error }]}
              placeholder="Enter your shop name"
              placeholderTextColor={colors.text.tertiary}
              value={store.name}
              onChangeText={(val: string) => handleChange('name', val)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shop Description *</Text>
            <Text style={styles.characterCount}>{store.storeDescription.length}/300</Text>
            {errors.storeDescription && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.storeDescription}</Text>
              </View>
            )}
            <TextInput
              style={[styles.textAreaInput, errors.storeDescription && { borderColor: colors.error }]}
              multiline
              placeholder="Describe your shop, what you sell, and what makes you special..."
              placeholderTextColor={colors.text.tertiary}
              value={store.storeDescription}
              onChangeText={(val: string) => handleChange('storeDescription', val)}
              maxLength={300}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shop Category *</Text>
            {errors.storeCategory && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.storeCategory}</Text>
              </View>
            )}
            <View style={styles.categoryGrid}>
              {shopCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    store.storeCategory === category && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => handleChange('storeCategory', category)}
                >
                  <Text style={[
                    styles.categoryText,
                    store.storeCategory === category && { color: colors.primary, fontWeight: typography.fontWeights.semibold }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Business Hours Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Business Hours</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Set your operating hours to help customers know when you&apos;re open
          </Text>

          <BusinessHoursPicker
            value={store.businessHours}
            onChange={val => handleChange('businessHours', val)}
          />

          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Temporarily Close Shop</Text>
              <Text style={styles.toggleDescription}>Override business hours and close temporarily</Text>
            </View>
            <Switch
              value={store.isClosedOverride}
              onValueChange={(checked: boolean) => handleChange('isClosedOverride', checked)}
              trackColor={{
                false: colors.border.secondary,
                true: colors.primary,
              }}
              thumbColor={colors.background.primary}
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Help customers find your physical store location
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address *</Text>
            {errors.address && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.address}</Text>
              </View>
            )}
            <TextInput
              style={[styles.textInput, errors.address && { borderColor: colors.error }]}
              placeholder="Street address"
              placeholderTextColor={colors.text.tertiary}
              value={store.address}
              onChangeText={(val: string) => handleChange('address', val)}
            />
          </View>

          <View style={styles.locationRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.md }]}>
              <Text style={styles.inputLabel}>City *</Text>
              {errors.city && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errors.city}</Text>
                </View>
              )}
              <TextInput
                style={[styles.textInput, errors.city && { borderColor: colors.error }]}
                placeholder="City"
                placeholderTextColor={colors.text.tertiary}
                value={store.city}
                onChangeText={(val: string) => handleChange('city', val)}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Province *</Text>
              {errors.province && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errors.province}</Text>
                </View>
              )}
              <TextInput
                style={[styles.textInput, errors.province && { borderColor: colors.error }]}
                placeholder="Province"
                placeholderTextColor={colors.text.tertiary}
                value={store.province}
                onChangeText={(val: string) => handleChange('province', val)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Zip Code</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Postal/Zip code"
              placeholderTextColor={colors.text.tertiary}
              value={store.zipCode}
              onChangeText={(val: string) => handleChange('zipCode', val)}
            />
          </View>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  saveHeaderButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHeaderButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.inverse,
    borderTopColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },

  // Sections
  section: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },

  // Images
  imageSection: {
    marginBottom: spacing.lg,
  },
  imageLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  coverImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginTop: spacing.xs,
  },
  profileImageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radii.lg,
  },
  placeholderText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  profilePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },

  // Form inputs
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  characterCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    minHeight: 50,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    minHeight: 100,
    lineHeight: 22,
  },

  // Category selection
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Toggle switch
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },

  // Location inputs
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});