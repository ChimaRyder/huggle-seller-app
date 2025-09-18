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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Heart, MessageCircle, Share, Plus, TrendingUp, Eye, MoreHorizontal } from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { mockPosts, mockEngagementStats, type MockPost } from '@/data/mockPromotionData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (spacing.lg * 2);

export default function PromotionsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [posts, setPosts] = useState<MockPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
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
          onPress: () => {
            setPosts(posts.filter(post => post.id !== postId));
            // In real app, would call API to delete
          },
        },
      ]
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getPostTypeColor = (type: MockPost['postType']) => {
    switch (type) {
      case 'product_promotion': return colors.primary;
      case 'sale': return colors.warning;
      case 'event': return colors.info;
      case 'announcement': return colors.success;
      default: return colors.text.secondary;
    }
  };

  const getPostTypeLabel = (type: MockPost['postType']) => {
    switch (type) {
      case 'product_promotion': return 'Product';
      case 'sale': return 'Sale';
      case 'event': return 'Event';
      case 'announcement': return 'News';
      default: return 'Post';
    }
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

  const renderEngagementStats = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Performance Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Heart size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{formatNumber(mockEngagementStats.totalLikes)}</Text>
            <Text style={styles.statLabel}>Total Likes</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Eye size={20} color={colors.info} />
          </View>
          <View>
            <Text style={styles.statValue}>{formatNumber(mockEngagementStats.totalViews)}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Share size={20} color={colors.success} />
          </View>
          <View>
            <Text style={styles.statValue}>{formatNumber(mockEngagementStats.totalShares)}</Text>
            <Text style={styles.statLabel}>Total Shares</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <TrendingUp size={20} color={colors.warning} />
          </View>
          <View>
            <Text style={styles.statValue}>{formatNumber(mockEngagementStats.averageEngagement)}</Text>
            <Text style={styles.statLabel}>Avg Engagement</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: MockPost }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <View style={[styles.postTypeBadge, { backgroundColor: getPostTypeColor(item.postType) + '20' }]}>
            <Text style={[styles.postTypeText, { color: getPostTypeColor(item.postType) }]}>
              {getPostTypeLabel(item.postType)}
            </Text>
          </View>
          <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Post Options',
              'What would you like to do?',
              [
                { text: 'Edit', onPress: () => handleEditPost(item.id) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeletePost(item.id) },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <MoreHorizontal size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Post Images */}
      {item.images.length > 0 && (
        <View style={styles.imageContainer}>
          <FlatList
            data={item.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: imageUrl }) => (
              <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
            )}
            keyExtractor={(imageUrl, index) => `${item.id}-image-${index}`}
          />
          {item.images.length > 1 && (
            <View style={styles.imageIndicator}>
              <Text style={styles.imageCount}>{item.images.length} photos</Text>
            </View>
          )}
        </View>
      )}

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postCaption}>{item.caption}</Text>

        {/* Post Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </View>

      {/* Post Stats */}
      <View style={styles.postStats}>
        <View style={styles.statGroup}>
          <Heart size={16} color={colors.primary} />
          <Text style={styles.statText}>{formatNumber(item.likes)}</Text>
        </View>
        <View style={styles.statGroup}>
          <Eye size={16} color={colors.info} />
          <Text style={styles.statText}>{formatNumber(item.views)}</Text>
        </View>
        <View style={styles.statGroup}>
          <Share size={16} color={colors.success} />
          <Text style={styles.statText}>{formatNumber(item.shares)}</Text>
        </View>
      </View>
    </View>
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
          <Text style={styles.headerSubtitle}>Share your latest products and updates</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
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
});