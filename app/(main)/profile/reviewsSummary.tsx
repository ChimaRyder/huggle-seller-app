import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Icon, TopNavigation, Divider } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { IconProps, IconElement } from '@ui-kitten/components';
import ReviewItem from './components/reviewItem';
import { SafeAreaView } from 'react-native-safe-area-context';

const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

interface Review {
  id: string;
  reviewer: string;
  date: string;
  product: string;
  rating: number;
  review: string;
  month: string;
}

// Mock data for reviews
const mockReviews : Review[] = [
  {
    id: '1',
    reviewer: 'Sarah Geronimo',
    date: 'Aug 25',
    product: 'Turtle Pie',
    rating: 4.5,
    review: 'I found a very special love in you. It\'s a feeling that\'s totally new. Over and over, it\'s burnin\' inside and I found a very special love in you and it almost breaks me in two',
    month: 'This month'
  },
  {
    id: '2',
    reviewer: 'Sarah Geronimo',
    date: 'Aug 25',
    product: 'Turtle Pie',
    rating: 4.5,
    review: 'I found a very special love in you. It\'s a feeling that\'s totally new. Over and over, it\'s burnin\' inside and I found a very special love in you and it almost breaks me in two',
    month: 'This month'
  },
  {
    id: '3',
    reviewer: 'Sarah Geronimo',
    date: 'Aug 25',
    product: 'Turtle Pie',
    rating: 4.5,
    review: 'I found a very special love in you. It\'s a feeling that\'s totally new. Over and over, it\'s burnin\' inside and I found a very special love in you and it almost breaks me in two',
    month: 'This month'
  },
  {
    id: '4',
    reviewer: 'Sarah Geronimo',
    date: 'Jun 29',
    product: 'Turtle Pie',
    rating: 4.5,
    review: 'I found a very special love in you. It\'s a feeling that\'s totally new. Over and over, it\'s burnin\' inside and I found a very special love in you and it almost breaks me in two',
    month: 'Previous'
  },
];

export default function ReviewsSummaryScreen() {
  const router = useRouter();

  const navigateBack = () => {
    router.back();
  };

  // Group reviews by month
  const groupedReviews = mockReviews.reduce((acc : { [key: string]: Review[] }, review : Review) => {
    const { month } = review;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(review);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNavigation
        title="Review Summary"
        alignment="center"
        accessoryLeft={() => (
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <BackIcon fill="#000" width={24} height={24} />
          </TouchableOpacity>
        )}
        style={styles.topNavigation}
      />
      <Divider />

      <ScrollView style={styles.scrollView}>
        {Object.entries(groupedReviews).map(([month, reviews]) => (
          <View key={month} style={styles.sectionContainer}>
            <Text category="h6" style={styles.sectionTitle}>{month}</Text>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  topNavigation: {
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
});
