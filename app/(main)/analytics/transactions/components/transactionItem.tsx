import { View, StyleSheet} from "react-native";
import { Text } from "@ui-kitten/components";
import { Order } from "@/utils/Controllers/OrderController";

const renderTransactionItem = ({ item }: { item: Order }) => (
    <View style={styles.transactionItem}>
        <View style={styles.transactionInfo}>
            <View style={{gap: 5}}>
                <Text category="s1">#{Date.parse(item.createdAt.toString()).toString(36).toUpperCase()}</Text>
                <Text category="c1" appearance="hint">
                  {new Date(item.createdAt).toLocaleString(
                  'en-PH',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    hour12: true,
                    minute: "2-digit",
                  }
                  )}
                </Text>
            </View>
        </View>
        <Text category="s1" status="success"> + ₱{item.totalAmount.toFixed(2)}</Text>
    </View>
);

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
});

export default renderTransactionItem;