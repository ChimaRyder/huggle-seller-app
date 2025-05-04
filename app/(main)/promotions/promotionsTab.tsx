import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';

// Promotions Tab Component (Empty as requested)
const PromotionsTab = () => {
  return (
    <View style={[styles.tabContent, styles.emptyTabContent]}>
      <Text category="h5">Promotions</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16,
  },
  emptyTabContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PromotionsTab;