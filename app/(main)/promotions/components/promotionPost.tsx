import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Icon, IconProps, IconElement, ThemeType, OverflowMenu, MenuItem, Layout, useTheme, ViewPager, Avatar } from '@ui-kitten/components';

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
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  storeId: string;
  interactions: number;
}

interface PromotionPostProps {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  store: any;
}

const PromotionPost = ({ post, onEdit, onDelete, store }: PromotionPostProps) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Date formatter
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleString(
      'en-PH',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        hour12: true,
        minute: "2-digit"
      }
    );
  };

  // Render images with ViewPager
  const renderImages = () => {
    if (!post.imageUrls || post.imageUrls.length === 0) return null;

    return (
      <View style={styles.imageContainer}>
        <ViewPager
          selectedIndex={selectedImageIndex}
          onSelect={index => setSelectedImageIndex(index)}
          style={styles.viewPager}
        >
          {post.imageUrls.map((image, index) => (
            <View key={index}>
              <Image
                source={{ uri: image }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </ViewPager>
        {post.imageUrls.length > 1 && renderImageIndicators()}
      </View>
    );
  };

  // Render image indicators
  const renderImageIndicators = () => (
    <View style={styles.indicatorContainer}>
      {post.imageUrls.map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            index === selectedImageIndex && styles.activeIndicator,
            {backgroundColor: theme[index === selectedImageIndex ? 'color-basic-100' : 'color-basic-500']}
          ]}
        />
      ))}
    </View>
  );

  // Dropdown Menu
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
    <Layout level="2" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar source={store?.storeImageUrl ? {uri: store.storeImageUrl} : require('../../../../assets/images/profile-placeholder.jpg')}/>
          <View style={styles.headerInfo}>
            <Text category="s1" style={styles.username}>{store?.name}</Text>
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

      {/* Insights */}
      <View style={[styles.insights, {borderTopColor: theme['color-basic-500']}]}>
        <View style={styles.insightItem}>
          <HeartIcon width={25} height={25} fill={theme['color-primary-500']} />
          <Text category="s2" status='primary' style={styles.actionText}>
            {post.interactions}
          </Text>
        </View>
        <View style={styles.insightItem}>
          <AnalyticsIcon width={25} height={25} fill={theme['color-primary-500']} />
          <Text category="s2" status='primary' style={styles.actionText}>
            {post.interactions}
          </Text>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontWeight: '600',
  },
  headerInfo: {
    gap: 3
  },
  username: {
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    height: 400,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  viewPager: {
    width: '100%',
    height: '100%',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  insights: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginTop: 10,
    borderTopWidth: 1,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
  },
});

export default PromotionPost; 