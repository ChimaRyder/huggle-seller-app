import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Layout, Text, Icon, Button, TopNavigation, TopNavigationAction, Divider, Spinner, IconProps, IconElement, ViewPager, useTheme } from '@ui-kitten/components';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import { getProductbyID } from '@/utils/Controllers/ProductController';

// Product interface, will change depending on what to receive once API is in
interface Product {
  id: number;
  name: string;
  discountedPrice: number;
  description: string;
  coverImage: string;
  additionalImages: string[];
  category: string[];
}

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" />
);

const EditIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="edit-2-outline" />
);

const DeleteIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="trash-2-outline" />
);

const StarIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="star" fill="#FFC107" />
);

export default function ProductPage() {
  const router = useRouter();
  const { product: productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product>({id: 0, name: '', discountedPrice: 0.00, description: '', coverImage: '', additionalImages: [], category: []});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const {getToken} = useAuth();
  const theme = useTheme();
  
  // Find the product based on the ID
  const getProduct = async () => {
    setLoading(true);
    const token = await getToken();
    const response = await getProductbyID(productId as string, token ?? "");

    const data = response.data;
    setProduct(data);
    setLoading(false);
    return data;
  };

  useEffect(() => {
    getProduct();
  }, []);

  const navigateBack = () => {
    router.back();
  };

  const navigateToEdit = () => {
    router.push({
      pathname: "/(main)/home/products/editProduct",
      params: { productId: product.id }
    });
  };

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  );

  const renderImageIndicators = () => {
    const totalImages = 1 + (product.additionalImages?.length || 0);
    return (
      <View style={styles.indicatorContainer}>
        {Array.from({ length: totalImages }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              selectedIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <>
    {!loading && (
    <Layout style={styles.container} level='1'>
      <SafeAreaView style={styles.safeArea}>
        <TopNavigation
          accessoryLeft={renderBackAction}
          title={() => <Text category='h6'>Product Details</Text>}
        />
        <Divider />
        
        <View style={styles.imageContainer}>
          <ViewPager
            selectedIndex={selectedIndex}
            onSelect={index => setSelectedIndex(index)}
            style={styles.viewPager}
          >
            {[
              <View key="cover">
                <Image 
                  source={{ uri: product.coverImage }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>,
              ...(product.additionalImages?.map((imageUri, index) => (
                <View key={`additional-${index}`}>
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
              )) || [])
            ]}
          </ViewPager>
          {renderImageIndicators()}
        </View>

        <ScrollView style={styles.scrollView}>
          
          
          <View style={styles.contentContainer}>
            <Text category='h4' style={styles.productTitle}>{product.name}</Text>
            
            <Text category='h5' status='primary' style={styles.productPrice}>{product.discountedPrice.toFixed(2)}</Text>
            
            <View style={styles.section}>
              <Text category='h6'>Description</Text>
              <Text appearance='hint' style={styles.description}>{product.description}</Text>
            </View>
            
            <View style={styles.section}>
              <Text category='h6'>Reviews</Text>
              
              {/* {product.reviews.map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                  <Text category='s1' style={styles.reviewerName}>{review.reviewerName}</Text>
                  <Text appearance='hint'>{review.comment}</Text>
                  <View style={styles.ratingContainer}>
                    <StarIcon width={16} height={16} />
                    <Text category='c1'>{review.rating}</Text>
                  </View>
                </View>
              ))} */}
            </View>

            <View style={styles.section}>
              <Text category='h6'>Categories</Text>

              <View style={styles.categoryContainer}>
                {product.category.map((category, index) => <Text key={index} category='c1' appearance='alternative' style={[styles.categoryText, {backgroundColor: theme['color-primary-500']}]}>{category}</Text>)}
              </View>
            </View>
          </View>
        </ScrollView>

        <Button 
          style={styles.deleteButton} 
          onPress={() => {console.log('delete')}} // TODO: Add delete function
          activeOpacity={0.7}
          accessoryLeft={<DeleteIcon/>}
          status='danger'
        >
        </Button>
        
        <Button 
          style={styles.editButton} 
          onPress={navigateToEdit}
          activeOpacity={0.7}
          accessoryLeft={<EditIcon/>}
          status='info'
        >
        </Button>
      </SafeAreaView>
    </Layout>
  )}

  {loading && (
    <View style={[styles.container, styles.loadingContainer]}>
      <Spinner size='giant'/>
    </View>
  )}
  </>
  );
}

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
  imageContainer: {
    width: '100%',
    height: 300,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
  },
  productTitle: {
    marginBottom: 8,
  },
  productPrice: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  description: {
    marginTop: 8,
    lineHeight: 20,
  },
  reviewItem: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F7F9FC',
  },
  reviewerName: {
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  editButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewPager: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginVertical: 8,
  },
  categoryText: {
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
});
