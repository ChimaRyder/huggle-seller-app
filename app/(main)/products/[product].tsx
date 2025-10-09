import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Alert, FlatList, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { Layout, Text, Icon, Button, TopNavigation, TopNavigationAction, Divider, Spinner, IconProps, IconElement, ViewPager, useTheme } from '@ui-kitten/components';
import ImageViewing from 'react-native-image-viewing';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { deleteProduct, getProductbyID } from '@/utils/Controllers/ProductController';
import { getBundleById, deleteBundle } from '@/utils/Controllers/BundleController';
import { FullProduct } from '@/types/product';
import { SellerBundleDto } from '@/types/bundle';
import { showToast } from '@/components/Toast';
import { getProductReviews, Review } from '@/utils/data/ReviewsController';
import ReviewItem from '../profile/components/reviewItem';
import { CookingPot, ArrowLeft, Edit3, Trash2, TrendingUp, Eye, ShoppingCart, ShoppingBag } from 'lucide-react-native';
import { getProductPerformance, ProductPerformanceResponse } from '@/utils/Controllers/AnalyticsController';
import { colors, spacing, typography, radii } from '@/constants/theme';

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="ArrowLeft" />
);

const EditIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="SquarePen" />
);

const DeleteIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Trash2" />
);

// const StarIcon = (props: IconProps): IconElement => (
//   <Icon {...props} name="Star" fill="#FFC107" />
// );

