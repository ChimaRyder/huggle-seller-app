import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Input, Button, Icon, IconProps, IconElement, useTheme } from "@ui-kitten/components";
import { useFocusEffect, useRouter } from "expo-router";
import PromotionPost from "./components/promotionPost";
import { useAuth, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { showToast } from "@/components/Toast";
import {
  deletePost,
  getAllPosts,
} from "@/utils/Controllers/PromotionController";
import { getStore, Store } from "@/utils/Controllers/StoreController";
import { MessageCircleWarning } from "lucide-react-native";

// Icons
const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Search" />
);

const PlusIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Plus" />
);


const PromotionsTab = () => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();
  const [store, setStore] = useState<Store>({} as Store);

  // Load Posts
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      fetchStore();

      return () => {
        console.log("promotions not focused");
      };
    }, [])
  );

  // Route push to add post
  const handleAddPost = () => {
    router.push("/(main)/promotions/createPost");
  };

  // Route push to edit post
  const handleEditPost = (postId: number) => {
    router.push({
      pathname: "/(main)/promotions/editPost",
      params: { postId: postId.toString() },
    });
  };

  // Route push to delete post
  const handleDeletePost = (postId: number) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          const token = await getToken({ template: "seller_app" });
          const response = await deletePost(postId, token ?? "");

          showToast("success", "Success", "Post deleted successfully.");
          fetchPosts();
        },
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
    try {
      setLoading(true);
      const token = await getToken({ template: "seller_app" });
      const response = await getAllPosts(
        user?.publicMetadata.storeId as string,
        token ?? ""
      );

      console.log(response.data);
      setPosts(response.data);
    } catch (error) {
      console.error("Error getting posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Store function
  const fetchStore = async () => {
    try {
      const token = await getToken({ template: "seller_app" });
      const response = await getStore(
        user?.publicMetadata.storeId as string,
        token ?? ""
      );

      setStore(response.data);
    } catch (error) {
      console.error("Error getting store:", error);
    }
  };

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
        <FlatList
          refreshing={loading}
          onRefresh={fetchPosts}
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.postsList, posts.length === 0 && {flex: 1}]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageCircleWarning size={50} color={theme['color-basic-600']} style={styles.emptyIcon}/>
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
          }
        />
        
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderRadius: 8,
  },
  addButton: {
    borderRadius: 8,
    borderStyle: "dashed",
  },
  postsList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },
  createButton: {
    borderRadius: 8,
  },
});

export default PromotionsTab;
