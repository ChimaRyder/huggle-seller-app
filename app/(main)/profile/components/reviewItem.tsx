import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Card, Icon, IconProps } from '@ui-kitten/components';

interface Review {
  id: string;
  reviewer: string;
  date: string;
  product: string;
  rating: number;
  review: string;
  month: string;
}

interface ReviewItemProps {
  review: Review;
}

const StarIcon = (props : IconProps) => (
  <Icon {...props} name="star" pack="eva" />
);

export default function ReviewItem({ review }: ReviewItemProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          <View style={styles.verticalBar} />
          <View>
            <Text category="s1" style={styles.reviewerName}>{review.reviewer}</Text>
            <Text category="c1" style={styles.reviewInfo}>
              Review on: {review.product}
            </Text>
          </View>
        </View>
        <Text category="c1" style={styles.date}>{review.date}</Text>
      </View>
      
      <Text category="p2" style={styles.reviewText} numberOfLines={3}>
        {review.review}
      </Text>
      
      <View style={styles.ratingContainer}>
        <StarIcon fill="#FFD700" width={16} height={16} />
        <Text category="c1" style={styles.ratingText}>{review.rating}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalBar: {
    width: 4,
    height: 40,
    backgroundColor: '#4CAF50',
    marginRight: 12,
    borderRadius: 2,
  },
  reviewerName: {
    fontWeight: 'bold',
  },
  reviewInfo: {
    color: '#666',
    marginTop: 2,
  },
  date: {
    color: '#666',
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
    color: '#666',
  },
});
