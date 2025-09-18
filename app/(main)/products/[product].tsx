import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Layout, Text, Icon, Button, TopNavigation, TopNavigationAction, Divider, Spinner, IconProps, IconElement, ViewPager, useTheme } from '@ui-kitten/components';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { deleteProduct, getProductbyID } from '@/utils/data/ProductController';
import { Product } from '@/utils/data/ProductController';
import { showToast } from '@/components/Toast';
import { getProductReviews, Review } from '@/utils/data/ReviewsController';
import ReviewItem from '../profile/components/reviewItem';
import { CookingPot, ArrowLeft, Edit3, Trash2 } from 'lucide-react-native';
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
  const [product, setProduct] = useState<Product>({} as Product);
  const [reviews, setReviews] = useState<Review[]>([] as Review[])
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const {getToken} = useAuth();
  const theme = useTheme();
  
  // Find the product based on the ID
  const getProduct = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getProductbyID(productId as string, token ?? "");

      setProduct(((response as any).data));
      await getReviews();
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

  const deleteProd = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await deleteProduct(productId as string, token ?? "");

      router.back();
      showToast('success', 'Product Deleted', `${product.name} has been deleted.`);
    } catch(error) {
      console.error('Error deleting product: ', error);
      showToast('error', 'Uh Oh!', `An error occured while deleting ${product.name}. Please try again later.`);
    } 
  }

  const handleDelete = () => {
    Alert.alert("Delete Product", "Are you sure you want to delete this product?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: deleteProd,
      },
    ]);
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

  return (
    <>
    {!loading && (
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.coverImage }} style={styles.image} />
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
              {product.originalPrice > product.discountedPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    -{(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100).toFixed()}% OFF
                  </Text>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.description}>{product.description}</Text>

              {/* Categories */}
              <View style={styles.categoriesContainer}>
                {product.category?.map((category, index) => (
                  <View key={index} style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Reviews section */}
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsTitleContainer}>
                <Text style={styles.sectionTitle}>Reviews</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(main)/profile/reviewsSummary')}>
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
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={20} color={colors.danger} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={navigateToEdit}>
              <Edit3 size={20} color={colors.white} />
              <Text style={styles.editButtonText}>Edit Product</Text>
            </TouchableOpacity>
          </View>
        </View>
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
});
