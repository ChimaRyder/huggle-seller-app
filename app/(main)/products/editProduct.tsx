import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Camera,
  X,
  Hash,
  Type,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader,
  Package,
  Calendar,
  BarChart3,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Plus,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { getProductbyID, updateProduct, getAllProducts } from '@/utils/Controllers/ProductController';
import { getBundleById, updateBundle } from '@/utils/Controllers/BundleController';
import { FullProduct } from '@/types/product';
import { SellerBundleDto, BundleUpdateRequestDto, SelectableProduct } from '@/types/bundle';
import { showToast } from '@/components/Toast';
import * as ImagePicker from 'expo-image-picker';
import { useImageUpload } from '@/hooks/useImageUpload';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - spacing.lg * 3) / 2;

// Product Types
const productTypes = ["Food", "Electronics", "Clothing", "Home Appliances", "Books", "Health & Beauty", "Sports & Outdoors", "Toys & Games", "Pets", "Automotives", "Baby Products", "Office Supplies", "Arts & Crafts"];


interface Metadata {
  storeId: string;
  id: string;
  createdAt: string;
  isActive: boolean;
}

// Edit Product Screen
const EditProduct = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const { productId } = useLocalSearchParams();
  // Common state
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [bundle, setBundle] = useState<SellerBundleDto | null>(null);
  const [isBundle, setIsBundle] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [stock, setStock] = useState('');
  const [duration, setDuration] = useState(new Date());
  const [category, setCategory] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [metadata, setMetadata] = useState<Metadata>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Bundle-specific state
  const [availableProducts, setAvailableProducts] = useState<SelectableProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectableProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = useState(false);
  const [productCost, setProductCost] = useState('');
  const [dynamicPricingStartDays, setDynamicPricingStartDays] = useState('14');
  const [isDynamicPricingExpanded, setIsDynamicPricingExpanded] = useState(false);

  // Image upload hook
  const { uploadState, uploadImageUri } = useImageUpload();

  // Load seller's products for bundle editing
  const loadSellerProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const token = await getToken({ template: "seller_app" });
      if (!token) return;

      const response = await getAllProducts('', token);
      const products: SelectableProduct[] = response.data.map((product: any) => {
        const isCurrentlySelected = selectedProducts.some(sp => sp.id === product.id);
        return {
          id: product.id,
          name: product.name,
          price: product.discountedPrice || product.price,
          originalPrice: product.originalPrice,
          stock: product.stock,
          coverImage: product.coverImage,
          isSelected: isCurrentlySelected,
          productType: product.productType,
          expiresOn: product.expiresOn ? new Date(product.expiresOn) : undefined,
        };
      });

      setAvailableProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('error', 'Error', 'Failed to load products for bundle editing');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setAvailableProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, isSelected: !product.isSelected }
          : product
      )
    );

    setSelectedProducts(prev => {
      const isCurrentlySelected = prev.some(p => p.id === productId);
      if (isCurrentlySelected) {
        return prev.filter(p => p.id !== productId);
      } else {
        const productToAdd = availableProducts.find(p => p.id === productId);
        return productToAdd ? [...prev, { ...productToAdd, isSelected: true }] : prev;
      }
    });
  };

  const getProduct = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const token = await getToken({ template: "seller_app" });

      // First try to load as a product
      try {
        const response = await getProductbyID(productId as string, token ?? "");
        const data = ((response as any).data);

        if (data) {
          setProduct(data);
          setIsBundle(false);
          setName(data.name || '');
          setDescription(data.description || '');
          setProductType(data.productType || '');
          setCoverImage(data.coverImage || '');
          setAdditionalImages(data.additionalImages || []);
          setOriginalPrice(data.originalPrice ? data.originalPrice.toString() : '');
          setDiscountedPrice(data.discountedPrice ? data.discountedPrice.toString() : '');
          setStock(data.stock ? data.stock.toString() : '');
          setDuration(new Date(data.expirationDate));
          setCategory(data.category || []);
          setMetadata(data);
          setIsActive(data.isActive);
          setIsDynamicPricingEnabled(data.isDynamicPricingEnabled || false);
          setProductCost(data.productCost ? data.productCost.toString() : '');
          setDynamicPricingStartDays(data.dynamicPricingStartDays?.toString() || '14');
          console.log('✅ Successfully loaded as product');
        }
      } catch (productError) {
        console.log('❌ Failed to load as product, trying as bundle...', productError);

        // If product fetch fails, try as a bundle
        try {
          const bundleResponse = await getBundleById(productId as string, token ?? "");
          const bundleData = ((bundleResponse as any).data);

          if (bundleData) {
            setBundle(bundleData);
            setIsBundle(true);
            setName(bundleData.name || '');
            setDescription(bundleData.description || '');
            setCoverImage(bundleData.imageUrl || '');
            setAdditionalImages(bundleData.images || []);
            setOriginalPrice(bundleData.originalPrice ? bundleData.originalPrice.toString() : '');
            setDiscountedPrice(bundleData.price ? bundleData.price.toString() : '');
            setStock(bundleData.stock ? bundleData.stock.toString() : '');
            setDuration(new Date(bundleData.expiresOn));
            setIsActive(bundleData.isActive);
            setIsDynamicPricingEnabled(bundleData.isDynamicPricingEnabled || false);
            setDynamicPricingStartDays(bundleData.dynamicPricingStartDays?.toString() || '14');

            // Load available products for bundle editing
            await loadSellerProducts();

            // Set selected products based on bundle data
            if (bundleData.products) {
              const selectedProductsData: SelectableProduct[] = bundleData.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice,
                stock: p.stock,
                coverImage: p.image && p.image.length > 0 ? p.image[0] : '',
                isSelected: true,
                productType: p.productType || '',
                expiresOn: p.expiresOn ? new Date(p.expiresOn) : undefined,
              }));
              setSelectedProducts(selectedProductsData);
            }

            console.log('✅ Successfully loaded as bundle');
          } else {
            Alert.alert('Error', 'Bundle not found.');
            router.back();
          }
        } catch (bundleError) {
          console.error('❌ Failed to load as both product and bundle:', bundleError);
          Alert.alert('Error', 'Failed to load item details.');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error fetching product/bundle:', error);
      Alert.alert('Error', 'Failed to load item details.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const navigateBack = () => {
    if (name.trim() || description.trim() || coverImage || additionalImages.length > 0) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const pickImage = async () => {
    if (additionalImages.length >= 3) {
      Alert.alert('Limit Reached', 'You can add up to 3 additional images.');
      return;
    }

    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant photo library permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Upload to Firebase Storage
        const downloadURL = await uploadImageUri(imageUri, 'products/additional');

        if (downloadURL) {
          setAdditionalImages(prev => [...prev, downloadURL]);
        }
      }
    } catch (error) {
      console.error('❌ [EditProduct] Additional image upload failed:', error);
      showToast('error', 'Upload Failed', 'Failed to upload additional image. Please try again.');
    }
  };

  const pickCoverImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant photo library permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Upload to Firebase Storage
        const downloadURL = await uploadImageUri(imageUri, 'products/covers');

        if (downloadURL) {
          setCoverImage(downloadURL);
        }
      }
    } catch (error) {
      console.error('❌ [EditProduct] Cover image upload failed:', error);
      showToast('error', 'Upload Failed', 'Failed to upload cover image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    const cat = currentCategory.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cat && !category.includes(cat) && category.length < 10) {
      setCategory(prev => [...prev, cat]);
      setCurrentCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategory(prev => prev.filter(cat => cat !== categoryToRemove));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = `${isBundle ? 'Bundle' : 'Product'} name is required`;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Product type is only required for products, not bundles
    if (!isBundle && !productType) {
      newErrors.productType = 'Product type is required';
    }

    if (!coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }

    if (!originalPrice || parseFloat(originalPrice) <= 0) {
      newErrors.originalPrice = 'Valid original price is required';
    }

    if (!discountedPrice || parseFloat(discountedPrice) <= 0) {
      newErrors.discountedPrice = 'Valid discounted price is required';
    }

    if (parseFloat(originalPrice) <= parseFloat(discountedPrice)) {
      newErrors.originalPrice = 'Original price must be greater than discounted price';
    }

    if (!stock || parseInt(stock) <= 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    // Dynamic pricing validation for products
    if (!isBundle && isDynamicPricingEnabled) {
      if (!productCost || parseFloat(productCost) <= 0) {
        newErrors.productCost = 'Valid product cost is required for dynamic pricing';
      } else if (parseFloat(productCost) >= parseFloat(discountedPrice)) {
        newErrors.productCost = 'Product cost must be less than the current price';
      }

      if (!dynamicPricingStartDays || parseInt(dynamicPricingStartDays) <= 0) {
        newErrors.dynamicPricingStartDays = 'Valid start days is required';
      }
    }

    // Bundle-specific validation
    if (isBundle) {
      if (selectedProducts.length < 2) {
        newErrors.selectedProducts = 'Please select at least 2 products for the bundle';
      }

      if (isDynamicPricingEnabled) {
        if (!productCost || parseFloat(productCost) <= 0) {
          newErrors.productCost = 'Valid product cost is required for dynamic pricing';
        }

        if (parseFloat(discountedPrice) <= parseFloat(productCost)) {
          newErrors.productCost = 'Product cost must be less than current price';
        }

        if (!dynamicPricingStartDays || parseInt(dynamicPricingStartDays) <= 0) {
          newErrors.dynamicPricingStartDays = 'Valid number of days is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || (!product && !bundle)) return;

    setIsSubmitting(true);

    try {
      const token = await getToken({ template: "seller_app" });

      if (isBundle && bundle) {
        // Update bundle
        const bundleUpdateData: BundleUpdateRequestDto = {
          name: name.trim(),
          description: description.trim(),
          productIds: selectedProducts.map(p => p.id),
          images: additionalImages,
          stock: parseInt(stock),
          imageUrl: coverImage,
          price: parseFloat(discountedPrice),
          originalPrice: parseFloat(originalPrice),
          expiresOn: duration,
          isActive: isActive,
          isDynamicPricingEnabled: isDynamicPricingEnabled,
          dynamicPricingStartDays: isDynamicPricingEnabled ? parseInt(dynamicPricingStartDays) : undefined,
        };

        await updateBundle(bundle.id, bundleUpdateData, token ?? "");
        showToast('success', 'Bundle Updated!', 'Your bundle has been updated successfully.');
      } else if (!isBundle && product) {
        // Update product
        const productData: FullProduct = {
          id: product.id,
          name: name.trim(),
          description: description.trim(),
          productType: productType,
          coverImage: coverImage,
          additionalImages: additionalImages,
          discountedPrice: parseFloat(discountedPrice),
          originalPrice: parseFloat(originalPrice),
          expirationDate: duration.toISOString(),
          stock: parseInt(stock),
          category: category,
          storeId: product.storeId,
          isActive: isActive,
          createdAt: product.createdAt,
          updatedAt: new Date().toISOString(),
          rating: product.rating || 0,
          ratingCount: product.ratingCount || 0,
          isDynamicPricingEnabled: isDynamicPricingEnabled,
          productCost: isDynamicPricingEnabled ? parseFloat(productCost) : parseFloat(originalPrice) * 0.7,
          dynamicPricingStartDays: isDynamicPricingEnabled ? parseInt(dynamicPricingStartDays) : 14,
        };

        await updateProduct(productData, token ?? "");
        showToast('success', 'Product Updated!', 'Your product has been updated successfully.');
      }

      router.back();
    } catch (error: any) {
      console.error(`❌ [EditProduct] Error updating ${isBundle ? 'bundle' : 'product'}:`, error);

      let errorMessage = `Failed to update ${isBundle ? 'bundle' : 'product'}. Please try again.`;
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showToast('error', 'Update Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'food': return colors.primary;
      case 'electronics': return colors.warning;
      case 'clothing': return colors.info;
      case 'home appliances': return colors.success;
      default: return colors.text.secondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Loader size={32} color={colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit {isBundle ? 'Bundle' : 'Product'}</Text>
          <Text style={styles.headerSubtitle}>Update your {isBundle ? 'bundle' : 'product'} details</Text>
        </View>
        <TouchableOpacity
          style={[styles.publishButton, (!name.trim() || !description.trim() || !coverImage || (isBundle && selectedProducts.length < 2)) && styles.publishButtonDisabled]}
          onPress={handleSubmit}
          disabled={!name.trim() || !description.trim() || !coverImage || (isBundle && selectedProducts.length < 2) || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Check size={20} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Selection for Bundle */}
        {isBundle && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Select Products</Text>
              <Text style={styles.sectionCounter}>({selectedProducts.length} selected)</Text>
            </View>
            {errors.selectedProducts && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.selectedProducts}</Text>
              </View>
            )}
            <Text style={styles.sectionDescription}>
              Choose at least 2 products to create a bundle
            </Text>

            {isLoadingProducts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading your products...</Text>
              </View>
            ) : (
              <FlatList
                data={availableProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.productSelectionItem, item.isSelected && styles.productSelectionItemSelected]}
                    onPress={() => toggleProductSelection(item.id)}
                  >
                    {item.coverImage && (
                      <Image source={{ uri: item.coverImage }} style={styles.productSelectionImage} />
                    )}
                    <View style={styles.productSelectionDetails}>
                      <Text style={styles.productSelectionName}>{item.name}</Text>
                      <Text style={styles.productSelectionPrice}>₱{item.price.toFixed(2)}</Text>
                      <Text style={styles.productSelectionStock}>Stock: {item.stock}</Text>
                    </View>
                    <View style={[styles.productSelectionCheck, item.isSelected && styles.productSelectionCheckActive]}>
                      {item.isSelected && <Check size={16} color={colors.text.inverse} />}
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                style={styles.productSelectionList}
                showsVerticalScrollIndicator={true}
              />
            )}
          </View>
        )}

        {/* Product/Bundle Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{isBundle ? 'Bundle' : 'Product'} Details</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Basic information about your {isBundle ? 'bundle' : 'product'}
          </Text>

          <Text style={styles.label}>{isBundle ? 'Bundle' : 'Product'} Name</Text>
          {errors.name && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.name}</Text>
            </View>
          )}
          <TextInput
            style={[
              styles.textInput,
              errors.name && { borderColor: colors.error }
            ]}
            placeholder={`Enter ${isBundle ? 'bundle' : 'product'} name...`}
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Description</Text>
          {errors.description && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.description}</Text>
            </View>
          )}
          <TextInput
            style={[
              styles.descriptionInput,
              errors.description && { borderColor: colors.error }
            ]}
            multiline
            placeholder={`Describe your ${isBundle ? 'bundle' : 'product'} in detail...`}
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Product Type - Only for products */}
          {!isBundle && (
            <>
              <Text style={styles.label}>Product Type</Text>
              {errors.productType && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errors.productType}</Text>
                </View>
              )}
              <View style={styles.productTypeGrid}>
                {productTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.productTypeOption,
                      productType === type && { backgroundColor: getProductTypeColor(type) + '20', borderColor: getProductTypeColor(type) }
                    ]}
                    onPress={() => setProductType(type)}
                  >
                    <Text style={[
                      styles.productTypeText,
                      productType === type && { color: getProductTypeColor(type), fontWeight: typography.fontWeights.semibold }
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ImageIcon size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Product Images</Text>
            <Text style={styles.sectionCounter}>({(coverImage ? 1 : 0) + additionalImages.length}/{1 + 3})</Text>
          </View>
          {errors.coverImage && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.coverImage}</Text>
            </View>
          )}
          <Text style={styles.sectionDescription}>
            Add high-quality images to showcase your product
          </Text>

          <Text style={styles.label}>Cover Image</Text>
          <View style={styles.imageGrid}>
            {coverImage ? (
              <View style={styles.coverImageItem}>
                <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setCoverImage('')}
                >
                  <X size={16} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addCoverImageButton} onPress={pickCoverImage}>
                <Camera size={24} color={colors.primary} />
                <Text style={styles.addImageText}>Add Cover Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Additional Images</Text>
          <View style={styles.imageGrid}>
            {additionalImages.map((imageUri, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            ))}

            {additionalImages.length < 3 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Camera size={24} color={colors.primary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 20, color: colors.primary, fontWeight: '600' }}>₱</Text>
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Set competitive prices for your product
          </Text>

          <Text style={styles.label}>Original Price (₱)</Text>
          {errors.originalPrice && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.originalPrice}</Text>
            </View>
          )}
          <TextInput
            style={[
              styles.textInput,
              errors.originalPrice && { borderColor: colors.error }
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.text.tertiary}
            value={originalPrice}
            onChangeText={setOriginalPrice}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Discounted Price (₱)</Text>
          {errors.discountedPrice && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.discountedPrice}</Text>
            </View>
          )}
          <TextInput
            style={[
              styles.textInput,
              errors.discountedPrice && { borderColor: colors.error }
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.text.tertiary}
            value={discountedPrice}
            onChangeText={setDiscountedPrice}
            keyboardType="numeric"
          />

          {originalPrice && discountedPrice && parseFloat(originalPrice) > parseFloat(discountedPrice) && (
            <View style={styles.priceCalculation}>
              <Text style={styles.discountText}>
                Savings: ₱{(parseFloat(originalPrice) - parseFloat(discountedPrice)).toFixed(2)}
              </Text>
              <Text style={styles.discountText}>
                Discount: {(((parseFloat(originalPrice) - parseFloat(discountedPrice)) / parseFloat(originalPrice)) * 100).toFixed(1)}%
              </Text>
            </View>
          )}

          {/* Dynamic Pricing Toggle - Only for products */}
          {!isBundle && (
            <>
              <TouchableOpacity
                style={styles.dynamicPricingToggle}
                onPress={() => {
                  setIsDynamicPricingEnabled(!isDynamicPricingEnabled);
                  if (!isDynamicPricingEnabled) {
                    setIsDynamicPricingExpanded(true);
                  }
                }}
              >
                <View style={styles.toggleLeft}>
                  <Zap size={20} color={isDynamicPricingEnabled ? colors.primary : colors.text.secondary} />
                  <Text style={[styles.toggleText, isDynamicPricingEnabled && { color: colors.primary }]}>
                    Enable Dynamic Pricing
                  </Text>
                </View>
                <View style={[styles.toggleSwitch, isDynamicPricingEnabled && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleIndicator, isDynamicPricingEnabled && styles.toggleIndicatorActive]} />
                </View>
              </TouchableOpacity>

              {isDynamicPricingEnabled && (
                <View style={styles.dynamicPricingInfo}>
                  <View style={styles.infoBox}>
                    <Info size={16} color={colors.info} />
                    <Text style={styles.infoText}>
                      Dynamic pricing automatically reduces the price daily as the product approaches its expiration date, reaching the product cost on the final day.
                    </Text>
                  </View>
                </View>
              )}

              {/* Expandable Dynamic Pricing Section */}
              {isDynamicPricingEnabled && (
                <TouchableOpacity
                  style={styles.expandToggle}
                  onPress={() => setIsDynamicPricingExpanded(!isDynamicPricingExpanded)}
                >
                  <Text style={styles.expandToggleText}>Dynamic Pricing Settings</Text>
                  {isDynamicPricingExpanded ? (
                    <ChevronUp size={20} color={colors.primary} />
                  ) : (
                    <ChevronDown size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}

              {isDynamicPricingEnabled && isDynamicPricingExpanded && (
                <View style={styles.dynamicPricingSection}>
                  <Text style={styles.label}>Product Cost (₱)</Text>
                  <Text style={styles.fieldDescription}>
                    The minimum price the product will reach on its final day before expiration
                  </Text>
                  {errors.productCost && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={16} color={colors.error} />
                      <Text style={styles.errorText}>{errors.productCost}</Text>
                    </View>
                  )}
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.productCost && { borderColor: colors.error }
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    value={productCost}
                    onChangeText={setProductCost}
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Start Dynamic Pricing (Days Before Expiration)</Text>
                  <Text style={styles.fieldDescription}>
                    Number of days before expiration when dynamic pricing begins
                  </Text>
                  {errors.dynamicPricingStartDays && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={16} color={colors.error} />
                      <Text style={styles.errorText}>{errors.dynamicPricingStartDays}</Text>
                    </View>
                  )}
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.dynamicPricingStartDays && { borderColor: colors.error }
                    ]}
                    placeholder="14"
                    placeholderTextColor={colors.text.tertiary}
                    value={dynamicPricingStartDays}
                    onChangeText={setDynamicPricingStartDays}
                    keyboardType="numeric"
                  />

                  {/* Dynamic Pricing Preview */}
                  {discountedPrice && productCost && dynamicPricingStartDays &&
                    parseFloat(discountedPrice) > parseFloat(productCost) &&
                    parseInt(dynamicPricingStartDays) > 0 && (
                      <View style={styles.pricingPreview}>
                        <View style={styles.previewHeader}>
                          <TrendingDown size={16} color={colors.info} />
                          <Text style={styles.previewTitle}>Pricing Preview</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Current Price:</Text>
                          <Text style={styles.previewValue}>₱{parseFloat(discountedPrice).toFixed(2)}</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Final Price (Day {dynamicPricingStartDays}):</Text>
                          <Text style={styles.previewValue}>₱{parseFloat(productCost).toFixed(2)}</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Daily Reduction:</Text>
                          <Text style={styles.previewValue}>
                            ₱{((parseFloat(discountedPrice) - parseFloat(productCost)) / parseInt(dynamicPricingStartDays)).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    )}
                </View>
              )}
            </>
          )}
        </View>

        {/* Stock Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Inventory</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Manage your product stock levels
          </Text>

          <Text style={styles.label}>Stock Quantity</Text>
          {errors.stock && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.stock}</Text>
            </View>
          )}
          <TextInput
            style={[
              styles.textInput,
              errors.stock && { borderColor: colors.error }
            ]}
            placeholder="0"
            placeholderTextColor={colors.text.tertiary}
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />
        </View>

        {/* Categories Section - Only for products */}
        {!isBundle && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Hash size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Categories</Text>
              <Text style={styles.sectionCounter}>({category.length}/10)</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Add relevant categories to help customers find your product
            </Text>

            {/* Category Input */}
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a category..."
                placeholderTextColor={colors.text.tertiary}
                value={currentCategory}
                onChangeText={setCurrentCategory}
                onSubmitEditing={addCategory}
                maxLength={20}
              />
              <TouchableOpacity
                style={[styles.addTagButton, !currentCategory.trim() && styles.addTagButtonDisabled]}
                onPress={addCategory}
                disabled={!currentCategory.trim() || category.length >= 10}
              >
                <Text style={styles.addTagText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Categories Display */}
            {category.length > 0 && (
              <View style={styles.tagsContainer}>
                {category.map((cat, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{cat}</Text>
                    <TouchableOpacity onPress={() => removeCategory(cat)}>
                      <X size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
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
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonDisabled: {
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
  sectionCounter: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  sectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },

  // Text Inputs
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    minHeight: 120,
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  // Product Type Selection
  productTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  productTypeOption: {
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
  productTypeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Images
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  imageItem: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  coverImageItem: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: radii.lg,
    backgroundColor: colors.background.secondary,
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: radii.lg,
    backgroundColor: colors.background.secondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCoverImageButton: {
    width: '100%',
    height: 200,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },

  // Pricing
  priceCalculation: {
    backgroundColor: colors.background.successSubtle,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  discountText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  fieldDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },

  // Dynamic Pricing Toggle
  dynamicPricingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
    marginLeft: spacing.sm,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border.primary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.primary,
    alignSelf: 'flex-start',
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },

  // Dynamic Pricing Info
  dynamicPricingInfo: {
    marginBottom: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.infoSubtle,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.info,
    lineHeight: 18,
  },

  // Expandable Section
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  expandToggleText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },

  // Dynamic Pricing Section
  dynamicPricingSection: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },

  // Pricing Preview
  pricingPreview: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  previewTitle: {
    fontSize: typography.fontSizes.md,
    color: colors.info,
    fontWeight: typography.fontWeights.semibold,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  previewValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
  },

  // Categories/Tags
  tagInputContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  addTagButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  addTagText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.semibold,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  tagText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },

  // Product Selection Styles
  productSelectionList: {
    maxHeight: 400,
  },
  productSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  productSelectionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
  },
  productSelectionImage: {
    width: 50,
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.background.tertiary,
  },
  productSelectionDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  productSelectionName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productSelectionPrice: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  productSelectionStock: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
  },
  productSelectionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  productSelectionCheckActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default EditProduct;
