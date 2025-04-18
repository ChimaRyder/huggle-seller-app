import { Icon, Input, IconProps, IconElement } from '@ui-kitten/components';
import { StyleSheet, View, FlatList } from 'react-native';
import renderOrderItem from './components/orderItem';

// Icons for the tabs
const SearchIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="search-outline" pack="eva" />
);

const FilterIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="options-2-outline" pack="eva" onPress={() => console.log('Filter pressed')} />
);

// Orders Tab Component
const OrdersTab = () => {
  // Sample order data
  const orders = [
    { 
      id: 1, 
      date: 'YESTERDAY, 8:20 AM', 
      name: 'Sunrise Starter Bundle', 
      price: '₱290', 
      status: 'Pending',
      customerName: 'Adrian Pangilinan',
      deliveryMethod: 'Delivery via Grab'
    },
    { 
      id: 2, 
      date: 'MARCH 19, 2025', 
      name: 'Chop & Drop Bundle', 
      price: '₱150', 
      status: 'Completed',
      customerName: 'Adrian Pangilinan',
      deliveryMethod: 'Delivery via Lalamove'
    },
    { 
      id: 3, 
      date: 'MARCH 17, 2025', 
      name: 'Choco Moist Cake', 
      price: '₱700', 
      status: 'Completed',
      customerName: 'Adrian Pangilinan',
      deliveryMethod: 'Delivery via Grab'
    },
  ];

  return (
    <View style={styles.tabContent}>
      <Input
        placeholder="Search in Orders"
        accessoryLeft={SearchIcon}
        accessoryRight={FilterIcon}
        style={styles.searchInput}
      />
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.ordersList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  ordersList: {
    paddingBottom: 80,
  },
  searchInput: {
    marginBottom: 16,
    borderRadius: 8,
  },
});

export default OrdersTab;