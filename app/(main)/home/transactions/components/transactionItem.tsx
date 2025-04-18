import { View, StyleSheet} from "react-native";
import { Text } from "@ui-kitten/components";

const renderTransactionItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
        <View style={styles.transactionInfo}>
            <View style={styles.transactionImagePlaceholder}></View>
            <View>
                <Text category="s1">{item.name}</Text>
                <Text category="c1" appearance="hint">{item.time}</Text>
            </View>
        </View>
        <Text category="s1" status="success">{item.amount}</Text>
    </View>
);

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionImagePlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#E4E9F2',
    borderRadius: 20,
    marginRight: 12,
  },
});

export default renderTransactionItem;