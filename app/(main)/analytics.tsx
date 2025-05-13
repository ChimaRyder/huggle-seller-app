import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction, Icon } from '@ui-kitten/components';
import { IconProps, IconElement } from '@ui-kitten/components';
import { Tab, TabBar } from '@ui-kitten/components';
import TransactionsTab from './analytics/transactions/transactionsTab';

const BellIcon = (props: IconProps): IconElement => (
  <Icon {...props} name="bell-outline" pack="eva" />
);

export default function AnalyticsScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  

  return (
    <Layout style={styles.container}>
      <TabBar
        selectedIndex={selectedIndex}
        onSelect={index => setSelectedIndex(index)}
        style={styles.tabBar}
      >
        <Tab title="Transactions" />
        <Tab title="Insights" />
      </TabBar>
      
      {selectedIndex === 0 && <TransactionsTab />}
            
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tabBar: {
    margin: 5,
  },
});
