import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Layout, Text, Icon, Button, TopNavigation, TopNavigationAction, Divider, Spinner, IconProps, IconElement } from '@ui-kitten/components';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';

// Product interface, will change depending on what to receive once API is in
interface Product {
  id: number;
  name: string;
  discountedPrice: number;
  description: string;
  coverImage: string;
}

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="arrow-back" />
);

const EditIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="edit-2-outline" />
);

const StarIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="star" fill="#FFC107" />
);

export default function ProductPage() {
  const router = useRouter();
  const { product: productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product>({id: 0, name: '', discountedPrice: 0.00, description: '', coverImage: ''});
  const [loading, setLoading] = useState(false);
  const {getToken} = useAuth();
  
  // Find the product based on the ID
  const getProduct = async () => {
    setLoading(true);
    const token = await getToken();
    const response = await axios.get(`https://huggle-backend-jh2l.onrender.com/api/seller/products/${productId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });
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
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: product.coverImage }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
          
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
          </View>
        </ScrollView>
        
        <Button 
          style={styles.editButton} 
          onPress={navigateToEdit}
          activeOpacity={0.7}
          accessoryLeft={<EditIcon/>}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
