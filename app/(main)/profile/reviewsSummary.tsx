import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MessageCircle, User, Filter } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { Review, getReviews, getProductReviews } from '@/utils/data/ReviewsController';
import { getProductbyID } from '@/utils/Controllers/ProductController';
import { FullProduct } from '@/types/product';
import { Buyer, getBuyer } from '@/utils/data/BuyerController';
import { useAuth, useUser } from '@clerk/clerk-expo';
import ImageViewing from 'react-native-image-viewing';


const ReviewCard = ({ review, hideProductName = false }: { review: Review; hideProductName?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { getToken } = useAuth();

  // Load product and buyer data from API
  useEffect(() => {
    const loadProductAndBuyer = async () => {
      try {
        const token = await getToken({ template: "seller_app" });
        
        // Load product data
        if (review.productId && token) {
          try {
            const productResponse = await getProductbyID(review.productId, token);
            setProduct((productResponse as any).data);
          } catch (error) {
            console.error('Error loading product:', error);
            setProduct({ name: 'Unknown Product' } as FullProduct);
          }
        }
        
        // For buyer data, we'll use the buyerName from the review if available
        // or set a default name since we don't have a buyer API endpoint yet
        setBuyer({ 
          name: review.buyerName || 'Anonymous Customer' 
        } as Buyer);
        
      } catch (error) {
        console.error('Error in loadProductAndBuyer:', error);
        setProduct({ name: 'Unknown Product' } as FullProduct);
        setBuyer({ name: 'Anonymous Customer' } as Buyer);
      }
    };
    
    loadProductAndBuyer();
  }, [review, getToken]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const shouldShowExpanded = expanded;
  const messageToShow = shouldShowExpanded ? review.content : review.content?.slice(0, 100) + (review.content && review.content.length > 100 ? '...' : '');

  // Function to open image viewer
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };

  // Prepare images for react-native-image-viewing
  const imageViewerData = (review.imageUrls || []).map(url => ({ uri: url }));

  return (
    <View style={styles.reviewCard}>
      <View style={styles.accentLine} />
      <View style={styles.reviewContent}>
        {/* Header */}
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <User size={16} color={colors.text.secondary} />
              <Text style={styles.reviewerName}>{buyer?.name || 'Loading...'}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(review.createdAt)}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Star size={16} color={colors.warning} fill={colors.warning} />
            <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Product name */}
        {!hideProductName && (
          <View style={styles.productNameContainer}>
            <Text style={styles.productNameText}>Review on: {product?.name || 'Loading...'}</Text>
          </View>
        )}

        {/* Message */}
        {review.content && (
          <View style={styles.messageContainer}>
            <Text style={styles.message} numberOfLines={shouldShowExpanded ? undefined : 3}>
              {messageToShow}
            </Text>
            {review.content.length > 100 && (
              <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                style={styles.expandButton}
              >
                <Text style={styles.expandButtonText}>
                  {expanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Images */}
        {review.imageUrls && review.imageUrls.length > 0 && (
          <View style={styles.imagesContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={review.imageUrls}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={styles.imageContainer}
                  onPress={() => openImageViewer(index)}
                >
                  <Image 
                    source={{ uri: item }} 
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
      
      {/* Image Viewer Modal */}
      <ImageViewing
        images={imageViewerData}
        imageIndex={selectedImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
};

export default function ReviewsSummaryScreen() {
  const router = useRouter();
  const { productId, productName } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Load reviews from API
  const loadReviews = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "seller_app" });
      
      if (!token) {
        console.error('No authentication token available');
        setAllReviews([]);
        setReviews([]);
        setFilteredReviews([]);
        return;
      }
      
      let reviewsData: Review[] = [];
      
      if (productId) {
        // Get reviews for specific product
        console.log('Loading reviews for product:', productId);
        const response = await getProductReviews(token, productId as string);
        reviewsData = (response as any).data || [];
        console.log('Product reviews loaded:', reviewsData.length);
      } else {
        // Get all store reviews
        const storeId = user?.publicMetadata?.storeId as string;
        console.log('Loading reviews for store:', storeId);
        
        if (storeId) {
          const response = await getReviews(token, storeId);
          reviewsData = (response as any).data || [];
          console.log('Store reviews loaded:', reviewsData.length);
        } else {
          console.error('No store ID available');
        }
      }
      
      setAllReviews(reviewsData);
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
      
    } catch (error) {
      console.error('Error loading reviews:', error);
      setAllReviews([]);
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId, user?.publicMetadata?.storeId]);

  // Filter reviews by rating
  const applyRatingFilter = (rating: number | null) => {
    setFilterRating(rating);
    let filtered = allReviews;
    
    if (rating !== null) {
      if (rating === 5) {
        filtered = allReviews.filter(review => review.rating === 5);
      } else {
        filtered = allReviews.filter(review => review.rating >= rating && review.rating < rating + 1);
      }
    }
    
    setFilteredReviews(filtered);
    setShowFilterOptions(false);
  };

  const handleRefresh = useCallback(() => {
    loadReviews();
  }, [productId]);

  // Use filtered reviews for display
  const displayReviews = filteredReviews;

  // Calculate rating statistics based on all reviews (not filtered)
  const ratingStats = {
    total: allReviews.length,
    average: allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0,
    distribution: {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating >= 4 && r.rating < 5).length,
      3: allReviews.filter(r => r.rating >= 3 && r.rating < 4).length,
      2: allReviews.filter(r => r.rating >= 2 && r.rating < 3).length,
      1: allReviews.filter(r => r.rating >= 1 && r.rating < 2).length,
    },
    withPhotos: allReviews.filter(r => r.imageUrls && r.imageUrls.length > 0).length,
  };

  const renderReview = ({ item }: { item: Review }) => (
    <ReviewCard review={item} hideProductName={!!productId} />
  );

  const renderFilterOptions = () => (
    <View style={styles.filterOptionsContainer}>
      <TouchableOpacity
        style={[styles.filterOption, filterRating === null && styles.activeFilterOption]}
        onPress={() => applyRatingFilter(null)}
      >
        <Text style={[styles.filterOptionText, filterRating === null && styles.activeFilterOptionText]}>All</Text>
      </TouchableOpacity>
      {[5, 4, 3, 2, 1].map((rating) => (
        <TouchableOpacity
          key={rating}
          style={[styles.filterOption, filterRating === rating && styles.activeFilterOption]}
          onPress={() => applyRatingFilter(rating)}
        >
          <View style={styles.filterOptionContent}>
            <Star size={14} color={filterRating === rating ? colors.text.inverse : colors.warning} fill={colors.warning} />
            <Text style={[styles.filterOptionText, filterRating === rating && styles.activeFilterOptionText]}>{rating}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{productId ? 'Product Reviews' : 'Store Reviews'}</Text>
          <Text style={styles.headerSubtitle}>
            {productId && productName ? `${productName} - ` : ''}{ratingStats.total} Reviews
          </Text>
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterOptions(!showFilterOptions)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Filter Options */}
      {showFilterOptions && renderFilterOptions()}

      {/* Rating Overview */}
      {allReviews.length > 0 && (
        <View style={styles.ratingOverviewContainer}>
          <View style={styles.ratingOverview}>
            <Text style={styles.averageRating}>{ratingStats.average.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  color={star <= Math.round(ratingStats.average) ? colors.warning : colors.border.primary}
                  fill={star <= Math.round(ratingStats.average) ? colors.warning : 'transparent'}
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>{ratingStats.total} reviews</Text>
          </View>

          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.ratingBarRow}>
                <View style={styles.ratingLabelContainer}>
                  <Text style={styles.ratingLabel}>{rating}</Text>
                  <Star size={12} color={colors.warning} fill={colors.warning} />
                  <Text style={styles.ratingCount}>
                    ({ratingStats.distribution[rating as keyof typeof ratingStats.distribution]})
                  </Text>
                </View>
                <View style={styles.ratingBar}>
                  <View
                    style={[
                      styles.ratingBarFill,
                      { width: `${ratingStats.total > 0 ? (ratingStats.distribution[rating as keyof typeof ratingStats.distribution] / ratingStats.total) * 100 : 0}%` }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Reviews List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : displayReviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageCircle size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>
            {productId
              ? `No reviews have been submitted for ${productName || 'this product'} yet.`
              : 'Your customers\' reviews will appear here once they start reviewing your products.'
            }
          </Text>
          {!productId && (
            <Text style={styles.debugText}>
              Store ID: {user?.publicMetadata?.storeId || 'Not found'}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={displayReviews}
          renderItem={renderReview}
          keyExtractor={item => item.id}
          style={styles.reviewsList}
          contentContainerStyle={styles.reviewsListContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
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
    marginTop: 2,
  },

  // Rating Overview
  ratingOverviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  ratingOverview: {
    alignItems: "center",
    marginRight: spacing.xl,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: spacing.xs,
  },
  totalReviews: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  ratingBars: {
    flex: 1,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  ratingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 50,
  },
  ratingLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    marginRight: 2,
  },
  ratingBar: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border.primary,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 5,
  },
  ratingCount: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },

  // Reviews List
  reviewsList: {
    flex: 1,
  },
  reviewsListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Review Card
  reviewCard: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    marginVertical: spacing.sm,
    minHeight: 80,
    alignItems: "stretch",
  },
  accentLine: {
    width: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
  },
  reviewContent: {
    flex: 1,
    padding: spacing.lg,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  dateText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
    marginLeft: spacing.xs,
  },
  productNameContainer: {
    marginBottom: spacing.sm,
  },
  productNameText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  expandButton: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
  },
  expandButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  imagesContainer: {
    marginTop: spacing.sm,
  },
  imageContainer: {
    width: 60,
    height: 60,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 24,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: radii.sm,
    backgroundColor: colors.background.secondary,
  },
  
  // Filter styles
  filterButton: {
    padding: spacing.sm,
    backgroundColor: colors.background.successSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  activeFilterOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterOptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  activeFilterOptionText: {
    color: colors.text.inverse,
  },
  
  // Loading and debug styles
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  debugText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
