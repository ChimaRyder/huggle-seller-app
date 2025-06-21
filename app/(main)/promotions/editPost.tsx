import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Layout, Text, Button, TopNavigation, TopNavigationAction, Icon, IconProps, IconElement, Input } from '@ui-kitten/components';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" pack="eva" />
);

const DeleteIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="trash-2-outline" pack="eva" />
);

// Placeholder data for editing
const placeholderPosts = [
  {
    id: 1,
    content: "🎉 Special offer! Get 20% off on all fresh vegetables this week. Don't miss out on these amazing deals! #FreshFood #Discount",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500"
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    content: "New organic fruits just arrived! Fresh from the farm to your table. Order now and get free delivery on orders above $50.",
    images: [
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500"
    ],
    createdAt: "2024-01-14T15:45:00Z",
    updatedAt: "2024-01-14T15:45:00Z"
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
    updatedAt: "2024-01-13T09:20:00Z"
  }
];

const EditPostScreen = () => {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Find the post to edit
    const post = placeholderPosts.find(p => p.id === Number(postId));
    if (post) {
      setContent(post.content);
      setImages(post.images);
    }
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
    
    // Simulate API call
    setTimeout(() => {
      const updatedPost = {
        id: Number(postId),
        content: content.trim(),
        images: images,
        createdAt: "2024-01-15T10:30:00Z", // Keep original
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updating post:', updatedPost);
      setIsSubmitting(false);
      router.back();
    }, 1000);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            
            // Simulate API call
            setTimeout(() => {
              console.log('Deleting post with ID:', postId);
              setIsDeleting(false);
              router.back();
            }, 1000);
          }
        }
      ]
    );
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
                    <View style={styles.imagePreview}>
                      <Text style={styles.imageText}>Image {index + 1}</Text>
                    </View>
                  </View>
                ))}
                
                {images.length < 5 && (
                  <View style={styles.imageContainer}>
                    <View style={styles.addImageButton}>
                      <Text style={styles.addImageText}>+ Add Image</Text>
                    </View>
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
              style={[styles.actionButton, styles.deleteButton]}
              status="danger"
              onPress={handleDelete}
              disabled={isDeleting}
              accessoryLeft={isDeleting ? undefined : DeleteIcon}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            
            <Button
              style={[styles.actionButton, styles.updateButton]}
              onPress={handleUpdate}
              disabled={!content.trim() || isSubmitting}
              accessoryLeft={isSubmitting ? undefined : (props) => (
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
});

export default EditPostScreen; 