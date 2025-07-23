import { Card, Text, Icon, ThemeType, Layout } from '@ui-kitten/components';
import { StyleSheet, View, ImageBackground, Appearance } from 'react-native';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';

const renderProductItem = ({ item, theme }: { item: any, theme: ThemeType }) => {
    const colorScheme = Appearance.getColorScheme();
    const router = useRouter();
    
    return (
        <Card 
        style={[styles.productCard]} {...{activeOpacity: 0.5}}
        onPress={() => router.push({
            pathname: "/(main)/products/[product]",
            params: { product: item.id }
        })}
        >
            <Layout level='3' style={styles.productImagePlaceholder}>
                <ImageBackground source={{ uri: item.coverImage }} style={styles.productImage} />
            </Layout>
            <View style={{flexDirection: 'column', justifyContent: "space-between", minHeight: 60}}>
                <View>
                    <Text category="s2" status='primary'>₱{item.discountedPrice.toFixed(2)}</Text>
                    <Text category="c1">{item.name}</Text>
                </View>

                <View style={styles.productDetails}>
                    <Text category="c1" appearance='hint'>{item.stock} {item.stock !== 1 ? 'items' : 'item'}</Text>
                    {/* <View style={styles.ratingContainer}>
                        <Star width={12} height={12} fill="#FFC107" color="#FFC107" />
                        <Text category="c1">{`${item.rating} (${item.ratingCount})`}</Text>
                    </View> */}
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
        borderRadius: 8,
        marginBottom: 8,
        overflow: "hidden"
    },
    productImage: {
        flex: 1,
    },
    productDetails: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
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
