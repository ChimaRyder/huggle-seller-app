import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Alert, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Layout, Text, Icon, Button, TopNavigation, TopNavigationAction, Divider, Spinner, IconProps, IconElement, ViewPager, useTheme } from '@ui-kitten/components';
import ImageViewing from 'react-native-image-viewing';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { deleteProduct, getProductbyID } from '@/utils/Controllers/ProductController';
import { FullProduct } from '@/types/product';
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
  const [reviews, setReviews] = useState<Review[]>([] as Review[])
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [productAnalytics, setProductAnalytics] = useState<ProductPerformanceResponse | null>(null);
  const {getToken} = useAuth();
  const theme = useTheme();
  
  // Find the product based on the ID
  const getProduct = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const [productResponse, reviewsResponse, analyticsResponse] = await Promise.all([
        getProductbyID(productId as string, token ?? ""),
        getProductReviews(token ?? "", productId as string),
        getProductPerformance(token ?? "", productId as string)
      ]);

      setProduct(((productResponse as any).data));
      setReviews(((reviewsResponse as any).data).slice(0, 5));
      setProductAnalytics((analyticsResponse as any).data);
    } catch(error) {
      console.error('Error getting product: ', error);
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
      const token = await getToken({template: "seller_app"});
      const [productResponse, reviewsResponse, analyticsResponse] = await Promise.all([
        getProductbyID(productId as string, token ?? ""),
        getProductReviews(token ?? "", productId as string),
        getProductPerformance(token ?? "", productId as string)
      ]);

      setProduct(((productResponse as any).data));
      setReviews(((reviewsResponse as any).data).slice(0, 5));
      setProductAnalytics((analyticsResponse as any).data);
    } catch(error) {
      console.error('Error refreshing product: ', error);
      showToast('error', 'Refresh Failed', 'Unable to refresh product data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const deleteProd = async () => {
    try {
      setLoading(true);
      
      console.log('🗑️ [ProductPage] Starting product deletion...', {
        productId: productId,
        productName: product.name
      });
      
      const token = await getToken({template: "seller_app"});
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const response = await deleteProduct(productId as string, token);
      
      console.log('✅ [ProductPage] Product deleted successfully');
      
      // Navigate back first, then show success message
      router.back();
      
      // Small delay to ensure navigation completes before showing toast
      setTimeout(() => {
        showToast('success', 'Product Deleted', `${product.name} has been deleted successfully.`);
      }, 100);
      
    } catch(error: any) {
      console.error('❌ [ProductPage] Error deleting product:', error);
      
      let errorMessage = `An error occurred while deleting ${product.name}. Please try again.`;
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
    Alert.alert(
      "Delete Product", 
      `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone and will permanently remove the product from your store.`, 
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
      params: { productId: product.id }
    });
  };

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const renderImageIndicators = () => {
    const totalImages = 1 + (product.additionalImages?.length || 0);
    return (
      <View style={styles.indicatorContainer}>
        {Array.from({ length: totalImages }).map((_, index) => (
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
    const allImages = [product.coverImage, ...(product.additionalImages || [])];
    const imageViewerData = allImages.filter(img => img).map(url => ({ uri: url }));
    setSelectedImageIndex(0);
    setImageViewerVisible(true);
  };

  // Prepare images for react-native-image-viewing
  const getAllProductImages = () => {
    const allImages = [product.coverImage, ...(product.additionalImages || [])];
    return allImages.filter(img => img).map(url => ({ uri: url }));
  };

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
            <TouchableOpacity onPress={openImageViewer} activeOpacity={0.8}>
              <Image source={{ uri: product.coverImage }} style={styles.image} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigateBack}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Product name and price */}
            <View style={styles.nameRow}>
              <Text style={styles.title}>{product.name}</Text>
            </View>

            {/* Price section */}
            <View style={styles.priceSection}>
              <Text style={styles.price}>₱{product.discountedPrice?.toFixed(2)}</Text>
              {product.originalPrice && product.originalPrice > product.discountedPrice && (
                <>
                  <Text style={styles.originalPrice}>₱{product.originalPrice?.toFixed(2)}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      -{(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100).toFixed()}% OFF
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Status and Stock Info */}
            <View style={styles.infoRow}>
              <View style={[styles.statusBadge, { backgroundColor: product.isActive ? colors.success : colors.warning }]}>
                <Text style={styles.statusText}>{product.isActive ? 'Active' : 'Inactive'}</Text>
              </View>
              <Text style={styles.stockText}>Stock: {product.stock || 0} units</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>

            {/* Product Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <View style={styles.detailsContainer}>
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
                {product.createdAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {product.updatedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Updated:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(product.updatedAt).toLocaleDateString()}
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
                      <Text style={styles.analyticsCardValue}>{productAnalytics.totalViews.toLocaleString()}</Text>
                      <Text style={styles.analyticsCardSubtext}>Total impressions</Text>
                    </View>

                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsCardHeader}>
                        <ShoppingCart size={20} color={colors.warning} />
                        <Text style={styles.analyticsCardLabel}>Cart Adds</Text>
                      </View>
                      <Text style={styles.analyticsCardValue}>{productAnalytics.totalAddToCarts.toLocaleString()}</Text>
                      <Text style={styles.analyticsCardSubtext}>Added to cart</Text>
                    </View>

                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsCardHeader}>
                        <ShoppingBag size={20} color={colors.success} />
                        <Text style={styles.analyticsCardLabel}>Orders</Text>
                      </View>
                      <Text style={styles.analyticsCardValue}>{productAnalytics.totalOrders.toLocaleString()}</Text>
                      <Text style={styles.analyticsCardSubtext}>Total sold</Text>
                    </View>

                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsCardHeader}>
                        <TrendingUp size={20} color={colors.primary} />
                        <Text style={styles.analyticsCardLabel}>Conversion</Text>
                      </View>
                      <Text style={styles.analyticsCardValue}>{productAnalytics.conversionRate.toFixed(1)}%</Text>
                      <Text style={styles.analyticsCardSubtext}>Views to orders</Text>
                    </View>
                  </View>

                  <View style={styles.revenueSection}>
                    <Text style={styles.revenueSectionTitle}>Revenue Metrics</Text>
                    <View style={styles.revenueRow}>
                      <View style={styles.revenueItem}>
                        <Text style={styles.revenueLabel}>Total Revenue</Text>
                        <Text style={styles.revenueValue}>₱{productAnalytics.totalRevenue.toFixed(2)}</Text>
                      </View>
                      <View style={styles.revenueItem}>
                        <Text style={styles.revenueLabel}>Avg Order Value</Text>
                        <Text style={styles.revenueValue}>₱{productAnalytics.averageOrderValue.toFixed(2)}</Text>
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
});
