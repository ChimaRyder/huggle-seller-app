import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card } from '@ui-kitten/components';
import { Star, User } from 'lucide-react-native';
import { useTheme } from '@ui-kitten/components';
import { Review } from '@/utils/Controllers/ReviewsController';
import { getProductbyID, Product } from '@/utils/Controllers/ProductController';
import { Buyer, getBuyer } from '@/utils/Controllers/BuyerController';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect } from 'expo-router';



export default function ReviewItem({ review }: {review : Review}) {
  const theme = useTheme();

  const [product, setProduct] = useState<Product>({} as Product);
  const [buyer, setBuyer] = useState<Buyer>({} as Buyer);
  const { getToken } = useAuth();

  const getReviewBuyer = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getBuyer(token ?? "", review.buyerId);

      setBuyer(response.data);
    } catch (error) {
      console.error("Error getting buyer: ", error);
    }
  }

  const getReviewProduct = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getProductbyID(review.productId, token ?? "");

      setProduct(response.data);
    } catch (error) {
      console.error("Error getting product: ", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getReviewBuyer();
      getReviewProduct();
    }, [review])
  )

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={{flexDirection: "row", gap: 10}}>
          <View style={[styles.headerLine, {backgroundColor: theme['color-primary-500']}]}/>
          <View style={styles.metaCol}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 5}}>
              <User size={18} color={theme['color-basic-600']}/>
              <Text category="s2" style={styles.metaText}>{buyer.name}</Text>
            </View>
            <Text category="p2" appearance='hint' style={styles.metaText}>Review on: {product.name}</Text>
          </View>
        </View>
        <Text category="c1" appearance='hint' style={styles.date}>{new Date(review.createdAt).toLocaleDateString('en-PH', {month: "short", day: "numeric", year: "numeric"})}</Text>
      </View>
      {review.content && <Text category="p2" style={styles.reviewText} numberOfLines={3}>
        {review.content}
      </Text>}
      <View style={styles.ratingContainer}>
        <Star fill="#FFD700" color="#FFD700" width={16} height={16} />
        <Text category="c1" style={styles.ratingText}>{review.rating}</Text>
      </View>
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
