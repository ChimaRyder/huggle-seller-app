
import { Input, Button, Icon, Text, IconProps, IconElement } from '@ui-kitten/components';
import { StyleSheet, View, FlatList } from 'react-native';
import renderProductItem from './components/productItem';
import { useRouter } from 'expo-router';

const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="search-outline" pack="eva" />
);

const FilterIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="options-2-outline" pack="eva" onPress={() => console.log('Filter pressed')} />
);

// Product Tab Component
const ProductsTab = () => {
  const router = useRouter();
  
  // Sample product data
  const products = [
    { id: 1, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 2, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 3, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 4, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 5, name: 'Lorem', items: 5, rating: 5.0 },
    { id: 6, name: 'Lorem', items: 5, rating: 5.0 },
  ];

  return (
    <View style={styles.tabContent}>
      
      <View style={styles.basketHeader}>
        <Input
          placeholder="Search your products"
          accessoryLeft={SearchIcon}
          accessoryRight={FilterIcon}
          style={styles.searchInput}
        />
        <Button
          style={styles.addProductButton}
          appearance="outline"
          size="small"
          accessoryLeft={(props) => <Icon {...props} name="plus-outline" pack="eva" />}
          onPress={() => router.push('/(main)/home/products/createProduct')}
        >
        </Button>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
      />
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
});

export default ProductsTab;
