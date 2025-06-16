
import { Input, Button, Icon, Text, IconProps, IconElement, ThemeType } from '@ui-kitten/components';
import { StyleSheet, View, FlatList } from 'react-native';
import renderProductItem from './components/productItem';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-expo';



const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="search-outline" pack="eva" />
);
const FilterIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="options-2-outline" pack="eva" onPress={() => console.log('Filter pressed')} />
);

const AlertIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="alert-circle-outline" pack="eva" />
);

// Product Tab Component
const ProductsTab = ({ theme }: { theme: ThemeType }) => {
  const router = useRouter();
  const [products, setProducts] = useState<Array<any>>([]);
  const [search, setSearch] = useState('');
  const {getToken} = useAuth();
  const {user} = useUser();
  
  // Sample product data
  const fetchProducts = async () => {
    try {
    console.log("running");
    const token = await getToken({template: "seller_app"});
    const response = await axios.get(`https://huggle-backend-jh2l.onrender.com/api/seller/products/?Name=${search}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });
    const data = response.data;
    console.log(data);
    setProducts(data.products);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = (event : {nativeEvent: {text: string}}) => {
    setSearch(event.nativeEvent.text);
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <View style={styles.tabContent}>
      
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
});

export default ProductsTab;
