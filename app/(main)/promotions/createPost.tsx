import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Camera,
  X,
  Hash,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { createPost } from '@/utils/Controllers/PromotionController';
import { FirebaseStorageService } from '@/utils/firebaseStorage';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - spacing.lg * 3) / 2;

const CreatePostScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const navigateBack = () => {
    if (caption.trim() || images.length > 0) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your post?',
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
      const imageUri = result.assets[0].uri;
      const imageIndex = images.length;
      
      console.log('=== UPLOADING IMAGE TO FIREBASE ===');
      console.log('Image URI:', imageUri);
      console.log('Image index:', imageIndex);
      
      // Add placeholder for the uploading image
      setImages(prev => [...prev, '']);
      setUploadingImages(prev => [...prev, true]);
      setUploadProgress(prev => ({ ...prev, [imageIndex]: 0 }));

      try {
        // Upload to Firebase Storage
        const result = await FirebaseStorageService.uploadImage(
          imageUri,
          'posts', // folder
          undefined, // auto-generate filename
          (progress) => {
            console.log('Upload progress:', progress.progress);
            setUploadProgress(prev => ({ ...prev, [imageIndex]: progress.progress }));
          }
        );

        console.log('Firebase upload successful:', result.downloadURL);
        
        // Update the image array with the Firebase URL
        setImages(prev => prev.map((img, idx) => idx === imageIndex ? result.downloadURL : img));
        setUploadingImages(prev => prev.map((uploading, idx) => idx === imageIndex ? false : uploading));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[imageIndex];
          return newProgress;
        });

      } catch (error) {
        console.error('Firebase upload failed:', error);
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        
        // Remove the failed upload from arrays
        setImages(prev => prev.filter((_, idx) => idx !== imageIndex));
        setUploadingImages(prev => prev.filter((_, idx) => idx !== imageIndex));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[imageIndex];
          return newProgress;
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadingImages(prev => prev.filter((_, i) => i !== index));
    // Update progress indices
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      // Shift indices down for items after the removed index
      Object.keys(newProgress).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          newProgress[keyNum - 1] = newProgress[keyNum];
          delete newProgress[keyNum];
        }
      });
      return newProgress;
    });
  };


  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!caption.trim()) {
      newErrors.caption = 'Caption is required';
    } else if (caption.length < 10) {
      newErrors.caption = 'Caption must be at least 10 characters';
    }

    const validImages = images.filter(img => img && img.startsWith('http'));
    if (validImages.length === 0) {
      newErrors.images = 'At least one image is required';
    } else if (uploadingImages.some(uploading => uploading)) {
      newErrors.images = 'Please wait for all images to finish uploading';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('=== CREATE POST ATTEMPT ===');
    console.log('Caption:', caption);
    console.log('Images:', images);
    console.log('User metadata:', user?.publicMetadata);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Getting auth token...');
      const token = await getToken({ template: "seller_app" });
      console.log('Token received:', token ? 'Yes' : 'No');
      
      const validImageUrls = images.filter(img => img && img.startsWith('http'));
      const postData = {
        storeId: user?.publicMetadata.storeId as string,
        content: caption.trim(),
        imageUrls: validImageUrls
      };
      
      console.log('Post data to send:', JSON.stringify(postData, null, 2));
      console.log('Calling createPost API...');
      
      const response = await createPost(postData, token ?? "");
      console.log('CreatePost response:', JSON.stringify(response.data, null, 2));

      Alert.alert(
        'Post Created!',
        'Your post has been created successfully and will be visible to customers.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('=== CREATE POST ERROR ===');
      console.error('Full error:', error);
      console.error('Error message:', error?.message);
      console.error('Error response:', error?.response?.data);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Post</Text>
          <Text style={styles.headerSubtitle}>Share with your customers</Text>
        </View>
        <TouchableOpacity
          style={[styles.publishButton, (!caption.trim() || images.filter(img => img && img.startsWith('http')).length === 0 || uploadingImages.some(uploading => uploading)) && styles.publishButtonDisabled]}
          onPress={handleSubmit}
          disabled={!caption.trim() || images.filter(img => img && img.startsWith('http')).length === 0 || uploadingImages.some(uploading => uploading) || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <Check size={20} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

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
                {uploadingImages[index] ? (
                  <View style={styles.uploadingContainer}>
                    <View style={styles.uploadingOverlay} />
                    <View style={styles.uploadProgressContainer}>
                      <View style={styles.uploadProgressBar}>
                        <View 
                          style={[
                            styles.uploadProgressFill, 
                            { width: `${uploadProgress[index] || 0}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.uploadProgressText}>
                        {Math.round(uploadProgress[index] || 0)}%
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color={colors.text.inverse} />
                    </TouchableOpacity>
                  </>
                )}
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
            <Hash size={20} color={colors.primary} />
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

  // Upload progress styles
  uploadingContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: radii.lg,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: radii.lg,
  },
  uploadProgressContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  uploadProgressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  uploadProgressText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeights.semibold,
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

});

export default CreatePostScreen; 