import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, Icon, TopNavigation, Divider, TopNavigationAction } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { IconProps, IconElement, Layout } from '@ui-kitten/components';
import ReviewItem from './components/reviewItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Review } from '@/utils/Controllers/ReviewsController';

const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="ArrowLeft" />
);

// Mock data for reviews
const mockReviews : Review[] = [
  {
    id: '1',
    productId: 'p1',
    buyerId: 'b1',
    orderId: 'o1',
    content: 'I found a very special love in you. It\'s a feeling that\'s totally new. Over and over, it\'s burnin\' inside and I found a very special love in you and it almost breaks me in two',
    imageUrls: [],
    rating: 4.5,
    createdAt: '2025-07-21T08:13:23.715Z',
    updatedAt: '2025-07-21T08:13:23.715Z',
  },
  {
    id: '2',
    productId: 'p2',
    buyerId: 'b2',
    orderId: 'o2',
    content: 'Another review content here.',
    imageUrls: [],
    rating: 5,
    createdAt: '2025-07-22T08:13:23.715Z',
    updatedAt: '2025-07-22T08:13:23.715Z',
  },
  // Add more reviews as needed
];

export default function ReviewsSummaryScreen() {
  const router = useRouter();

  const navigateBack = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
  );

  const renderReview = ({ item }: { item: Review }) => (
    <ReviewItem key={item.id} review={item} />
  );

  return (
    <Layout style={{flex : 1}} level="1">
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopNavigation
          title="Review Summary"
          alignment="center"
          accessoryLeft={navigateBack}
          style={styles.topNavigation}
        />
        <Divider />

        <FlatList
          data={mockReviews}
          renderItem={renderReview}
          keyExtractor={item => item.id}
          style={styles.scrollView}
          contentContainerStyle={{ padding: 16 }}
        />
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavigation: {
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
