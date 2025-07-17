import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Icon } from '@ui-kitten/components';
import { IconProps, IconElement } from '@ui-kitten/components';
import { Tab, TabBar } from '@ui-kitten/components';
import TransactionsTab from './analytics/transactions/transactionsTab';
import InsightsTab from './analytics/insights/insightsTab';

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

      {selectedIndex === 1 && <InsightsTab />}
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
