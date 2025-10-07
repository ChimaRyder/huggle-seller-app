import { Card, Text, Icon, ThemeType, Layout } from '@ui-kitten/components';
import { StyleSheet, View, ImageBackground, Appearance } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, AlertCircle, CheckCircle, X } from 'lucide-react-native';
import { colors } from '@/constants/theme';

const ProductItem = ({ item, theme }: { item: any, theme: ThemeType }) => {
    const colorScheme = Appearance.getColorScheme();
    const router = useRouter();
    
    const getStatusColor = () => {
        if (!item || !item.isActive) return colors.danger;
        const stock = Number(item.stock || 0);
        if (stock <= 10) return colors.warning;
        return colors.success;
    };

    const getStatusIcon = () => {
        if (!item || !item.isActive) return <X size={12} color={colors.danger} />;
        const stock = Number(item.stock || 0);
        if (stock <= 10) return <AlertCircle size={12} color={colors.warning} />;
        return <CheckCircle size={12} color={colors.success} />;
    };

    const getStockStatus = () => {
        if (!item || !item.isActive) return 'Inactive';
        const stock = Number(item.stock || 0);
        if (stock <= 5) return 'Very Low';
        if (stock <= 10) return 'Low Stock';
        return 'In Stock';
    };

    // Safety check for item
    if (!item) {
        return (
            <Card style={styles.productCard}>
                <Text>Loading...</Text>
            </Card>
        );
    }
    
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
                        {Number(item.originalPrice || 0) > Number(item.discountedPrice || 0) ? (
                            <View style={styles.discountBadge}>
                                <Text category="c2" style={styles.discountText}>
                                    {`${Math.round(((Number(item.originalPrice || 0) - Number(item.discountedPrice || 0)) / Number(item.originalPrice || 1)) * 100)}% OFF`}
                                </Text>
                            </View>
                        ) : null}
                    </ImageBackground>
                </Layout>

                <View style={styles.productInfo}>
                    <Text category="s1" style={styles.productName} numberOfLines={2}>
                        {String(item.name || 'Untitled Product')}
                    </Text>

                    <View style={styles.priceSection}>
                        <Text category="h6" status='primary'>{`₱${Number(item.discountedPrice || 0).toFixed(2)}`}</Text>
                        {Number(item.originalPrice || 0) > Number(item.discountedPrice || 0) ? (
                            <Text category="c2" appearance='hint' style={styles.originalPrice}>
                                {`₱${Number(item.originalPrice || 0).toFixed(2)}`}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.productDetails}>
                        <View style={styles.stockInfo}>
                            <Text category="c2" appearance='hint' style={[styles.stockText, { color: getStatusColor() }]}>
                                {`${Number(item.stock || 0)} ${Number(item.stock || 0) !== 1 ? 'items' : 'item'}`}
                            </Text>
                            <Text category="c2" appearance='hint'>
                                {`• ${getStockStatus()}`}
                            </Text>
                        </View>

                        {item.rating && Number(item.ratingCount || 0) > 0 ? (
                            <View style={styles.ratingContainer}>
                                <Star width={10} height={10} fill={colors.warning} color={colors.warning} />
                                <Text category="c2" appearance='hint'>
                                    {`${Number(item.rating || 0).toFixed(1)} (${Number(item.ratingCount || 0)})`}
                                </Text>
                            </View>
                        ) : null}
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
