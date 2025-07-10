import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Layout, Text, Button, TopNavigation, TopNavigationAction, Icon, IconProps, IconElement, Input, Spinner } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageUploader from '../home/products/components/ImageUploader';
import { useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { showToast } from '@/components/Toast';
import { createPost } from '@/utils/Controllers/PromotionController';

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

const CreatePostScreen = () => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  const navigateBack = () => {
    router.back();
  };

  const handleImageSelected = (imageUri: string) => {
    setImages(prev => [...prev, imageUri]);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      console.log('Content is required');
      return;
    }

    setIsSubmitting(true);

    const post = {
      storeId: user?.publicMetadata.storeId as string,
      content: content,
      imageUrls: images,
    }

    try {
      const token = await getToken({template: 'seller_app'});
      const response = await createPost(post, token ?? "");

      showToast('success', 'Success', 'Post created successfully.');

      setIsSubmitting(false);
      router.dismissTo('/(main)');
    } catch(error) {
      console.error(error);
      showToast('error', 'Error', 'Failed to create post.');
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
          title={() => <Text category='h6'>Create Post</Text>}
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
                Add up to 5 images to make your post more engaging
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

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            accessoryLeft={isSubmitting ? (props) => (<Spinner size='tiny' />) : (props) => (
              <Icon {...props} name="checkmark-outline" pack="eva" />
            )}
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
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
  submitButton: {
    borderRadius: 8,
  },
  imageUploader: {
    width: '100%',
    height: '100%',
  },
});

export default CreatePostScreen; 