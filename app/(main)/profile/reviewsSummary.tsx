import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MessageCircle, User } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { Review } from '@/utils/data/ReviewsController';
import { Product, getProductbyID } from '@/utils/data/ProductController';
import { Buyer, getBuyer } from '@/utils/data/BuyerController';
import { useAuth, useUser } from '@clerk/clerk-expo';

// Mock reviews data using the actual Review interface
const mockReviews: Review[] = [
  {
    id: '1',
    productId: 'p1',
    buyerId: 'b1',
    orderId: 'o1',
    content: 'I found a very special love in you. It\'s a feeling that\'s totally new. Over and over, it\'s burnin\' inside and I found a very special love in you and it almost breaks me in two',
    imageUrls: [],
    rating: 4.5,
    createdAt: '2025-01-20T08:13:23.715Z',
    updatedAt: '2025-01-20T08:13:23.715Z',
  },
  {
    id: '2',
    productId: 'p2',
    buyerId: 'b2',
    orderId: 'o2',
    content: 'Amazing quality vegetables! Fresh, crispy, and delivered quickly. Will definitely order again. The packaging was also very good.',
    imageUrls: [],
    rating: 5,
    createdAt: '2025-01-19T08:13:23.715Z',
    updatedAt: '2025-01-19T08:13:23.715Z',
  },
  {
    id: '3',
    productId: 'p3',
    buyerId: 'b3',
    orderId: 'o3',
    content: 'Good quality but could be better.',
    imageUrls: [],
    rating: 3,
    createdAt: '2025-01-18T08:13:23.715Z',
    updatedAt: '2025-01-18T08:13:23.715Z',
  },
  {
    id: '4',
    productId: 'p4',
    buyerId: 'b4',
    orderId: 'o4',
    content: 'Perfect vegetables! Fresh and exactly what I was looking for.',
    imageUrls: [],
    rating: 5,
    createdAt: '2025-01-17T08:13:23.715Z',
    updatedAt: '2025-01-17T08:13:23.715Z',
  },
  {
    id: '5',
    productId: 'p5',
    buyerId: 'b5',
    orderId: 'o5',
    content: 'Excellent product quality and fast delivery. Highly recommended!',
    imageUrls: [],
    rating: 4,
    createdAt: '2025-01-16T08:13:23.715Z',
    updatedAt: '2025-01-16T08:13:23.715Z',
  },
];

const ReviewCard = ({ review, hideProductName = false }: { review: Review; hideProductName?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const { getToken } = useAuth();

  // For mock data, we'll use placeholder data instead of API calls
  useEffect(() => {
    // Simulate product and buyer data for mock reviews
    const mockProducts: { [key: string]: string } = {
      'p1': 'Fresh Organic Tomatoes',
      'p2': 'Organic Carrots Bundle',
      'p3': 'Fresh Spinach Leaves',
      'p4': 'Organic Bell Peppers',
      'p5': 'Fresh Cucumber',
    };

    const mockBuyers: { [key: string]: string } = {
      'b1': 'Sarah M.',
      'b2': 'John D.',
      'b3': 'Emily R.',
      'b4': 'Mike L.',
      'b5': 'Lisa K.',
    };

    // Set mock data
    setProduct({ name: mockProducts[review.productId] || 'Unknown Product' } as Product);
    setBuyer({ name: mockBuyers[review.buyerId] || 'Anonymous User' } as Buyer);
  }, [review]);

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
              renderItem={({ item }) => (
                <View style={styles.imageContainer}>
                  <Text style={styles.imagePlaceholder}>📷</Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default function ReviewsSummaryScreen() {
  const router = useRouter();
  const { productId, productName } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews] = useState<Review[]>(mockReviews);

  // Load reviews based on whether we're filtering by product or showing all
  useEffect(() => {
    if (productId) {
      // Filter reviews for specific product
      const productReviews = allReviews.filter(review => review.productId === productId);
      setReviews(productReviews);
    } else {
      // Show all reviews
      setReviews(allReviews);
    }
  }, [productId, allReviews]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      // Reload reviews based on productId
      if (productId) {
        const productReviews = allReviews.filter(review => review.productId === productId);
        setReviews(productReviews);
      } else {
        setReviews(allReviews);
      }
    }, 1000);
  }, [productId, allReviews]);

  // Calculate rating statistics
  const ratingStats = {
    total: reviews.length,
    average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
    distribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating >= 4 && r.rating < 5).length,
      3: reviews.filter(r => r.rating >= 3 && r.rating < 4).length,
      2: reviews.filter(r => r.rating >= 2 && r.rating < 3).length,
      1: reviews.filter(r => r.rating >= 1 && r.rating < 2).length,
    },
    withPhotos: reviews.filter(r => r.imageUrls && r.imageUrls.length > 0).length,
  };

  const renderReview = ({ item }: { item: Review }) => (
    <ReviewCard review={item} hideProductName={!!productId} />
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
      </View>

      {/* Rating Overview */}
      {reviews.length > 0 && (
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
      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageCircle size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>
            {productId
              ? `No reviews have been submitted for ${productName || 'this product'} yet.`
              : 'Your customers\' reviews will appear here once they start reviewing your products.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
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
});