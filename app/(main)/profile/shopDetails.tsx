import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Layout, Text, Icon, TopNavigation, Divider, Button, Input, Select, SelectItem, Toggle, useTheme, IndexPath } from '@ui-kitten/components';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconProps, IconElement } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageUploader from '../home/products/components/ImageUploader';
import BusinessHoursPicker from '../../(seller-registration)/components/BusinessHoursPicker';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getStore, updateStore } from '@/utils/Controllers/StoreController';
import { showToast } from '@/components/Toast';

const shopCategories = ["Restaurant", "Grocery", "Market", "Store"];

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

const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

export default function ShopDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {getToken} = useAuth();
  const {user} = useUser();
  const [store, setStore] = useState(initialStore);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setStore(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = await getToken({template: "seller_app"});
      const response = await updateStore(store, token ?? "");

      showToast('success', 'Store Updated!', "Your store details have been updated.");
    } catch (error) {
      console.log("Error updating store: ", error);
      showToast('error', 'Uh Oh!', "An error occured while updating the store. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  const coverHeight = 180;
  const avatarSize = 100;

  // For Select
  const selectedCategoryIndex = store.storeCategory
    ? new IndexPath(shopCategories.indexOf(store.storeCategory))
    : undefined;

  const getStoreDetails = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getStore(user?.publicMetadata.storeId as string, token ?? "");

      setStore(response.data);
      console.log(response.data);
    } catch(error) {
      console.error('Error getting store: ', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getStoreDetails();

      return () => {
        console.log("shop details not focused");
      }
    }, [])
  )

  return (
    <Layout style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopNavigation
          title="Shop Details"
          alignment="center"
          accessoryLeft={() => (
            <View style={styles.backButton}>
              <BackIcon fill={theme['color-basic-100']} width={24} height={24} onPress={() => router.back()} />
            </View>
          )}
          style={styles.topNavigation}
        />
        <Divider />
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Cover Photo */}
          <View style={{ position: 'relative', width: '100%', height: coverHeight, marginBottom: avatarSize / 2 }}>
            <ImageUploader
              image={store.storeCoverUrl}
              onImageSelected={(uri: string) => handleChange('storeCoverUrl', uri)}
              style={{ width: '100%', height: coverHeight }}
            />
            {/* Profile Image (Avatar) overlayed */}
            <View style={{ position: 'absolute', left: Dimensions.get('window').width / 2 - avatarSize / 2, bottom: -avatarSize / 2, zIndex: 2 }}>
              <ImageUploader
                image={store.storeImageUrl}
                onImageSelected={(uri: string) => handleChange('storeImageUrl', uri)}
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderWidth: 3, borderColor: theme['background-basic-color-1'], backgroundColor: theme['background-basic-color-2'] }}
              />
            </View>
          </View>
          <View style={styles.formContainer}>
            <Input
              label="Shop Name"
              placeholder="Enter shop name"
              value={store.name}
              onChangeText={(val: string) => handleChange('name', val)}
              style={styles.input}
            />
            <Input
              label="Shop Description"
              placeholder="Enter shop description"
              value={store.storeDescription}
              onChangeText={(val: string) => handleChange('storeDescription', val)}
              multiline
              textStyle={{ minHeight: 64 }}
              style={styles.input}
            />
            <Select
              label="Shop Category"
              placeholder="Select category"
              value={store.storeCategory}
              selectedIndex={selectedCategoryIndex}
              onSelect={(index: IndexPath | IndexPath[]) => {
                const idx = Array.isArray(index) ? index[0] : index;
                handleChange('storeCategory', shopCategories[idx.row]);
              }}
              style={styles.input}
            >
              {shopCategories.map((cat, idx) => <SelectItem key={cat} title={cat} />)}
            </Select>
            {/* <Input
              label="Tags (comma separated)"
              placeholder="e.g. vegan, organic, bakery"
              value={store.tags.join(', ')}
              onChangeText={(val: string) => handleChange('tags', val.split(',').map(t => t.trim()))}
              style={styles.input}
            /> */}
            <Text category="label" style={{ marginBottom: 4, marginTop: 8 }}>Business Hours</Text>
            <BusinessHoursPicker
              value={store.businessHours}
              onChange={val => handleChange('businessHours', val)}
            />
            <Toggle
              checked={store.isClosedOverride}
              onChange={(checked: boolean) => handleChange('isClosedOverride', checked)}
              style={[styles.input, {alignSelf: "flex-start"}]}
            >
              Temporarily Close Shop
            </Toggle>
            <Input
              label="Address"
              placeholder="Enter address"
              value={store.address}
              onChangeText={(val: string) => handleChange('address', val)}
              style={styles.input}
            />
            <Input
              label="City"
              placeholder="Enter city"
              value={store.city}
              onChangeText={(val: string) => handleChange('city', val)}
              style={styles.input}
            />
            <Input
              label="Province"
              placeholder="Enter province"
              value={store.province}
              onChangeText={(val: string) => handleChange('province', val)}
              style={styles.input}
            />
            <Input
              label="Zip Code"
              placeholder="Enter zip code"
              value={store.zipCode}
              onChangeText={(val: string) => handleChange('zipCode', val)}
              style={styles.input}
            />
            {/* <Input
              label="Latitude"
              placeholder="Latitude"
              value={store.latitude.toString()}
              onChangeText={(val: string) => handleChange('latitude', parseFloat(val) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
            <Input
              label="Longitude"
              placeholder="Longitude"
              value={store.longitude.toString()}
              onChangeText={(val: string) => handleChange('longitude', parseFloat(val) || 0)}
              keyboardType="numeric"
              style={styles.input}
            /> */}
            <Button
              style={styles.saveButton}
              status="success"
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </View>
        </ScrollView>
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
  formContainer: {
    paddingHorizontal: 16,
    marginTop: 30,
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {},
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
