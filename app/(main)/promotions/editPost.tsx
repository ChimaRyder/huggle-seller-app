import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Layout, Text, Button, TopNavigation, TopNavigationAction, Icon, IconProps, IconElement, Input, Spinner } from '@ui-kitten/components';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import ImageUploader from '../home/products/components/ImageUploader';
import { showToast } from '@/components/Toast';
import { getPostbyID, updatePost } from '@/utils/Controllers/PromotionController';

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

const DeleteIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="trash-2-outline" pack="eva" />
);

const EditPostScreen = () => {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    // Find the post to edit
    const fetchPost = async () => {
      const token = await getToken({template: 'seller_app'});
      const response = await getPostbyID(postId as string, token ?? "");

      const post = response.data;

      setContent(post.content);
      setImages(post.imageUrls);
      setPost(post);
    };
    console.log(postId);
    fetchPost();
  }, [postId]);

  const navigateBack = () => {
    router.back();
  };

  const handleImageSelected = (imageUri: string) => {
    setImages(prev => [...prev, imageUri]);
  };

  const handleUpdate = async () => {
    if (!content.trim()) {
      console.log('Content is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updatedPost = {
        ...post,
        content: content.trim(),
        imageUrls: images,
      }

      const token = await getToken({template: 'seller_app'});
      const response = await updatePost(updatedPost, token ?? "");

      setIsSubmitting(false);
      showToast('success','Success','Post updated successfully.');
      router.back();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      showToast('error','Error','Failed to update post.');
    }
  };

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  return (
    <Layout style={styles.container} level='1'>
      <SafeAreaView style={styles.safeArea}>
        <TopNavigation
          accessoryLeft={renderBackAction}
          title={() => <Text category='h6'>Edit Post</Text>}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Content Input */}
            <View style={styles.section}>
              <Text category="s1" style={styles.label}>Post Content</Text>
              <Input
                multiline
                textStyle={{ minHeight: 100 }}
                placeholder="What's your promotional message?"
                value={content}
                onChangeText={setContent}
                style={styles.contentInput}
              />
            </View>

            {/* Images Section */}
            <View style={styles.section}>
              <Text category="s1" style={styles.label}>Images</Text>
              <Text category="c1" appearance="hint" style={styles.hint}>
                Current images: {images.length}/5
              </Text>
              
              <View style={styles.imageGrid}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <ImageUploader
                      image={image}
                      onImageSelected={handleImageSelected}
                      style={styles.imageUploader}
                    />
                  </View>
                ))}
                
                {images.length < 5 && (
                  <View style={styles.imageContainer}>
                    <ImageUploader
                      image=""
                      onImageSelected={handleImageSelected}
                      style={styles.imageUploader}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Button
              style={[styles.actionButton, styles.updateButton]}
              onPress={handleUpdate}
              disabled={!content.trim() || isSubmitting}
              accessoryLeft={isSubmitting ? () => <Spinner /> : (props) => (
                <Icon {...props} name="checkmark-outline" pack="eva" />
              )}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  hint: {
    marginBottom: 12,
  },
  contentInput: {
    borderRadius: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 12,
    color: '#8F9BB3',
  },
  addImageButton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#8F9BB3',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E4E9F2',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  deleteButton: {
    // Additional styling if needed
  },
  updateButton: {
    // Additional styling if needed
  },
  imageUploader: {
    width: '100%',
    height: '100%',
  },
});

export default EditPostScreen; 