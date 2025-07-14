import { Input, Button, Icon, Text, IconProps, IconElement, ThemeType, Modal, Radio, RadioGroup } from '@ui-kitten/components';
import { StyleSheet, View, FlatList } from 'react-native';
import renderProductItem from './components/productItem';
import { useFocusEffect, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getAllProducts } from '@/utils/Controllers/ProductController';
import { showToast } from "@/components/Toast";


const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="search-outline" pack="eva" />
);


const AlertIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="alert-circle-outline" pack="eva" />
);

// Product Tab Component
const ProductsTab = ({ theme }: { theme: ThemeType }) => {
  const router = useRouter();
  const [products, setProducts] = useState<Array<any>>([]);
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'active', // 'active', 'inactive'
    expired: 'not-expired' // 'expired', 'not-expired'
  });
  const {getToken} = useAuth();
  const {user} = useUser();

  const FilterIcon = (props: IconProps): IconElement => (
    <Icon {...props} name="options-2-outline" pack="eva" onPress={() => setFilterVisible(true)} />
  );

  // TODO: Implement filtering logic for status and expiration
  
  // Sample product data
  const fetchProducts = async () => {
    try {
      const token = await getToken({template: "seller_app"});
      const response = await getAllProducts(search, token ?? "");

      const data = response.data;
      setProducts(data.products);
    } catch (error) {
      console.error("Error getting products: ", error);
      showToast('error', 'Uh oh!', `Something went wrong while getting your products. Please try again.`);
    }
  };

  const onSubmit = (event : {nativeEvent: {text: string}}) => {
    setSearch(event.nativeEvent.text);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();

      return () => {
        console.log("product list not focused");
      }
    }, [search, filters])
  )
  

  const renderFilterModal = () => (
    <Modal
      visible={filterVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => setFilterVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme['background-basic-color-1'] }]}>
        <Text category="h6" style={styles.modalTitle}>Filters</Text>
        
        <View style={styles.filterSection}>
          <Text category="s1" style={styles.filterLabel}>Product Status</Text>
          <RadioGroup
            selectedIndex={['active', 'inactive'].indexOf(filters.status)}
            onChange={index => {
              const statusOptions = ['active', 'inactive'];
              setFilters(prev => ({ ...prev, status: statusOptions[index] }));
            }}
          >
            <Radio>Active Only</Radio>
            <Radio>Inactive Only</Radio>
          </RadioGroup>
        </View>

        <View style={styles.filterSection}>
          <Text category="s1" style={styles.filterLabel}>Expiration Status</Text>
          <RadioGroup
            selectedIndex={['expired', 'not-expired'].indexOf(filters.expired)}
            onChange={index => {
              const expiredOptions = ['expired', 'not-expired'];
              setFilters(prev => ({ ...prev, expired: expiredOptions[index] }));
            }}
          >
            <Radio>Expired Only</Radio>
            <Radio>Not Expired</Radio>
          </RadioGroup>
        </View>

        <View style={styles.modalButtons}>
          <Button
            status="basic"
            onPress={() => setFilterVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            status="primary"
            onPress={() => {
              setFilterVisible(false);
              console.log(filters);
            }}
            style={styles.modalButton}
          >
            Apply
          </Button>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.tabContent}>
      {renderFilterModal()}
      
      <View style={styles.basketHeader}>
        <Input
          placeholder="Search your products"
          accessoryLeft={SearchIcon}
          accessoryRight={FilterIcon}
          style={styles.searchInput}
          onSubmitEditing={onSubmit} />
        <Button
          style={styles.addProductButton}
          appearance="outline"
          size="small"
          accessoryLeft={(props) => <Icon {...props} name="plus-outline" pack="eva" />}
          onPress={() => router.push('/(main)/home/products/createProduct')}
        >
        </Button>
      </View>

      {products.length > 0 && (
        <FlatList
          data={products}
          renderItem={({item}) => renderProductItem({item, theme})}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
        />
      )}

      {products.length === 0 && (
        <View style={styles.noProductsContainer}>
          <AlertIcon style={styles.noProductsIcon} fill='#C5CEE0'/>
          <Text style={styles.noProductsText} appearance='hint'>{search === '' ? 'You don\'t have any products yet.' : 'No products found.'}</Text>
          <Text style={styles.noProductsText} appearance='hint'>Add one now.</Text>
          <Button status='primary' size='large' onPress={() => router.push('/(main)/home/products/createProduct')} style={styles.ErrorAddProductButton}>Add a Product</Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    tabContent: {
        flex: 1,
        padding: 16,
    },
    searchInput: {
        borderRadius: 8,
        flex: 1,
    },
    basketHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    productRow: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    addProductButton: {
        borderRadius: 5,
        borderStyle: 'dashed',
    },
    noProductsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noProductsText: {
        fontWeight: '500',
        fontSize: 15,
        marginBottom: 5,
    },
    noProductsIcon: {
        width: 64,
        height: 64,
        marginBottom: 16,
    },
    ErrorAddProductButton: {
        borderRadius: 5,
        marginTop: 16,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        padding: 20,
        borderRadius: 8,
        maxWidth: 400,
    },
    modalTitle: {
        marginBottom: 20,
        textAlign: 'center',
    },
    filterSection: {
        marginBottom: 20,
    },
    filterLabel: {
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 20,
    },
    modalButton: {
        minWidth: 80,
    },
});

export default ProductsTab;