export default function ProductPage() {
  const router = useRouter();
  const { product: productId } = useLocalSearchParams();
  const [product, setProduct] = useState<FullProduct>({} as FullProduct);
  const [bundle, setBundle] = useState<SellerBundleDto | null>(null);
  const [isBundle, setIsBundle] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([] as Review[])
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [productAnalytics, setProductAnalytics] = useState<ProductPerformanceResponse | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const {getToken} = useAuth();
  const theme = useTheme();
  
  // Find the product/bundle based on the ID
  const getProduct = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      
      // First try to get as a product
      try {
        const [productResponse, reviewsResponse, analyticsResponse] = await Promise.all([
          getProductbyID(productId as string, token ?? ""),
          getProductReviews(token ?? "", productId as string),
          getProductPerformance(token ?? "", productId as string)
        ]);

        setProduct(((productResponse as any).data));
        setReviews(((reviewsResponse as any).data).slice(0, 5));
        setProductAnalytics((analyticsResponse as any).data);
        setIsBundle(false);
        setBundle(null);
        console.log('✅ Successfully loaded as product');
      } catch (productError) {
        console.log('❌ Failed to load as product, trying as bundle...', productError);
        
        // If product fetch fails, try as a bundle
        try {
          const [bundleResponse, reviewsResponse, analyticsResponse] = await Promise.all([
            getBundleById(productId as string, token ?? ""),
            getProductReviews(token ?? "", productId as string),
            getProductPerformance(token ?? "", productId as string)
          ]);

          setBundle(((bundleResponse as any).data));
          setReviews(((reviewsResponse as any).data).slice(0, 5));
          setProductAnalytics((analyticsResponse as any).data);
          setIsBundle(true);
          setProduct({} as FullProduct);
          console.log('✅ Successfully loaded as bundle');
        } catch (bundleError) {
          console.error('❌ Failed to load as both product and bundle:', bundleError);
          throw bundleError;
        }
      }
    } catch(error) {
      console.error('Error getting product/bundle: ', error);
    } finally {
      setLoading(false);
    }
  };

  const getReviews = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getProductReviews(token ?? "", productId as string);

      setReviews(((response as any).data).slice(0, 5));
    } catch(error) {
      console.error('Error getting reviews: ', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Use the same logic as getProduct
      await getProduct();
    } catch(error) {
      console.error('Error refreshing product/bundle: ', error);
      showToast('error', 'Refresh Failed', 'Unable to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const deleteProd = async () => {
    try {
      setLoading(true);
      
      const itemName = isBundle ? bundle?.name : product.name;
      const itemType = isBundle ? 'Bundle' : 'Product';
      
      console.log(`🗑️ [ProductPage] Starting ${itemType.toLowerCase()} deletion...`, {
        id: productId,
        name: itemName,
        isBundle
      });
      
      const token = await getToken({template: "seller_app"});
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      if (isBundle) {
        await deleteBundle(productId as string, token);
      } else {
        await deleteProduct(productId as string, token);
      }
      
      console.log(`✅ [ProductPage] ${itemType} deleted successfully`);
      
      // Navigate back first, then show success message
      router.back();
      
      // Small delay to ensure navigation completes before showing toast
      setTimeout(() => {
        showToast('success', `${itemType} Deleted`, `${itemName} has been deleted successfully.`);
      }, 100);
      
    } catch(error: any) {
      const itemName = isBundle ? bundle?.name : product.name;
      const itemType = isBundle ? 'bundle' : 'product';
      
      console.error(`❌ [ProductPage] Error deleting ${itemType}:`, error);
      
      let errorMessage = `An error occurred while deleting ${itemName}. Please try again.`;
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showToast('error', 'Delete Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = () => {
    const itemName = isBundle ? bundle?.name : product.name;
    const itemType = isBundle ? 'Bundle' : 'Product';
    
    Alert.alert(
      `Delete ${itemType}`, 
      `Are you sure you want to delete "${itemName}"?\n\nThis action cannot be undone and will permanently remove the ${itemType.toLowerCase()} from your store.`, 
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteProd,
        },
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      getProduct();

      return () => {}
    }, [])
  );

  const navigateBack = () => {
    router.back();
  };

  const navigateToEdit = () => {
    router.push({
      pathname: "/(main)/products/editProduct",
      params: { productId: productId }
    });
  };

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const renderImageIndicators = () => {
    const images = getProductImagesArray();
    if (images.length <= 1) return null; // Don't show indicators for single image
    
    return (
      <View style={styles.indicatorContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              selectedIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  // Function to open image viewer
  const openImageViewer = () => {
    setSelectedImageIndex(selectedIndex);
    setImageViewerVisible(true);
  };

  // Prepare images for react-native-image-viewing
  const getAllProductImages = () => {
    const imageArray = getProductImagesArray();
    return imageArray.map(url => ({ uri: url }));
  };

  // Get all product images as a simple array
  const getProductImagesArray = () => {
    if (isBundle && bundle) {
      // Start with bundle's main images
      const bundleMainImages = bundle.imageUrl ? [bundle.imageUrl, ...bundle.images] : bundle.images;
      
      // Add images from individual products in the bundle
      const productImages = bundle.products?.reduce((acc: string[], product) => {
        if (product.image && product.image.length > 0) {
          acc.push(...product.image);
        }
        return acc;
      }, []) || [];
      
      // Combine bundle images and product images, remove duplicates
      const allImages = [...bundleMainImages, ...productImages];
      return [...new Set(allImages)].filter(img => img);
    }
    const allImages = [product.coverImage, ...(product.additionalImages || [])];
    return allImages.filter(img => img);
  };

  // Handle image scroll for pagination
  const handleImageScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / screenWidth);
    setSelectedIndex(currentIndex);
  };

  // Render image item for FlatList
  const renderImageItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={openImageViewer} activeOpacity={0.8}>
      <Image source={{ uri: item }} style={[styles.image, { width: screenWidth }]} />
    </TouchableOpacity>
  );

  return (
    <>
    {!loading && (
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.imageContainer}>
            <FlatList
              data={getProductImagesArray()}
              renderItem={renderImageItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => `image-${index}`}
            />
            {renderImageIndicators()}
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigateBack}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Product/Bundle name and price */}
            <View style={styles.nameRow}>
              <Text style={styles.title}>{isBundle ? bundle?.name : product.name}</Text>
            </View>

            {/* Price section */}
            <View style={styles.priceSection}>
              <Text style={styles.price}>
                ₱{isBundle ? bundle?.price?.toFixed(2) : product.discountedPrice?.toFixed(2)}
              </Text>
              {isBundle ? (
                bundle?.originalPrice && bundle.originalPrice > bundle.price && (
                  <>
                    <Text style={styles.originalPrice}>₱{bundle.originalPrice?.toFixed(2)}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        -{bundle.discountPercentage?.toFixed(0)}% OFF
                      </Text>
                    </View>
                  </>
                )
              ) : (
                product.originalPrice && product.originalPrice > product.discountedPrice && (
                  <>
                    <Text style={styles.originalPrice}>₱{product.originalPrice?.toFixed(2)}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        -{(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100).toFixed()}% OFF
                      </Text>
                    </View>
                  </>
                )
              )}
            </View>

            {/* Status and Stock Info */}
            <View style={styles.infoRow}>
              <View style={[styles.statusBadge, { 
                backgroundColor: (isBundle ? bundle?.isActive : product.isActive) ? colors.success : colors.warning 
              }]}>
                <Text style={styles.statusText}>
                  {(isBundle ? bundle?.isActive : product.isActive) ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Text style={styles.stockText}>
                Stock: {(isBundle ? bundle?.stock : product.stock) || 0} units
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {isBundle ? bundle?.description : product.description}
              </Text>
            </View>

            {isBundle && bundle?.products && bundle.products.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bundle Products ({bundle.products.length})</Text>
                <View style={styles.bundleProductsContainer}>
                  {bundle.products.map((bundleProduct, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.bundleProductCard}
                      onPress={() => {
                        // Navigate to individual product screen
                        router.push({
                          pathname: "/(main)/products/[product]",
                          params: { product: bundleProduct.id }
                        });
                      }}
                    >
                      {bundleProduct.image && bundleProduct.image.length > 0 && (
                        <Image 
                          source={{ uri: bundleProduct.image[0] }} 
                          style={styles.bundleProductImage}
                        />
                      )}
                      <View style={styles.bundleProductInfo}>
                        <Text style={styles.bundleProductName}>{bundleProduct.name}</Text>
                        <Text style={styles.bundleProductPrice}>₱{bundleProduct.price?.toFixed(2)}</Text>
                        {bundleProduct.originalPrice > bundleProduct.price && (
                          <Text style={styles.bundleProductOriginalPrice}>
                            ₱{bundleProduct.originalPrice?.toFixed(2)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.bundleProductArrow}>
                        <ArrowLeft size={16} color={colors.text.secondary} style={{ transform: [{ rotate: '180deg' }] }} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Product/Bundle Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{isBundle ? 'Bundle' : 'Product'} Details</Text>
              <View style={styles.detailsContainer}>
                {isBundle ? (
                  <>
                    {bundle?.expiresOn && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expires On:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(bundle.expiresOn).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {bundle?.totalCost && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Cost:</Text>
                        <Text style={styles.detailValue}>₱{bundle.totalCost.toFixed(2)}</Text>
                      </View>
                    )}
                    {bundle?.profitMargin && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Profit Margin:</Text>
                        <Text style={styles.detailValue}>{bundle.profitMargin.toFixed(1)}%</Text>
                      </View>
                    )}
                    {bundle?.isDynamicPricingEnabled && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dynamic Pricing:</Text>
                        <Text style={styles.detailValue}>Enabled</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    {product.productType && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Product Type:</Text>
                        <Text style={styles.detailValue}>{product.productType}</Text>
                      </View>
                    )}
                    {product.expirationDate && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expires On:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(product.expirationDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </>
                )}
                {(isBundle ? bundle?.createdAt : product.createdAt) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(isBundle ? bundle!.createdAt : product.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {(isBundle ? bundle?.updatedAt : product.updatedAt) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Updated:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(isBundle ? bundle!.updatedAt : product.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Categories */}
            {product.category && product.category.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoriesContainer}>
                  {product.category.map((category, index) => (
                    <View key={index} style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Product Analytics */}
            {productAnalytics && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Performance</Text>
                <View style={styles.analyticsContainer}>
                  <View style={styles.analyticsGrid}>
                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsCardHeader}>
                        <Eye size={20} color={colors.info} />
                        <Text style={styles.analyticsCardLabel}>Views</Text>
                      </View>
                      <Text style={styles.analyticsCardValue}>{(productAnalytics.totalViews || 0).toLocaleString()}</Text>
                      <Text style={styles.analyticsCardSubtext}>Total impressions</Text>
                    </View>

                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsCardHeader}>
                        <ShoppingCart size={20} color={colors.warning} />
                        <Text style={styles.analyticsCardLabel}>Cart Adds</Text>
                      </View>
                      <Text style={styles.analyticsCardValue}>{(productAnalytics.totalAddToCarts || 0).toLocaleString()}</Text>
                      <Text style={styles.analyticsCardSubtext}>Added to cart</Text>
                    </View>

                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsCardHeader}>
                        <ShoppingBag size={20} color={colors.success} />
                        <Text style={styles.analyticsCardLabel}>Orders</Text>
                      </View>
                      <Text style={styles.analyticsCardValue}>{(productAnalytics.totalOrders || 0).toLocaleString()}</Text>
                      <Text style={styles.analyticsCardSubtext}>Total sold</Text>
                    </View>

                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsCardHeader}>
                        <TrendingUp size={20} color={colors.primary} />
                        <Text style={styles.analyticsCardLabel}>Conversion</Text>
                      </View>
                      <Text style={styles.analyticsCardValue}>{(productAnalytics.conversionRate || 0).toFixed(1)}%</Text>
                      <Text style={styles.analyticsCardSubtext}>Views to orders</Text>
                    </View>
                  </View>

                  <View style={styles.revenueSection}>
                    <Text style={styles.revenueSectionTitle}>Revenue Metrics</Text>
                    <View style={styles.revenueRow}>
                      <View style={styles.revenueItem}>
                        <Text style={styles.revenueLabel}>Total Revenue</Text>
                        <Text style={styles.revenueValue}>₱{(productAnalytics.totalRevenue || 0).toFixed(2)}</Text>
                      </View>
                      <View style={styles.revenueItem}>
                        <Text style={styles.revenueLabel}>Avg Order Value</Text>
                        <Text style={styles.revenueValue}>₱{(productAnalytics.averageOrderValue || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Reviews section */}
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsTitleContainer}>
                <Text style={styles.sectionTitle}>Reviews</Text>
              </View>
              <TouchableOpacity onPress={() => router.push({
                pathname: '/(main)/profile/reviewsSummary',
                params: { productId: product.id, productName: product.name }
              })}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Reviews list */}
            <View style={styles.reviewsContainer}>
              <FlatList
                scrollEnabled={false}
                data={reviews}
                renderItem={({item} : {item : Review}) => <ReviewItem review={item} key={item.id}/>}
                ListEmptyComponent={
                  <View style={styles.noReviewsContainer}>
                    <CookingPot size={60} color={colors.icon.secondary}/>
                    <Text style={styles.noReviewsText}>No Reviews</Text>
                  </View>
                }
                contentContainerStyle={styles.reviewsList}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom bar with Edit and Delete actions */}
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={[styles.deleteButton, loading && styles.disabledButton]} 
              onPress={handleDelete}
              disabled={loading}
            >
              <Trash2 size={20} color={loading ? colors.text.tertiary : colors.danger} />
              <Text style={[styles.deleteButtonText, loading && styles.disabledButtonText]}>
                {loading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, loading && styles.disabledButton]} 
              onPress={navigateToEdit}
              disabled={loading}
            >
              <Edit3 size={20} color={loading ? colors.text.tertiary : colors.white} />
              <Text style={[styles.editButtonText, loading && styles.disabledButtonText]}>
                Edit Product
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Image Viewer Modal */}
        <ImageViewing
          images={getAllProductImages()}
          imageIndex={selectedImageIndex}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      </View>
    )}

    {loading && (
      <View style={[styles.container, styles.loadingContainer]}>
        <Spinner size='giant'/>
      </View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: colors.white,
    width: 12,
    height: 8,
    borderRadius: 6,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 10,
  },
  content: {
    padding: spacing.lg,
  },
  nameRow: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  price: {
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  originalPrice: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  statusBadge: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  stockText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  discountBadge: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  discountText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.lg,
  },
  section: {
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSizes.md * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  detailsContainer: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
    textAlign: "right",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  reviewsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  reviewsContainer: {
    marginBottom: spacing.lg,
  },
  reviewsList: {
    paddingVertical: spacing.sm,
  },
  noReviewsContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  noReviewsText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
  },
  bottomBarContainer: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.dangerSubtle,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    flex: 1,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    flex: 2,
  },
  editButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: colors.text.tertiary,
  },
  // Analytics styles
  analyticsContainer: {
    marginTop: spacing.md,
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  analyticsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    flex: 1,
    minWidth: "45%",
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  analyticsCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  analyticsCardLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  analyticsCardValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  analyticsCardSubtext: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
  },
  revenueSection: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  revenueSectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  revenueRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  revenueItem: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  revenueValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  // Bundle-specific styles
  bundleBadge: {
    backgroundColor: colors.info,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  bundleText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  bundleProductsContainer: {
    gap: spacing.sm,
  },
  bundleProductCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  bundleProductInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  bundleProductName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  bundleProductPrice: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  bundleProductOriginalPrice: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  bundleProductStock: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  bundleProductTags: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  bundleProductTag: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  bundleProductTagText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  bundleProductArrow: {
    marginLeft: spacing.sm,
  },
  bundleProductImage: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },
});
