import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Icon, IconProps, IconElement, ThemeType, OverflowMenu, MenuItem } from '@ui-kitten/components';

// Icons
const MoreIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="more-vertical" pack="eva" />
);

const HeartIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="heart" pack="eva" />
);

const AnalyticsIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="bar-chart-2-outline" pack="eva" />
);

interface Post {
  id: number;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  likes?: number;
  views?: number;
}

interface PromotionPostProps {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  theme?: ThemeType;
}

const PromotionPost = ({ post, onEdit, onDelete, theme }: PromotionPostProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;

    if (post.images.length === 1) {
      return (
        <Image
          source={{ uri: post.images[0] }}
          style={styles.singleImage}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.imageGrid}>
        {post.images.slice(0, 3).map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={[
              styles.gridImage,
              index === 2 && post.images.length > 3 && styles.lastImage
            ]}
            resizeMode="cover"
          />
        ))}
        {post.images.length > 3 && (
          <View style={styles.imageOverlay}>
            <Text style={styles.overlayText}>+{post.images.length - 3}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderMenu = () => (
    <OverflowMenu
      anchor={() => (
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <MoreIcon width={20} height={20} fill="#8F9BB3" />
        </TouchableOpacity>
      )}
      visible={menuVisible}
      onBackdropPress={() => setMenuVisible(false)}
    >
      <MenuItem
        title="Edit"
        accessoryLeft={(props) => <Icon {...props} name="edit-2-outline" pack="eva" />}
        onPress={() => {
          setMenuVisible(false);
          onEdit();
        }}
      />
      <MenuItem
        title="Delete"
        accessoryLeft={(props) => <Icon {...props} name="trash-2-outline" pack="eva" />}
        onPress={() => {
          setMenuVisible(false);
          onDelete();
        }}
      />
    </OverflowMenu>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme?.['background-basic-color-1'] || '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text category="s1" style={styles.username}>Your Store</Text>
            <Text category="c1" appearance="hint">{formatDate(post.createdAt)}</Text>
          </View>
        </View>
        {renderMenu()}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.postText}>{post.content}</Text>
      </View>

      {/* Images */}
      {renderImages()}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionButtons}>
          <View style={styles.actionItem}>
            <HeartIcon width={20} height={20} fill="#FF3B30" />
            <Text category="c1" style={styles.actionText}>
              {post.likes || 0}
            </Text>
          </View>
          <View style={styles.actionItem}>
            <AnalyticsIcon width={20} height={20} fill="#8F9BB3" />
            <Text category="c1" style={styles.actionText}>
              {post.views || 0}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E4E9F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8F9BB3',
  },
  headerInfo: {
  },
  username: {
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  content: {
    paddingBottom: 12,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
  },
  singleImage: {
    width: '100%',
    height: 300,
  },
  imageGrid: {
    flexDirection: 'row',
    height: 200,
  },
  gridImage: {
    flex: 1,
    height: '100%',
  },
  lastImage: {
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F7F9FC',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    color: '#8F9BB3',
  },
});

export default PromotionPost; 