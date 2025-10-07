import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card , useTheme } from '@ui-kitten/components';
import { Star, User } from 'lucide-react-native';
import ImageViewing from 'react-native-image-viewing';
import { Review } from '@/utils/data/ReviewsController';
import { getProductbyID } from '@/utils/Controllers/ProductController';
import { FullProduct } from '@/types/product';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, radii } from '@/constants/theme';



export default function ReviewItem({ review }: {review : Review}) {
  const theme = useTheme();

  const [product, setProduct] = useState<FullProduct>({} as FullProduct);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { getToken } = useAuth();


  const getReviewProduct = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getProductbyID(review.productId, token ?? "");

      setProduct(((response as any).data));
    } catch (error) {
      console.error("Error getting product: ", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getReviewProduct();
    }, [review])
  )

  // Get all available images from the review
  const getReviewImages = () => {
    // Return imageUrls array directly from backend
    return review.imageUrls || [];
  };

  const reviewImages = getReviewImages();

  // Function to open image viewer
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };

  // Prepare images for react-native-image-viewing
  const imageViewerData = reviewImages.map(url => ({ uri: url }));

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={{flexDirection: "row", gap: 10}}>
          <View style={[styles.headerLine, {backgroundColor: theme['color-primary-500']}]}/>
          <View style={styles.metaCol}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 5}}>
              <User size={18} color={theme['color-basic-600']}/>
              <Text category="s2" style={styles.metaText}>{review.buyerName || 'Anonymous'}</Text>
            </View>
            <Text category="p2" appearance='hint' style={styles.metaText}>Review on: {product.name}</Text>
          </View>
        </View>
        <Text category="c1" appearance='hint' style={styles.date}>{new Date(review.createdAt).toLocaleDateString('en-PH', {month: "short", day: "numeric", year: "numeric"})}</Text>
      </View>
      
      {review.content && <Text category="p2" style={styles.reviewText} numberOfLines={3}>
        {review.content}
      </Text>}
      
      {/* Review Images */}
      {reviewImages.length > 0 && (
        <View style={styles.imagesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesScrollContainer}
          >
            {reviewImages.map((imageUrl, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.imageContainer}
                onPress={() => openImageViewer(index)}
              >
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.reviewImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.ratingContainer}>
        <Star fill="#FFD700" color="#FFD700" width={16} height={16} />
        <Text category="c1" style={styles.ratingText}>{review.rating}</Text>
      </View>
      
      {/* Image Viewer Modal */}
      <ImageViewing
        images={imageViewerData}
        imageIndex={selectedImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  metaCol: {
    flexDirection: 'column',
    gap: 4,
  },
  date: {
    alignSelf: 'flex-start',
  },
  metaText: {
    fontSize: 13,
  },
  reviewText: {
    lineHeight: 20,
    marginBottom: 8
  },
  imagesContainer: {
    marginVertical: spacing.sm,
  },
  imagesScrollContainer: {
    gap: spacing.xs,
    paddingHorizontal: 2, // Small padding to prevent clipping
  },
  imageContainer: {
    shadowColor: colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.background.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
  },
  headerLine: {
    minWidth: 4,
    borderRadius: 20
  }
});
