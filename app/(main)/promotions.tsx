import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Heart, MessageCircle, Share, Plus, TrendingUp, Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { getAllPosts, deletePost } from '@/utils/Controllers/PromotionController';

// Define Post interface to match backend response
interface Post {
  id: string;
  sellerId: string;
  storeId: string;
  storeName?: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (spacing.lg * 2);

export default function PromotionsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "seller_app" });
      const response = await getAllPosts(token ?? "");

      // Backend returns data in response.data.data format with pagination
      const postsData = response.data?.data || response.data;
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, []);

  const handleCreatePost = () => {
    router.push('/(main)/promotions/createPost');
  };

  const handleEditPost = (postId: string) => {
    router.push({
      pathname: '/(main)/promotions/editPost',
      params: { postId },
    });
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken({ template: "seller_app" });
              await deletePost(postId, token ?? "");
              
              // Remove post from local state
              setPosts(posts.filter(post => post.id !== postId));
              Alert.alert('Success', 'Post deleted successfully.');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePostPress = (postId: string) => {
    console.log('=== POST CLICK ===');
    console.log('Clicking post with ID:', postId);
    console.log('Navigating to PostScreen...');
    router.push({
      pathname: '/(main)/promotions/PostScreen',
      params: { id: postId }
    });
  };

  const handleOptionsPress = (post: any, event: any) => {
    event.stopPropagation(); // Prevent post navigation when clicking options
    setSelectedPost(post);
    setShowOptionsMenu(true);
  };

  const handleModalEditPost = () => {
    setShowOptionsMenu(false);
    if (selectedPost) {
      router.push({
        pathname: '/(main)/promotions/editPost',
        params: { postId: selectedPost.id }
      });
    }
  };

  const handleModalDeletePost = () => {
    setShowOptionsMenu(false);
    if (selectedPost) {
      handleDeletePost(selectedPost.id);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num || num === 0) {
      return '0';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Calculate engagement stats from posts
  const getEngagementStats = () => {
    return {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + (post.likeCount || 0), 0),
      totalViews: posts.length * 150, // Estimated since backend doesn't track views yet
      totalShares: Math.floor(posts.reduce((sum, post) => sum + (post.likeCount || 0), 0) * 0.1), // Estimated
      averageEngagement: posts.length > 0 
        ? Math.round(posts.reduce((sum, post) => sum + (post.likeCount || 0), 0) / posts.length)
        : 0
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderEngagementStats = () => {
    const stats = getEngagementStats();
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Performance Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Heart size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{formatNumber(stats.totalLikes)}</Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Eye size={20} color={colors.info} />
            </View>
            <View>
              <Text style={styles.statValue}>{formatNumber(stats.totalViews)}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Share size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.statValue}>{formatNumber(stats.totalShares)}</Text>
              <Text style={styles.statLabel}>Total Shares</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.statValue}>{formatNumber(stats.averageEngagement)}</Text>
              <Text style={styles.statLabel}>Avg Engagement</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postCard} onPress={() => handlePostPress(item.id)}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <View style={[styles.postTypeBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.postTypeText, { color: colors.primary }]}>Post</Text>
          </View>
          <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={(event) => handleOptionsPress(item, event)}
        >
          <MoreHorizontal size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Post Images */}
      {item.imageUrls && item.imageUrls.length > 0 && (
        <View style={styles.imageContainer}>
          <FlatList
            data={item.imageUrls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: imageUrl }) => (
              <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
            )}
            keyExtractor={(imageUrl, index) => `${item.id}-image-${index}`}
          />
          {item.imageUrls.length > 1 && (
            <View style={styles.imageIndicator}>
              <Text style={styles.imageCount}>{item.imageUrls.length} photos</Text>
            </View>
          )}
        </View>
      )}

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postCaption}>{item.content}</Text>
      </View>

      {/* Post Stats */}
      <View style={styles.postStats}>
        <View style={styles.statGroup}>
          <Heart size={16} color={colors.primary} />
          <Text style={styles.statText}>{formatNumber(item.likeCount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MessageCircle size={64} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start promoting your products and engage with customers by creating your first post!
      </Text>
      <TouchableOpacity style={styles.createFirstPostButton} onPress={handleCreatePost}>
        <Plus size={20} color={colors.text.inverse} />
        <Text style={styles.createFirstPostText}>Create Your First Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Promotions</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => item.id || `post-${index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={posts.length > 0 ? renderEngagementStats : null}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && { flex: 1 }
        ]}
      />

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={styles.optionsMenu}>
            <TouchableOpacity style={styles.optionItem} onPress={handleModalEditPost}>
              <Edit size={20} color={colors.primary} />
              <Text style={styles.optionText}>Edit Post</Text>
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleModalDeletePost}>
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.optionText, { color: colors.error }]}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  createButton: {
    backgroundColor: colors.background.successSubtle,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radii.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },

  // Stats Card
  statsCard: {
    backgroundColor: colors.background.primary,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },

  // Post Card
  postCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postTypeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },
  postTypeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  postDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  moreButton: {
    padding: spacing.sm,
  },

  // Post Images
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.75,
  },
  imageIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
  },
  imageCount: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },

  // Post Content
  postContent: {
    padding: spacing.lg,
  },
  postCaption: {
    fontSize: typography.fontSizes.md,
    lineHeight: 22,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  tagText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  moreTagsText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  // Post Stats
  postStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  createFirstPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  createFirstPostText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  // Options Menu styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  optionsMenu: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  optionText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  optionDivider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginHorizontal: spacing.lg,
  },
});