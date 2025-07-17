import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Layout } from '@ui-kitten/components';

interface TopProductItemProps {
  item: {
    productId: string;
    productName: string;
    views: number;
    cartAdds: number;
    purchases: number;
    engagementScore: number;
  };
  index: number;
}

const TopProductItem: React.FC<TopProductItemProps> = ({ item, index }) => (
  <Layout level='3' style={styles.container}>
    <Text category="s1" style={styles.rank}>{index + 1}.</Text>
    <View style={styles.infoContainer}>
      <Text category="s1" style={styles.productName}>{item.productName}</Text>
      <View style={styles.statsRow}>
        <Text appearance="hint" style={styles.stat}>Views: {item.views}</Text>
        <Text appearance="hint" style={styles.stat}>Cart Adds: {item.cartAdds}</Text>
        <Text appearance="hint" style={styles.stat}>Purchases: {item.purchases}</Text>
        <Text appearance="hint" style={styles.stat}>Engagement: {item.engagementScore}</Text>
      </View>
    </View>
  </Layout>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  rank: {
    width: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    marginRight: 12,
    fontSize: 12,
  },
});

export default TopProductItem; 