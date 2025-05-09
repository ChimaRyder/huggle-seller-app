import { Card, Text, Button, Icon, useTheme, List, ListItem, ThemeType } from '@ui-kitten/components';
import { StyleSheet, View, Appearance } from 'react-native';


const renderOrderItem = ({ item, theme }: { item: any, theme: ThemeType }) => {
  const colorScheme = Appearance.getColorScheme();
  
  return (
    <Card style={[styles.orderCard, { backgroundColor: colorScheme === 'dark' ? theme['color-basic-900'] : theme['color-basic-200'] }]}>
    <View style={styles.orderHeader}>
        <Text category="c1" appearance="hint">{item.date}</Text>
        <View style={styles.orderImageContainer}>
          <View style={styles.orderImagePlaceholder}></View>
            <View style={styles.orderInfo}>
              <Text category="h6" >{item.name}</Text>
              <Text category="s1">{item.price}</Text>
              <View style={styles.customerInfo}>
                <Icon name="person-outline" pack="eva" width={12} height={12} fill={theme['text-hint-color']} />
                <Text category="c1">{item.customerName}</Text>
              </View>
              <View style={styles.deliveryInfo}>
                <Icon name="car-outline" pack="eva" width={12} height={12} fill={theme['text-hint-color']} />
                <Text category="c1">{item.deliveryMethod}</Text>
              </View>
            </View>
        </View>
    </View>
    <Button 
        size="small" 
        status={item.status === 'Pending' ? 'warning' : 'success'}
        style={styles.orderButton}
        {...{activeOpacity: 1}}
    >
        {item.status}
    </Button>
    </Card>
)};

const styles = StyleSheet.create({
  orderCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderImageContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  orderImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E4E9F2',
    borderRadius: 8,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  orderButton: {
    alignSelf: 'flex-end',
    borderRadius: 4,
  },
  textList: {
    padding: 100,
    
  }
});

export default renderOrderItem;