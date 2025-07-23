import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Alert } from 'react-native';
import { Layout, Text, Icon, Button, TopNavigation, TopNavigationAction, Divider, Spinner, IconProps, IconElement, ViewPager, useTheme } from '@ui-kitten/components';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { deleteProduct, getProductbyID } from '@/utils/Controllers/ProductController';
import { Product } from '@/utils/Controllers/ProductController';
import { showToast } from '@/components/Toast';

// Icons
const BackIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="ArrowLeft" />
);

const EditIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="SquarePen" />
);

const DeleteIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="Trash2" />
);

// const StarIcon = (props: IconProps): IconElement => (
//   <Icon {...props} name="Star" fill="#FFC107" />
// );

export default function ProductPage() {
  const router = useRouter();
  const { product: productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product>({} as Product);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const {getToken} = useAuth();
  const theme = useTheme();
  
  // Find the product based on the ID
  const getProduct = async () => {
    try {
      setLoading(true);
      const token = await getToken({template: "seller_app"});
      const response = await getProductbyID(productId as string, token ?? "");

      setProduct(response.data);
    } catch(error) {
      console.error('Error getting product: ', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProd = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await deleteProduct(productId as string, token ?? "");

      router.back();
      showToast('success', 'Product Deleted', `${product.name} has been deleted.`);
    } catch(error) {
      console.error('Error deleting product: ', error);
      showToast('error', 'Uh Oh!', `An error occured while deleting ${product.name}. Please try again later.`);
    } 
  }

  const handleDelete = () => {
    Alert.alert("Delete Product", "Are you sure you want to delete this product?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: deleteProd,
      },
    ]);
  }

  useFocusEffect(
    useCallback(() => {
      getProduct();

      return () => {}
    }, [])
  );

  const navigateBack = () => {
    router.back();
  };

  const navigateToEdit = () => {
    router.push({
      pathname: "/(main)/products/editProduct",
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
          title={() => <Text category='s1'>Product Details</Text>}
        />
        <Divider />
        
        <Layout level="2" style={styles.imageContainer}>
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
        </Layout>

        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={{flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 3}}>
              <Text category='h6' status='primary' style={styles.productPrice}>₱{product.discountedPrice.toFixed(2)}</Text>

              <Layout style={{backgroundColor: theme['color-primary-200'], justifyContent: "center", alignItems: "center", padding: 5, paddingHorizontal: 7, borderRadius: 5}}>
                <Text category='p1' status='primary' style={styles.productPrice}>-{(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100).toFixed()}%</Text>
              </Layout>
            </View>

            <Text category='h6' style={styles.productTitle}>{product.name}</Text>
            
            <View style={styles.section}>
              <Text category='s1'>Description</Text>
              <Text category='p2' style={styles.description}>{product.description}</Text>
            </View>
            
            <View style={styles.section}>
              <Text category='s1'>Categories</Text>

              <View style={styles.categoryContainer}>
                {product.category.map((category, index) => <Text key={index} category='c1' appearance='alternative' style={[styles.categoryText, {backgroundColor: theme['color-primary-500']}]}>{category}</Text>)}
              </View>
            </View>
          </View>
        </ScrollView>

        <Button 
          style={styles.deleteButton} 
          onPress={deleteProd}
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
          status='warning'
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
    marginBottom: 30,
  },
  productPrice: {
  },
  section: {
    marginBottom: 12,
  },
  description: {
    margin: 5,
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
    margin: 8,
  },
  categoryText: {
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
});
