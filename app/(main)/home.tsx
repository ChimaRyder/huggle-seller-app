import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text, Tab, TabBar, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { IconProps, IconElement } from '@ui-kitten/components';

import ProductsTab from './home/products/productsTab';
import OrdersTab from './home/orders/ordersTab';
import TransactionsTab from './home/transactions/transactionsTab';
import PromotionsTab from './home/promotions/promotionsTab';

// Icons for the tabs
const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="bell-outline" pack="eva" />
);

export default function HomeScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const renderRightActions = () => (
    <TopNavigationAction icon={BellIcon} />
  );

  return ( 
    <Layout style={styles.container}>
      <TopNavigation
        title={evaProps => <Text {...evaProps} category="h5">Good morning!</Text>}
        alignment="start"
        accessoryRight={renderRightActions}
        style={styles.topNavigation}
      />
      
      <TabBar
        selectedIndex={selectedIndex}
        onSelect={index => setSelectedIndex(index)}
        style={styles.tabBar}
      >
        <Tab title="Products"/>
        <Tab title="Orders"/>
        <Tab title="Transactions"/>
        <Tab title="Promotions"/>
      </TabBar>
      
      {selectedIndex === 0 && <ProductsTab />}
      {selectedIndex === 1 && <OrdersTab />}
      {selectedIndex === 2 && <TransactionsTab />}
      {selectedIndex === 3 && <PromotionsTab />}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topNavigation: {
    backgroundColor: '#fff',
  },
  tabBar: {
    margin: 3,
  },
});
