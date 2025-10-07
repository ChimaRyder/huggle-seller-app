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
  DollarSign,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { getProductbyID, updateProduct } from '@/utils/Controllers/ProductController';
import { FullProduct } from '@/types/product';
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
  const [product, setProduct] = useState<FullProduct | null>(null);
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

  // Image upload hook
  const { uploadState, uploadImageUri } = useImageUpload();

  const getProduct = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const token = await getToken({ template: "seller_app" });
      const response = await getProductbyID(productId as string, token ?? "");
      const data = ((response as any).data);

      if (data) {
        setProduct(data);
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
      } else {
        Alert.alert('Error', 'Product not found.');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details.');
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
      newErrors.name = 'Product name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!productType) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !product) return;

    setIsSubmitting(true);

    try {
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
      };

      const token = await getToken({ template: "seller_app" });
      
      const response = await updateProduct(productData, token ?? "");
      
      showToast('success', 'Product Updated!', 'Your product has been updated successfully.');
      router.back();
    } catch (error: any) {
      console.error("❌ [EditProduct] Error updating product:", error);
      
      let errorMessage = 'Failed to update product. Please try again.';
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
          <Text style={styles.headerTitle}>Edit Product</Text>
          <Text style={styles.headerSubtitle}>Update your product details</Text>
        </View>
        <TouchableOpacity
          style={[styles.publishButton, (!name.trim() || !description.trim() || !coverImage) && styles.publishButtonDisabled]}
          onPress={handleSubmit}
          disabled={!name.trim() || !description.trim() || !coverImage || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <Check size={20} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Product Details</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Basic information about your product
          </Text>

          <Text style={styles.label}>Product Name</Text>
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
            placeholder="Enter product name..."
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
            placeholder="Describe your product in detail..."
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

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

        {/* Categories Section */}
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
});

export default EditProduct;
