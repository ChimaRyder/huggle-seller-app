import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Camera,
  X,
  Hash,
  Type,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { getPostbyID, updatePost } from '@/utils/Controllers/PromotionController';
import * as ImagePicker from 'expo-image-picker';

// Define Post interface to match backend response
interface Post {
  id: string;
  sellerId: string;
  storeId: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
}

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - spacing.lg * 3) / 2;

const EditPostScreen = () => {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const token = await getToken({ template: "seller_app" });
        
        const response = await getPostbyID(postId as string, token ?? "");
        const postData = response.data?.data || response.data;

        if (postData) {
          setPost(postData);
          setCaption(postData.content || '');
          setImages(postData.imageUrls || []);
        } else {
          Alert.alert('Error', 'Post not found.');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        Alert.alert('Error', 'Failed to load post details.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const navigateBack = () => {
    if (caption.trim() || images.length > 0 || tags.length > 0) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can add up to 5 images per post.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const tag = currentTag.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags(prev => [...prev, tag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!caption.trim()) {
      newErrors.caption = 'Caption is required';
    } else if (caption.length < 10) {
      newErrors.caption = 'Caption must be at least 10 characters';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Post Updated!',
        'Your post has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      case 'product_promotion': return 'Product Promotion';
      case 'sale': return 'Sale/Discount';
      case 'event': return 'Event';
      case 'announcement': return 'Announcement';
      default: return 'Post';
    }
  };

  const postTypes: MockPost['postType'][] = ['product_promotion', 'sale', 'event', 'announcement'];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Loader size={32} color={colors.primary} />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit Post</Text>
          <Text style={styles.headerSubtitle}>Update your promotion</Text>
        </View>
        <TouchableOpacity
          style={[styles.publishButton, (!caption.trim() || images.length === 0) && styles.publishButtonDisabled]}
          onPress={handleSubmit}
          disabled={!caption.trim() || images.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <Check size={20} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Post Type Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Type size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Post Type</Text>
          </View>
          <View style={styles.postTypeGrid}>
            {postTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.postTypeOption,
                  postType === type && { backgroundColor: getPostTypeColor(type) + '20', borderColor: getPostTypeColor(type) }
                ]}
                onPress={() => setPostType(type)}
              >
                <Text style={[
                  styles.postTypeText,
                  postType === type && { color: getPostTypeColor(type), fontWeight: typography.fontWeights.semibold }
                ]}>
                  {getPostTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ImageIcon size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Images</Text>
            <Text style={styles.sectionCounter}>({images.length}/5)</Text>
          </View>
          {errors.images && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.images}</Text>
            </View>
          )}
          <Text style={styles.sectionDescription}>
            Add high-quality images to make your post more engaging
          </Text>

          <View style={styles.imageGrid}>
            {images.map((imageUri, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Camera size={24} color={colors.primary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Caption Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Type size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Caption</Text>
            <Text style={styles.characterCount}>{caption.length}/500</Text>
          </View>
          {errors.caption && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.caption}</Text>
            </View>
          )}
          <TextInput
            style={[
              styles.captionInput,
              errors.caption && { borderColor: colors.error }
            ]}
            multiline
            placeholder="What's your promotional message? Share details about your products, sales, or events..."
            placeholderTextColor={colors.text.tertiary}
            value={caption}
            onChangeText={setCaption}
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Hash size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Tags</Text>
            <Text style={styles.sectionCounter}>({tags.length}/10)</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Add relevant tags to help customers discover your post
          </Text>

          {/* Tag Input */}
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              placeholderTextColor={colors.text.tertiary}
              value={currentTag}
              onChangeText={setCurrentTag}
              onSubmitEditing={addTag}
              maxLength={20}
            />
            <TouchableOpacity
              style={[styles.addTagButton, !currentTag.trim() && styles.addTagButtonDisabled]}
              onPress={addTag}
              disabled={!currentTag.trim() || tags.length >= 10}
            >
              <Text style={styles.addTagText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Tags Display */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <X size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.inverse,
    borderTopColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },

  // Sections
  section: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionCounter: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  sectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  characterCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
  },

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },

  // Post Type Selection
  postTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  postTypeOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  postTypeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Images
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  imageItem: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: radii.lg,
    backgroundColor: colors.background.secondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },

  // Caption Input
  captionInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    minHeight: 120,
    lineHeight: 22,
  },

  // Tags
  tagInputContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  addTagButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  addTagText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.semibold,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  tagText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});

export default EditPostScreen;