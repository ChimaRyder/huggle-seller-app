import PromotionsTab from "./promotions/promotionsTab";
import { StyleSheet } from 'react-native';
import { Layout } from '@ui-kitten/components';


export default function PromotionsScreen() {
  return (
    <Layout style={styles.container}>
        <PromotionsTab />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});