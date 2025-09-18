import { Card, Text, Icon, ThemeType, Layout } from '@ui-kitten/components';
import { StyleSheet, View, ImageBackground, Appearance } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, AlertCircle, CheckCircle, X } from 'lucide-react-native';
import { colors } from '@/constants/theme';

const ProductItem = ({ item, theme }: { item: any, theme: ThemeType }) => {
    const colorScheme = Appearance.getColorScheme();
    const router = useRouter();
    
    const getStatusColor = () => {
        if (!item.isActive) return colors.danger;
        if (item.stock <= 10) return colors.warning;
        return colors.success;
    };

    const getStatusIcon = () => {
        if (!item.isActive) return <X size={12} color={colors.danger} />;
        if (item.stock <= 10) return <AlertCircle size={12} color={colors.warning} />;
        return <CheckCircle size={12} color={colors.success} />;
    };

    const getStockStatus = () => {
        if (!item.isActive) return 'Inactive';
        if (item.stock <= 5) return 'Very Low';
        if (item.stock <= 10) return 'Low Stock';
        return 'In Stock';
    };
    
    return (
        <Card
            style={[styles.productCard]}
            onPress={() => router.push({
                pathname: "/(main)/products/[product]",
                params: { product: item.id }
            })}
        >
            <View style={styles.productContent}>
                <Layout level='3' style={styles.productImagePlaceholder}>
                    <ImageBackground source={{ uri: item.coverImage }} style={styles.productImage}>
                        {/* Status Badge */}
                        <View style={styles.statusBadge}>
                            {getStatusIcon()}
                        </View>

                        {/* Original Price Badge (if discounted) */}
                        {item.originalPrice > item.discountedPrice && (
                            <View style={styles.discountBadge}>
                                <Text category="c2" style={styles.discountText}>
                                    {Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)}% OFF
                                </Text>
                            </View>
                        )}
                    </ImageBackground>
                </Layout>

                <View style={styles.productInfo}>
                    <Text category="s1" style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    <View style={styles.priceSection}>
                        <Text category="h6" status='primary'>₱{item.discountedPrice.toFixed(2)}</Text>
                        {item.originalPrice > item.discountedPrice && (
                            <Text category="c2" appearance='hint' style={styles.originalPrice}>
                                ₱{item.originalPrice.toFixed(2)}
                            </Text>
                        )}
                    </View>

                    <View style={styles.productDetails}>
                        <View style={styles.stockInfo}>
                            <Text category="c2" appearance='hint' style={[styles.stockText, { color: getStatusColor() }]}>
                                {item.stock} {item.stock !== 1 ? 'items' : 'item'}
                            </Text>
                            <Text category="c2" appearance='hint'>
                                • {getStockStatus()}
                            </Text>
                        </View>

                        {item.rating && item.ratingCount > 0 && (
                            <View style={styles.ratingContainer}>
                                <Star width={10} height={10} fill={colors.warning} color={colors.warning} />
                                <Text category="c2" appearance='hint'>
                                    {item.rating.toFixed(1)} ({item.ratingCount})
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    productCard: {
        width: '100%',
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 0,
    },
    productContent: {
        flexDirection: 'row',
        gap: 12,
    },
    productImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: "hidden",
        position: 'relative',
    },
    productImage: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 6,
    },
    statusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 2,
        alignSelf: 'flex-start',
    },
    discountBadge: {
        backgroundColor: 'rgba(244, 67, 54, 0.9)', // Using our danger color with opacity
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
        alignSelf: 'flex-end',
    },
    discountText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 8,
    },
    productInfo: {
        flex: 1,
        gap: 4,
        justifyContent: 'space-between',
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        fontSize: 11,
    },
    productName: {
        lineHeight: 18,
        fontWeight: '600',
    },
    productDetails: {
        gap: 4,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stockText: {
        fontWeight: '500',
        fontSize: 11,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
});


export default ProductItem;
