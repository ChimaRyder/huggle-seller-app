import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card } from '@ui-kitten/components';
import { Star, User } from 'lucide-react-native';
import { useTheme } from '@ui-kitten/components';

interface Review {
  id: string;
  productId: string;
  buyerId: string;
  orderId: string;
  content: string;
  imageUrls: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewItemProps {
  review: Review;
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const theme = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={{flexDirection: "row", gap: 10}}>
          <View style={[styles.headerLine, {backgroundColor: theme['color-primary-500']}]}/>
          <View style={styles.metaCol}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <User size={18} color={theme['color-basic-100']}/>
              <Text category="s2" style={styles.metaText}> Frenz Repunte</Text>
            </View>
            <Text category="p2" appearance='hint' style={styles.metaText}>Review on: Bananas</Text>
          </View>
        </View>
        <Text category="c1" appearance='hint' style={styles.date}>{new Date(review.createdAt).toLocaleDateString('en-PH', {month: "short", day: "numeric", year: "numeric"})}</Text>
      </View>
      <Text category="p2" style={styles.reviewText} numberOfLines={3}>
        {review.content}
      </Text>
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
    marginBottom: 4,
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
    marginVertical: 8,
    lineHeight: 20,
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
