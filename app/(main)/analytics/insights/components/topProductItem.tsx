import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Layout, useTheme } from '@ui-kitten/components';
import { Eye, ShoppingBag, ShoppingCart } from 'lucide-react-native';

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

const TopProductItem: React.FC<TopProductItemProps> = ({ item, index }) => {
  const theme = useTheme();
  
  return (
    <Layout level='3' style={styles.container}>
      <Text category="s1" style={styles.rank}>{index + 1}.</Text>
      <View style={styles.infoContainer}>
        <Text category="s1" style={styles.productName}>{item.productName}</Text>
        <View style={styles.statsRow}>
          <Eye size={15} color={theme['color-basic-600']}/> 
          <Text appearance="hint" style={styles.stat}>{item.views}</Text>
          <ShoppingCart size={15} color={theme['color-basic-600']}/> 
          <Text appearance="hint" style={styles.stat}>{item.cartAdds}</Text>
          <ShoppingBag size={15} color={theme['color-basic-600']}/>
          <Text appearance="hint" style={styles.stat}>{item.purchases}</Text>
        </View>
      </View>
    </Layout>
  )};

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