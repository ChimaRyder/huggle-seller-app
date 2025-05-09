import { Card, Text, Icon, ThemeType } from '@ui-kitten/components';
import { StyleSheet, View, ImageBackground, Appearance } from 'react-native';
import { useRouter } from 'expo-router';

const renderProductItem = ({ item, theme }: { item: any, theme: ThemeType }) => {
    const colorScheme = Appearance.getColorScheme();
    const router = useRouter();
    
    return (
        <Card 
        style={[styles.productCard, { backgroundColor: colorScheme === 'dark' ? theme['color-basic-900'] : theme['color-basic-200'] }]} {...{activeOpacity: 0.5}}
        onPress={() => router.push({
            pathname: "/(main)/home/products/[product]",
            params: { product: item.id }
        })}
        >
            <View style={styles.productImagePlaceholder}>
                <ImageBackground source={{ uri: item.thumbnail }} style={styles.productImage} />
            </View>
            <Text category="s1">{item.title.slice(0, 14)}...</Text>
            <View style={styles.productDetails}>
            <Text category="c1">{item.stock} items</Text>
            <View style={styles.ratingContainer}>
                <Icon name="star" pack="eva" width={12} height={12} fill="#FFC107" />
                <Text category="c1">{item.rating}</Text>
            </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    productCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 8,
    },
    productImagePlaceholder: {
        height: 120,
        backgroundColor: '#E4E9F2',
        borderRadius: 8,
        marginBottom: 8,
    },
    productImage: {
        flex: 1,
    },
    productDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editButton: {
        borderRadius: 4,
    },
});


export default renderProductItem;
