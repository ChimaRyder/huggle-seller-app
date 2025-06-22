import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Input, Button, Icon, IconProps, IconElement } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import PromotionPost from './components/promotionPost';
import { useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { showToast } from '@/components/Toast';

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

const PromotionsTab = () => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const {getToken} = useAuth();
  const {user} = useUser();
  const [store, setStore] = useState(null);

  // Load Posts
  useEffect(() => {
    fetchPosts();
    fetchStore();
  }, []);

  // Route push to add post
  const handleAddPost = () => {
    router.push('/(main)/promotions/createPost');
  };

  // Route push to edit post
  const handleEditPost = (postId: number) => {
    router.push({
      pathname: '/(main)/promotions/editPost',
      params: { postId: postId.toString() }
    });
  };

  // Route push to delete post
  const handleDeletePost = (postId: number) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'Delete', onPress: async () => {
        const token = await getToken({template: 'seller_app'});
        const response = await axios.delete(`https://huggle-backend-jh2l.onrender.com/api/seller/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response.data);
        showToast('success','Success','Post deleted successfully.');
        fetchPosts();
      } 
      },
    ]);
  };

  // Post Item render
  const renderPost = ({ item }: { item: any }) => (
    <PromotionPost
      post={item}
      store={store}
      onEdit={() => handleEditPost(item.id)}
      onDelete={() => handleDeletePost(item.id)}
    />
  );

  // Fetch Posts function
  const fetchPosts = async () => {
    const token = await getToken({template: "seller_app"});
    const response = await axios.get(`https://huggle-backend-jh2l.onrender.com/api/seller/posts/search?StoreId=${user?.publicMetadata?.storeId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });
    console.log(response.data.posts);
    setPosts(response.data.posts);
  }

  // Fetch Store function
  const fetchStore = async () => {
    const token = await getToken({template: "seller_app"});
    const response = await axios.get(`https://huggle-backend-jh2l.onrender.com/api/stores/${user?.publicMetadata?.storeId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });
    console.log(response.data);
    setStore(response.data);
  }


  return (
    <View style={styles.container}>
      {/* Header with Search and Add Button */}
      <View style={styles.header}>
        <Text category="h5">
          Posts
        {/* TODO: Add filter button */}
        </Text>
        
        <Button
          style={styles.addButton}
          appearance="outline"
          size="small"
          accessoryLeft={PlusIcon}
          onPress={handleAddPost}
        />
      </View>

      {/* Posts List */}
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AlertIcon style={styles.emptyIcon} fill="#C5CEE0" />
          <Text style={styles.emptyTitle} appearance="hint">
            No Posts Found
          </Text>
          <Text style={styles.emptySubtitle} appearance="hint">
            Promote your products by creating a post.
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
    justifyContent: 'space-between',
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