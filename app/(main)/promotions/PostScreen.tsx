/**
 * Posts Screen - Instagram-style post viewing for seller app
 * Displays swipeable images, store details, caption, and interaction options
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import { Heart, Share, Flag, ArrowLeft, Eye, MessageCircle, AlertCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react-native';
import { colors, spacing, typography, radii } from "@/constants/theme";
import { getPostbyID, deletePost } from "@/utils/Controllers/PromotionController";
import { useAuth } from '@clerk/clerk-expo';

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

const { width } = Dimensions.get("window");

interface PostScreenProps {}

const PostScreen: React.FC<PostScreenProps> = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Helper to format date
  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}w`;
  };

  useEffect(() => {
    console.log('=== POST SCREEN USEEFFECT ===');
    console.log('Post ID from params:', id);
    console.log('ID type:', typeof id);
    console.log('ID is truthy:', !!id);
    
    const loadPost = async () => {
      console.log('=== LOADING POST ===');
      setLoading(true);
      setError(null);
      try {
        console.log('Getting auth token...');
        const token = await getToken({ template: "seller_app" });
        console.log('Token received:', token ? 'Yes' : 'No');
        
        console.log('Calling getPostbyID with ID:', id);
        const response = await getPostbyID(id as string, token ?? "");
        console.log('Raw API response:', response);
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        const postData = response.data?.data || response.data;
        console.log('Extracted post data:', JSON.stringify(postData, null, 2));

        if (!postData) {
          console.log('No post data found!');
          throw new Error('Post not found');
        }

        console.log('Setting post data and like count...');
        setPost(postData);
        setLikeCount(postData.likeCount || 0);
        console.log('Post loaded successfully!');
      } catch (err: any) {
        console.error('=== POST LOADING ERROR ===');
        console.error('Full error:', err);
        console.error('Error message:', err?.message);
        console.error('Error response:', err?.response?.data);
        setError(err.message || "Failed to load post");
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };
    
    if (id) {
      console.log('ID exists, calling loadPost...');
      loadPost();
    } else {
      console.log('No ID provided!');
    }
  }, [id]);



  const handleStorePress = () => {
    // Navigate back to store profile or promotions list
    router.push("/(main)/promotions");
  };

  const handleEditPost = () => {
    setShowOptionsMenu(false);
    router.push({
      pathname: '/(main)/promotions/editPost',
      params: { postId: id }
    });
  };

  const handleDeletePost = () => {
    setShowOptionsMenu(false);
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
              await deletePost(post?.id || "", token ?? "");
              
              Alert.alert(
                'Post Deleted',
                'Your post has been deleted successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingImage} />
          <View style={styles.loadingContent}>
            <View style={styles.loadingLine} />
            <View style={[styles.loadingLine, { width: '60%' }]} />
            <View style={[styles.loadingLine, { width: '80%' }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={colors.error} />
          <Text style={styles.errorText}>
            {error || "Post not found."}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
          <MoreHorizontal size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Main scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Image carousel */}
        <View style={styles.imageContainer}>
          {post.imageUrls && post.imageUrls.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / width
                );
                setCurrentImageIdx(idx);
              }}
              scrollEventThrottle={16}
              style={styles.imageScrollView}
            >
              {post.imageUrls.map((img: string, idx: number) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          {/* Image indicator */}
          {post.imageUrls && post.imageUrls.length > 1 && (
            <View style={styles.imageIndicator}>
              {post.imageUrls.map((_, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorDot,
                    {
                      backgroundColor: idx === currentImageIdx
                        ? colors.text.inverse
                        : 'rgba(255,255,255,0.5)'
                    }
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Post actions */}
        <View style={styles.actionsContainer}>
          <View style={styles.likeSection}>
            <View style={styles.likeButton}>
              <Heart
                size={28}
                color={colors.primary}
                fill={colors.primary}
              />
            </View>
            <Text style={styles.likesText}>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Eye size={16} color={colors.info} />
              <Text style={styles.statText}>{post.views || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Share size={16} color={colors.success} />
              <Text style={styles.statText}>{post.shares || 0}</Text>
            </View>
          </View>
        </View>

        {/* Caption */}
        <View style={styles.contentContainer}>
          <Text style={styles.caption}>
              <Text style={styles.storeNameInCaption}>{post.storeName || 'Store'}</Text>
            {' '}{post.content}
          </Text>

          <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
        </View>
      </ScrollView>

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
            <TouchableOpacity style={styles.optionItem} onPress={handleEditPost}>
              <Edit size={20} color={colors.primary} />
              <Text style={styles.optionText}>Edit Post</Text>
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleDeletePost}>
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.optionText, { color: colors.error }]}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  imageContainer: {
    width: width,
    height: width,
    position: 'relative',
  },
  imageScrollView: {
    width: '100%',
    height: '100%',
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: colors.background.secondary,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    marginRight: spacing.sm,
  },
  likesText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  statsSection: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  caption: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  storeNameInCaption: {
    fontWeight: typography.fontWeights.semibold,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  timestamp: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  loadingImage: {
    width: width,
    height: width,
    backgroundColor: colors.background.secondary,
  },
  loadingContent: {
    padding: spacing.lg,
  },
  loadingLine: {
    height: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
  },
  backButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.semibold,
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

export default PostScreen;