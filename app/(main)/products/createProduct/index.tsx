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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
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
  DollarSign,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  TrendingDown,
  Package2,
  Sparkles,
  Plus,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { createProduct, getAllProducts } from '@/utils/Controllers/ProductController';
import { createBundle, updateBundle, generateBundleFromExternal, generateMultipleBundlesFromExternal, convertExternalBundleToRequest, deleteMultipleBundles } from '@/utils/Controllers/BundleController';
import { validateSellerAccess } from '@/utils/sellerUtils';
import { showToast } from '@/components/Toast';
import * as ImagePicker from 'expo-image-picker';
import { useImageUpload } from '@/hooks/useImageUpload';
import { BundleCreationMode, SelectableProduct, BundleFormData, BundleRequestDto, ExternalBundleResponse } from '@/types/bundle';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - spacing.lg * 3) / 2;

// Product Types
const productTypes = ["Food", "Electronics", "Clothing", "Home Appliances", "Books", "Health & Beauty", "Sports & Outdoors", "Toys & Games", "Pets", "Automotives", "Baby Products", "Office Supplies", "Arts & Crafts"];



// Create Product/Bundle Screen
const CreateProduct = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  
  // Mode selection
  const [creationMode, setCreationMode] = useState<'product' | 'bundle'>('product');
  const [bundleCreationMode, setBundleCreationMode] = useState<BundleCreationMode>('from-products');
  
  // Product state
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Dynamic pricing state
  const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = useState(false);
  const [productCost, setProductCost] = useState('');
  const [dynamicPricingStartDays, setDynamicPricingStartDays] = useState('14');
  const [isDynamicPricingExpanded, setIsDynamicPricingExpanded] = useState(false);

  // Bundle state
  const [availableProducts, setAvailableProducts] = useState<SelectableProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectableProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isGeneratingBundle, setIsGeneratingBundle] = useState(false);
  
  // AI Generated bundles state
  const [generatedBundles, setGeneratedBundles] = useState<ExternalBundleResponse[]>([]);
  const [selectedBundleIndex, setSelectedBundleIndex] = useState<number | null>(null);
  const [showBundleSelection, setShowBundleSelection] = useState(false);

  // Image upload hook
  const { uploadState, uploadImageUri } = useImageUpload();

  // Load seller's products for bundle creation
  useEffect(() => {
    if (creationMode === 'bundle') {
      loadSellerProducts();
    }
  }, [creationMode, bundleCreationMode]);

  const loadSellerProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const token = await getToken({ template: "seller_app" });
      if (!token) return;

      const response = await getAllProducts('', token);
      console.log('📦 [loadSellerProducts] Raw products response:', response.data);
      
      const products: SelectableProduct[] = response.data.map((product: any, index: number) => {
        console.log(`📦 [loadSellerProducts] Processing product ${index}:`, {
          id: product.id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice,
          originalPrice: product.originalPrice,
          stock: product.stock,
        });
        
        return {
          id: product.id,
          name: product.name,
          price: product.discountedPrice || product.price || 0,
          originalPrice: product.originalPrice || product.price || 0,
          stock: product.stock || 0,
          coverImage: product.coverImage || '',
          isSelected: false,
          productType: product.productType || 'Unknown',
          expiresOn: product.expiresOn ? new Date(product.expiresOn) : undefined,
        };
      });
      
      console.log('📦 [loadSellerProducts] Processed products:', products.length);
      
      setAvailableProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('error', 'Error', 'Failed to load products for bundle creation');
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

  const generateExternalBundles = async () => {
    try {
      setIsGeneratingBundle(true);
      const token = await getToken({ template: "seller_app" });
      if (!token) return;

      const validation = validateSellerAccess(token, user);
      if (!validation.isValid || !validation.storeId) {
        throw new Error('Seller access validation failed');
      }

      console.log('🚀 [generateExternalBundles] Calling API with store ID:', validation.storeId);
      const response = await generateMultipleBundlesFromExternal(validation.storeId, token, 3);
      
      console.log('📦 [generateExternalBundles] Full API response:', response);
      console.log('📦 [generateExternalBundles] Response data:', response.data);
      
      // The API returns bundles directly as an array
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ [generateExternalBundles] Found bundles array:', response.data.length);
        setGeneratedBundles(response.data);
        setShowBundleSelection(true);
        setSelectedBundleIndex(null);
        showToast('success', 'Bundles Generated', `${response.data.length} bundle options have been generated. Choose your favorite!`);
      } else {
        console.error('❌ [generateExternalBundles] Unexpected response structure:', response.data);
        throw new Error('Invalid response format from bundle generation service');
      }
    } catch (error: any) {
      console.error('❌ [generateExternalBundles] Error generating bundles:', error);
      showToast('error', 'Generation Failed', error?.response?.data?.message || error?.message || 'Failed to generate bundles from external service');
    } finally {
      setIsGeneratingBundle(false);
    }
  };

  const selectBundle = async (index: number) => {
    try {
      const selectedBundle = generatedBundles[index];
      const token = await getToken({ template: "seller_app" });
      const validation = validateSellerAccess(token, user);
      
      if (!validation.isValid || !validation.storeId) {
        throw new Error('Seller access validation failed');
      }

      console.log(`🎯 [selectBundle] Selected bundle ${index}: ${selectedBundle.name} (ID: ${selectedBundle.id})`);

      // Delete unselected bundles from the database
      const unselectedBundleIds = generatedBundles
        .filter((_, i) => i !== index)
        .map(bundle => bundle.id);

      if (unselectedBundleIds.length > 0) {
        console.log('🗑️ [selectBundle] Cleaning up unselected bundles:', unselectedBundleIds);
        try {
          const deleteResults = await deleteMultipleBundles(unselectedBundleIds, token);
          console.log('🧹 [selectBundle] Cleanup results:', deleteResults);
          
          if (deleteResults.failed.length > 0) {
            console.warn('⚠️ [selectBundle] Some bundles failed to delete:', deleteResults.failed);
          }
        } catch (error) {
          console.error('❌ [selectBundle] Failed to cleanup unselected bundles:', error);
          // Don't fail the selection process if cleanup fails
        }
      }

      const bundleRequest = convertExternalBundleToRequest(selectedBundle, validation.storeId);

      // Load product details for the bundle products
      const bundleProductIds = selectedBundle.products.map(p => p.id);
      const bundleProducts: SelectableProduct[] = [];
      
      // Find matching products from available products
      for (const productId of bundleProductIds) {
        const matchingProduct = availableProducts.find(p => p.id === productId);
        if (matchingProduct) {
          bundleProducts.push({
            ...matchingProduct,
            isSelected: true
          });
        } else {
          // If product not in availableProducts, we need to fetch it
          // For now, create a basic product object from the AI bundle data
          const aiProduct = selectedBundle.products.find(p => p.id === productId);
          if (aiProduct) {
            bundleProducts.push({
              id: aiProduct.id,
              name: aiProduct.name,
              price: 100, // Default price since AI bundles don't include pricing
              originalPrice: 100,
              stock: aiProduct.stock,
              coverImage: '',
              isSelected: true,
              productType: aiProduct.product_type || 'Unknown',
              expiresOn: aiProduct.expires_on ? new Date(aiProduct.expires_on) : undefined,
            });
          }
        }
      }

      // Update available products to mark selected ones
      setAvailableProducts(prev => 
        prev.map(product => ({
          ...product,
          isSelected: bundleProductIds.includes(product.id)
        }))
      );

      // Set selected products
      setSelectedProducts(bundleProducts);

      // Pre-fill form with selected bundle data
      setName(bundleRequest.name);
      setDescription(bundleRequest.description || '');
      setOriginalPrice(bundleRequest.originalPrice.toString());
      setDiscountedPrice(bundleRequest.price.toString());
      setStock(bundleRequest.stock.toString());
      if (bundleRequest.imageUrl) {
        setCoverImage(bundleRequest.imageUrl);
      }

      setSelectedBundleIndex(index);
      setShowBundleSelection(false);
      
      const cleanupMessage = unselectedBundleIds.length > 0 
        ? ` ${unselectedBundleIds.length} unused bundles have been cleaned up.`
        : '';
      
      showToast('success', 'Bundle Selected', `Bundle has been loaded into the form.${cleanupMessage} Review and submit when ready.`);
    } catch (error) {
      console.error('❌ [selectBundle] Error selecting bundle:', error);
      showToast('error', 'Selection Failed', 'Failed to select bundle. Please try again.');
    }
  };

  const navigateBack = () => {
    const hasChanges = name.trim() || description.trim() || coverImage || additionalImages.length > 0 || selectedProducts.length > 0;
    const hasUnselectedBundles = generatedBundles.length > 0 && selectedBundleIndex === null;
    
    if (hasChanges || hasUnselectedBundles) {
      let message = 'Are you sure you want to discard your changes?';
      if (hasUnselectedBundles) {
        message = 'You have unselected AI bundles that will be deleted. Are you sure you want to go back?';
      }
      
      Alert.alert(
        'Discard Changes',
        message,
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive', 
            onPress: async () => {
              // Clean up unselected bundles before navigating away
              if (hasUnselectedBundles) {
                try {
                  const token = await getToken({ template: "seller_app" });
                  const bundleIds = generatedBundles.map(bundle => bundle.id);
                  console.log('🗑️ [navigateBack] Cleaning up unselected bundles:', bundleIds);
                  await deleteMultipleBundles(bundleIds, token);
                } catch (error) {
                  console.error('❌ [navigateBack] Failed to cleanup bundles:', error);
                }
              }
              router.back();
            }
          },
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
      console.error('❌ [CreateProduct] Additional image upload failed:', error);
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
      console.error('❌ [CreateProduct] Cover image upload failed:', error);
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
      newErrors.name = creationMode === 'product' ? 'Product name is required' : 'Bundle name is required';
    }

    // Description is now optional, but if provided, must meet minimum length
    if (description.trim() && description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (creationMode === 'product') {
      if (!productType) {
        newErrors.productType = 'Product type is required';
      }
    } else {
      // Bundle validation
      if (bundleCreationMode === 'from-products' && selectedProducts.length < 2) {
        newErrors.selectedProducts = 'Bundle must contain at least 2 products';
      }
    }

    if (!coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }

    if (!originalPrice || parseFloat(originalPrice) <= 0) {
      newErrors.originalPrice = 'Valid original price is required';
    }

    if (!discountedPrice || parseFloat(discountedPrice) <= 0) {
      newErrors.discountedPrice = 'Valid current price is required';
    }

    if (parseFloat(originalPrice) <= parseFloat(discountedPrice)) {
      newErrors.originalPrice = 'Original price must be greater than current price';
    }

    if (!stock || parseInt(stock) <= 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    // Dynamic pricing validation
    if (isDynamicPricingEnabled) {
      if (!productCost || parseFloat(productCost) <= 0) {
        newErrors.productCost = 'Valid product cost is required for dynamic pricing';
      } else if (parseFloat(productCost) >= parseFloat(discountedPrice)) {
        newErrors.productCost = 'Product cost must be less than the current price';
      }
      
      if (!dynamicPricingStartDays || parseInt(dynamicPricingStartDays) <= 0) {
        newErrors.dynamicPricingStartDays = 'Valid start days is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = await getToken({ template: "seller_app" });
      if (!token) {
        throw new Error('Authentication token not available');
      }

      // Validate seller access and get storeId
      const validation = validateSellerAccess(token, user);
      if (!validation.isValid || !validation.storeId) {
        throw new Error(validation.error || 'Seller access validation failed');
      }

      if (creationMode === 'product') {
        // Create product
        const productData = {
          name: name.trim(),
          description: description.trim() || '',
          productType: productType,
          coverImage: coverImage,
          additionalImages: additionalImages,
          discountedPrice: parseFloat(discountedPrice),
          originalPrice: parseFloat(originalPrice),
          expirationDate: duration.toISOString(),
          stock: parseInt(stock),
          category: category,
          storeId: validation.storeId,
          isDynamicPricingEnabled: isDynamicPricingEnabled,
          productCost: isDynamicPricingEnabled ? parseFloat(productCost) : parseFloat(originalPrice) * 0.7,
          dynamicPricingStartDays: isDynamicPricingEnabled ? parseInt(dynamicPricingStartDays) : 14,
        };

        await createProduct(productData, token);
        showToast('success', 'Product Created!', 'Your product has been created successfully.');
      } else {
        // Handle bundle creation/update
        if (bundleCreationMode === 'external-generation' && selectedBundleIndex !== null && generatedBundles[selectedBundleIndex]) {
          // Update existing AI-generated bundle instead of creating a new one
          const selectedBundle = generatedBundles[selectedBundleIndex];
          const updateData = {
            name: name.trim(),
            description: description.trim() || '',
            productIds: selectedProducts.map(p => p.id),
            images: additionalImages,
            stock: parseInt(stock),
            imageUrl: coverImage,
            price: parseFloat(discountedPrice),
            originalPrice: parseFloat(originalPrice),
            expiresOn: duration,
            isActive: true,
            isDynamicPricingEnabled: isDynamicPricingEnabled,
            dynamicPricingStartDays: isDynamicPricingEnabled ? parseInt(dynamicPricingStartDays) : 14,
          };

          await updateBundle(selectedBundle.id.toString(), updateData, token);
          showToast('success', 'Bundle Updated!', 'Your AI-generated bundle has been updated successfully.');
        } else {
          // Create new bundle (for from-products mode or when no AI bundle selected)
          const bundleData: BundleRequestDto = {
            storeId: validation.storeId,
            name: name.trim(),
            description: description.trim() || '',
            productIds: selectedProducts.map(p => p.id),
            images: additionalImages,
            stock: parseInt(stock),
            imageUrl: coverImage,
            price: parseFloat(discountedPrice),
            originalPrice: parseFloat(originalPrice),
            expiresOn: duration,
            isActive: true,
            isDynamicPricingEnabled: isDynamicPricingEnabled,
            dynamicPricingStartDays: isDynamicPricingEnabled ? parseInt(dynamicPricingStartDays) : 14,
          };

          await createBundle(bundleData, token);
          showToast('success', 'Bundle Created!', 'Your bundle has been created successfully.');
        }
      }

      router.back();
    } catch (error: any) {
      console.error(`❌ [Create${creationMode === 'product' ? 'Product' : 'Bundle'}] Error:`, error);
      
      let errorMessage = `Failed to create ${creationMode}. Please try again.`;
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showToast('error', 'Creation Failed', errorMessage);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {creationMode === 'product' 
              ? 'Create Product'
              : (bundleCreationMode === 'external-generation' && selectedBundleIndex !== null)
                ? 'Update Bundle'
                : 'Create Bundle'
            }
          </Text>
          <Text style={styles.headerSubtitle}>
            {creationMode === 'product' 
              ? 'Add a new product to your store' 
              : (bundleCreationMode === 'external-generation' && selectedBundleIndex !== null)
                ? 'Review and update your AI-generated bundle'
                : 'Create a bundle from your products'
            }
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.publishButton, (!name.trim() || !coverImage) && styles.publishButtonDisabled]}
          onPress={handleSubmit}
          disabled={!name.trim() || !coverImage || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <Check size={20} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>

      {/* Mode Selection */}
      <View style={styles.modeSection}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, creationMode === 'product' && styles.modeButtonActive]}
            onPress={async () => {
              // Clean up any unselected bundles when switching to product mode
              if (creationMode !== 'product' && generatedBundles.length > 0 && selectedBundleIndex === null) {
                try {
                  const token = await getToken({ template: "seller_app" });
                  const bundleIds = generatedBundles.map(bundle => bundle.id);
                  console.log('🗑️ [modeSwitch] Cleaning up unselected bundles:', bundleIds);
                  await deleteMultipleBundles(bundleIds, token);
                } catch (error) {
                  console.error('❌ [modeSwitch] Failed to cleanup bundles:', error);
                }
              }
              
              setCreationMode('product');
              setGeneratedBundles([]);
              setSelectedBundleIndex(null);
              setShowBundleSelection(false);
            }}
          >
            <Package size={18} color={creationMode === 'product' ? colors.text.inverse : colors.text.secondary} />
            <Text style={[styles.modeButtonText, creationMode === 'product' && styles.modeButtonTextActive]}>
              Product
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, creationMode === 'bundle' && styles.modeButtonActive]}
            onPress={async () => {
              // Clean up any unselected bundles when switching modes
              if (creationMode !== 'bundle' && generatedBundles.length > 0 && selectedBundleIndex === null) {
                try {
                  const token = await getToken({ template: "seller_app" });
                  const bundleIds = generatedBundles.map(bundle => bundle.id);
                  console.log('🗑️ [modeSwitch] Cleaning up unselected bundles:', bundleIds);
                  await deleteMultipleBundles(bundleIds, token);
                } catch (error) {
                  console.error('❌ [modeSwitch] Failed to cleanup bundles:', error);
                }
              }
              
              setCreationMode('bundle');
              setGeneratedBundles([]);
              setSelectedBundleIndex(null);
              setShowBundleSelection(false);
            }}
          >
            <Package2 size={18} color={creationMode === 'bundle' ? colors.text.inverse : colors.text.secondary} />
            <Text style={[styles.modeButtonText, creationMode === 'bundle' && styles.modeButtonTextActive]}>
              Bundle
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Bundle Creation Options */}
        {creationMode === 'bundle' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package2 size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Bundle Creation Method</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Choose how you want to create your bundle
            </Text>

            <View style={styles.bundleMethodGrid}>
              <TouchableOpacity
                style={[
                  styles.bundleMethodOption,
                  bundleCreationMode === 'from-products' && styles.bundleMethodOptionActive
                ]}
                onPress={() => setBundleCreationMode('from-products')}
              >
                <Package size={24} color={bundleCreationMode === 'from-products' ? colors.primary : colors.text.secondary} />
                <Text style={[
                  styles.bundleMethodTitle,
                  bundleCreationMode === 'from-products' && { color: colors.primary }
                ]}>
                  From Your Products
                </Text>
                <Text style={styles.bundleMethodDescription}>
                  Select existing products to create a bundle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bundleMethodOption,
                  bundleCreationMode === 'external-generation' && styles.bundleMethodOptionActive
                ]}
                onPress={() => setBundleCreationMode('external-generation')}
              >
                <Sparkles size={24} color={bundleCreationMode === 'external-generation' ? colors.primary : colors.text.secondary} />
                <Text style={[
                  styles.bundleMethodTitle,
                  bundleCreationMode === 'external-generation' && { color: colors.primary }
                ]}>
                  AI Generated
                </Text>
                <Text style={styles.bundleMethodDescription}>
                  Let AI create a bundle for you
                </Text>
              </TouchableOpacity>
            </View>

            {/* AI Generation Button */}
            {bundleCreationMode === 'external-generation' && !showBundleSelection && (
              <TouchableOpacity
                style={[styles.generateBundleButton, isGeneratingBundle && styles.generateBundleButtonDisabled]}
                onPress={generateExternalBundles}
                disabled={isGeneratingBundle}
              >
                {isGeneratingBundle ? (
                  <>
                    <View style={styles.loadingIndicator} />
                    <Text style={styles.generateBundleButtonText}>Generating...</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} color={colors.text.inverse} />
                    <Text style={styles.generateBundleButtonText}>Generate 3 Bundle Options</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Bundle Selection UI */}
            {bundleCreationMode === 'external-generation' && showBundleSelection && generatedBundles && generatedBundles.length > 0 && (
              <View style={styles.bundleSelectionContainer}>
                <View style={styles.bundleSelectionHeader}>
                  <Sparkles size={20} color={colors.primary} />
                  <Text style={styles.bundleSelectionTitle}>Choose Your Bundle</Text>
                </View>
                <Text style={styles.bundleSelectionDescription}>
                  Select the bundle option you like most. You can review and edit the details afterwards.
                </Text>
                
                <FlatList
                  data={generatedBundles}
                  keyExtractor={(item, index) => `bundle-${index}`}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.bundleOption,
                        selectedBundleIndex === index && styles.bundleOptionSelected
                      ]}
                      onPress={() => selectBundle(index)}
                    >
                      <View style={styles.bundleOptionHeader}>
                        <View style={styles.bundleOptionInfo}>
                          <Text style={styles.bundleOptionName}>{item.name}</Text>
                          <Text style={styles.bundleOptionDescription} numberOfLines={2}>
                            {item.description || 'No description available'}
                          </Text>
                        </View>
                        {item.image_url && (
                          <Image source={{ uri: item.image_url }} style={styles.bundleOptionImage} />
                        )}
                      </View>
                      
                      <View style={styles.bundleOptionDetails}>
                        <View style={styles.bundleOptionStat}>
                          <Package size={16} color={colors.text.secondary} />
                          <Text style={styles.bundleOptionStatText}>
                            {item.products.length} products
                          </Text>
                        </View>
                        <View style={styles.bundleOptionStat}>
                          <DollarSign size={16} color={colors.primary} />
                          <Text style={styles.bundleOptionStatText}>
                            ₱{(item.products.length * 100 * 0.85).toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.bundleOptionStat}>
                          <BarChart3 size={16} color={colors.text.secondary} />
                          <Text style={styles.bundleOptionStatText}>
                            Stock: {item.stock}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.bundleOptionProducts}>
                        <Text style={styles.bundleOptionProductsTitle}>Products included:</Text>
                        {item.products.map((product, productIndex) => (
                          <Text key={productIndex} style={styles.bundleOptionProductItem}>
                            • {product.name}{product.product_type ? ` (${product.product_type})` : ''}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.bundleOptionFooter}>
                        <Text style={styles.bundleOptionSelectText}>
                          {selectedBundleIndex === index ? 'Selected' : 'Tap to select'}
                        </Text>
                        {selectedBundleIndex === index && (
                          <Check size={20} color={colors.primary} />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />

                <TouchableOpacity
                  style={styles.regenerateBundlesButton}
                  onPress={async () => {
                    // Clean up all currently generated bundles before generating new ones
                    if (generatedBundles.length > 0) {
                      try {
                        const token = await getToken({ template: "seller_app" });
                        const bundleIds = generatedBundles.map(bundle => bundle.id);
                        console.log('🗑️ [regenerate] Cleaning up all current bundles:', bundleIds);
                        await deleteMultipleBundles(bundleIds, token);
                      } catch (error) {
                        console.error('❌ [regenerate] Failed to cleanup bundles:', error);
                      }
                    }
                    
                    setShowBundleSelection(false);
                    setGeneratedBundles([]);
                    setSelectedBundleIndex(null);
                  }}
                >
                  <Sparkles size={16} color={colors.text.secondary} />
                  <Text style={styles.regenerateBundlesButtonText}>Generate New Options</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Product Selection for Bundle */}
        {creationMode === 'bundle' && (
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
              {bundleCreationMode === 'external-generation' && selectedBundleIndex !== null && 
                ' (AI bundle products are pre-selected, but you can modify the selection)'
              }
            </Text>

            {isLoadingProducts ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIndicator} />
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
                    <Image source={{ uri: item.coverImage }} style={styles.productSelectionImage} />
                    <View style={styles.productSelectionDetails}>
                      <Text style={styles.productSelectionName}>{item.name}</Text>
                      <Text style={styles.productSelectionPrice}>₱{(item.price || 0).toFixed(2)}</Text>
                      <Text style={styles.productSelectionStock}>Stock: {item.stock || 0}</Text>
                    </View>
                    <View style={[styles.productSelectionCheck, item.isSelected && styles.productSelectionCheckActive]}>
                      {item.isSelected && <Check size={16} color={colors.text.inverse} />}
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
                style={styles.productSelectionList}
              />
            )}
          </View>
        )}

        {/* Product/Bundle Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              {creationMode === 'product' ? 'Product' : 'Bundle'} Details
            </Text>
          </View>
          <Text style={styles.sectionDescription}>
            Basic information about your {creationMode}
          </Text>

          <Text style={styles.label}>
            {creationMode === 'product' ? 'Product' : 'Bundle'} Name
          </Text>
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
            placeholder={`Enter ${creationMode} name...`}
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Description <Text style={styles.optionalText}>(Optional)</Text></Text>
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
            placeholder={`Describe your ${creationMode} in detail...`}
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Product Type - Only for products */}
          {creationMode === 'product' && (
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
            <Text style={styles.sectionTitle}>
              {creationMode === 'product' ? 'Product' : 'Bundle'} Images
            </Text>
            <Text style={styles.sectionCounter}>({(coverImage ? 1 : 0) + additionalImages.length}/{1 + 3})</Text>
          </View>
          {errors.coverImage && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.coverImage}</Text>
            </View>
          )}
          <Text style={styles.sectionDescription}>
            Add high-quality images to showcase your {creationMode}
          </Text>

          <Text style={styles.label}>Cover Image</Text>
          <View style={styles.imageGrid}>
            {coverImage ? (
              <View style={styles.coverImageItem}>
                <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setCoverImage('')}
                  disabled={uploadState.isUploading}
                >
                  <X size={16} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.addCoverImageButton, uploadState.isUploading && styles.uploadingButton]} 
                onPress={pickCoverImage}
                disabled={uploadState.isUploading}
              >
                {uploadState.isUploading ? (
                  <>
                    <View style={styles.uploadProgressContainer}>
                      <View style={[styles.uploadProgressBar, { width: `${uploadState.progress}%` }]} />
                    </View>
                    <Text style={styles.addImageText}>
                      Uploading... {Math.round(uploadState.progress)}%
                    </Text>
                  </>
                ) : (
                  <>
                    <Camera size={24} color={colors.primary} />
                    <Text style={styles.addImageText}>Add Cover Image</Text>
                  </>
                )}
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
              <TouchableOpacity 
                style={[styles.addImageButton, uploadState.isUploading && styles.uploadingButton]} 
                onPress={pickImage}
                disabled={uploadState.isUploading}
              >
                {uploadState.isUploading ? (
                  <>
                    <View style={styles.uploadProgressContainer}>
                      <View style={[styles.uploadProgressBar, { width: `${uploadState.progress}%` }]} />
                    </View>
                    <Text style={styles.addImageText}>
                      Uploading... {Math.round(uploadState.progress)}%
                    </Text>
                  </>
                ) : (
                  <>
                    <Camera size={24} color={colors.primary} />
                    <Text style={styles.addImageText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={colors.primary} />
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

          <Text style={styles.label}>Current Price (₱)</Text>
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

          {/* Dynamic Pricing Toggle */}
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
        {creationMode === 'product' && (
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modeSection: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.xs,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  modeButtonTextActive: {
    color: colors.text.inverse,
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
  uploadingButton: {
    opacity: 0.7,
  },
  uploadProgressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: colors.border.primary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  uploadProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
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
  optionalText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeights.normal,
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

  // Bundle Creation Styles
  bundleMethodGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  bundleMethodOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  bundleMethodOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
  },
  bundleMethodTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  bundleMethodDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  generateBundleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  generateBundleButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  generateBundleButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },

  // Product Selection Styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  productSelectionList: {
    maxHeight: 300,
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

  // Bundle Selection Styles
  bundleSelectionContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  bundleSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bundleSelectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
  bundleSelectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  bundleOption: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border.primary,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bundleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
  },
  bundleOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bundleOptionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  bundleOptionName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bundleOptionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  bundleOptionImage: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.background.tertiary,
  },
  bundleOptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bundleOptionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bundleOptionStatText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  bundleOptionProducts: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bundleOptionProductsTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  bundleOptionProductItem: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  bundleOptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bundleOptionSelectText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  regenerateBundlesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  regenerateBundlesButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
});

export default CreateProduct;
