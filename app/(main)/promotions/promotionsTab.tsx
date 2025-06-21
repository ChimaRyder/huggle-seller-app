import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Input, Button, Icon, IconProps, IconElement, ThemeType } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import PromotionPost from './components/promotionPost';

// Icons
const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="search-outline" pack="eva" />
);

const PlusIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="plus-outline" pack="eva" />
);

const AlertIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="alert-circle-outline" pack="eva" />
);

// Placeholder data for posts
const placeholderPosts = [
  {
    id: 1,
    content: "🎉 Special offer! Get 20% off on all fresh vegetables this week. Don't miss out on these amazing deals! #FreshFood #Discount",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500"
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    likes: 24,
    views: 156
  },
  {
    id: 2,
    content: "New organic fruits just arrived! Fresh from the farm to your table. Order now and get free delivery on orders above $50.",
    images: [
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500"
    ],
    createdAt: "2024-01-14T15:45:00Z",
    updatedAt: "2024-01-14T15:45:00Z",
    likes: 18,
    views: 89
  },
  {
    id: 3,
    content: "Weekend special: Buy 2 get 1 free on all bakery items! Perfect for your family breakfast. 🥐🥖",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
      "https://images.unsplash.com/photo-1555507036-ab794f4ade2a?w=500",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500"
    ],
    createdAt: "2024-01-13T09:20:00Z",
    updatedAt: "2024-01-13T09:20:00Z",
    likes: 42,
    views: 203
  }
];

interface PromotionsTabProps {
  theme?: ThemeType;
}

const PromotionsTab = ({ theme }: PromotionsTabProps) => {
  const router = useRouter();
  const [posts, setPosts] = useState(placeholderPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(placeholderPosts);

  useEffect(() => {
    const filtered = posts.filter(post =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const handleAddPost = () => {
    router.push('/(main)/promotions/createPost' as any);
  };

  const handleEditPost = (postId: number) => {
    router.push({
      pathname: '/(main)/promotions/editPost' as any,
      params: { postId: postId.toString() }
    });
  };

  const handleDeletePost = (postId: number) => {
    console.log('Deleting post with ID:', postId);
    setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
  };

  const renderPost = ({ item }: { item: any }) => (
    <PromotionPost
      post={item}
      onEdit={() => handleEditPost(item.id)}
      onDelete={() => handleDeletePost(item.id)}
      theme={theme}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header with Search and Add Button */}
      <View style={styles.header}>
        <Input
          placeholder="Search posts..."
          accessoryLeft={SearchIcon}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button
          style={styles.addButton}
          appearance="outline"
          size="small"
          accessoryLeft={PlusIcon}
          onPress={handleAddPost}
        />
      </View>

      {/* Posts List */}
      {filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AlertIcon style={styles.emptyIcon} fill="#C5CEE0" />
          <Text style={styles.emptyTitle} appearance="hint">
            {searchQuery ? 'No posts found' : 'No posts yet'}
          </Text>
          <Text style={styles.emptySubtitle} appearance="hint">
            {searchQuery ? 'Try adjusting your search' : 'Create your first promotional post'}
          </Text>
          <Button
            status="primary"
            size="large"
            onPress={handleAddPost}
            style={styles.createButton}
          >
            Create Post
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderRadius: 8,
  },
  addButton: {
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  postsList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    borderRadius: 8,
  },
});

export default PromotionsTab;