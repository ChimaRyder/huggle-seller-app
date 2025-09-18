import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { Order, getOrderbyID, updateOrder } from '@/utils/data/OrderController';
import { Buyer, getBuyer } from '@/utils/data/BuyerController';
import { Product, getProductbyID } from '@/utils/data/ProductController';
import { showToast } from "@/components/Toast";
import { colors, spacing, typography } from '@/constants/theme';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Ready For Pickup',
  'Completed',
  'Canceled',
];

interface ProductItemProps {
  product: Product;
  quantity: number,
}

const ProductItem: React.FC<ProductItemProps> = ({ product, quantity }) => (
  <View style={productItemStyles.container}>
    <View style={productItemStyles.productCard}>
      <Image source={{ uri: product.coverImage }} style={productItemStyles.productImage} />
      <View style={productItemStyles.productInfo}>
        <Text style={productItemStyles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={productItemStyles.productDescription} numberOfLines={2}>
          {product.description || 'No description available'}
        </Text>
        <Text style={productItemStyles.productQuantity}>
          x{quantity}
        </Text>
        <View style={productItemStyles.productPriceContainer}>
          <Text style={productItemStyles.productPrice}>
            ₱{(product.discountedPrice * quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const productItemStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
    position: 'relative',
  },
  productName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  productQuantity: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  productPriceContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  productPrice: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default function OrderDetailsScreen() {
  const { getToken } = useAuth();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order>({} as Order);
  const [buyer, setBuyer] = useState<Buyer>({} as Buyer);
  const [products, setProducts] = useState<Array<Product>>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getStatusInfo = (status: number) => {
    const statusMap = {
      0: { label: 'Pending', color: colors.warning, bgColor: colors.warning + '20' },
      1: { label: 'Confirmed', color: colors.info, bgColor: colors.info + '20' },
      2: { label: 'Ready for Pickup', color: colors.success, bgColor: colors.success + '20' },
      3: { label: 'Completed', color: colors.success, bgColor: colors.success + '20' },
      4: { label: 'Cancelled', color: colors.error, bgColor: colors.error + '20' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap[0];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrder = async (token : string) => {
    try {
      const orderResponse = await getOrderbyID(params.id as string, token ?? "");
      setOrder(orderResponse.data);
    } catch (error) {
      console.error("Error getting order: ", error);
    }  
  }

  const getUser = async (token: string) => {
    try {
      const buyerResponse = await getBuyer(token ?? "", order.buyerId);
      setBuyer(buyerResponse.data);
    } catch (error) {
      console.error("Error getting buyer: ", error);
    }
  }

  const getProducts = async (token: string) => {
    try {
      const productPromises = order.productId.map(id =>
        getProductbyID(id, token ?? "")
      );

      const productResponses = await Promise.all(productPromises);
      const products = productResponses.map(response => response.data);

      setProducts(products);
    } catch (error) {
      console.error("Error getting products: ", error);
    }
  }
  
  const handleStatusUpdate = async (status : number) => {
    try {
      setSubmitting(true);
      const token = await getToken({template: "seller_app"});

      console.log(status);
      const orderResponse = await updateOrder(token ?? "", {...order, status});
      
      console.log("Order accepted:", orderResponse.data);
      router.dismissTo("/(main)");
    
      switch (status) {
        case 1:
          showToast('success', 'Order Accepted!', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been updated successfully.`);
          break;
        case 2:
          showToast('success', 'Order Notified!', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been notified for pickup.`);
          break;
        case 3:
          showToast('success', 'Order Completed!', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been completed.`);
          break;
        case 4:
          showToast('success', 'Order Canceled', `#${Date.parse(order.createdAt.toString()).toString(36).toUpperCase()} has been canceled.`);
          break;
      }
    } catch (error) {
      console.error("Error updating order: ", error);
      showToast('error', 'Uh Oh', `Something went wrong with updating the order. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    getToken({template: "seller_app"})
    .then(token => {
      getOrder(token as string);
    })
  }, [])

  useEffect(() => {
    if (order.id === undefined) return;

    const loadOrderData = async () => {
      try {
        setLoading(true);
        const token = await getToken({template: "seller_app"});
        await Promise.all([
          getUser(token as string),
          getProducts(token as string)
        ]);
      } catch (error) {
        console.error("Error loading order data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [order])

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order.id) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
            <Text style={styles.orderIdText}>
              #{Date.parse(order.createdAt.toString()).toString(36).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.orderDateText}>
            <Text style={styles.orderDateLabel}>Placed: </Text>
            {formatDate(order.createdAt.toString())}
          </Text>
          {order.updatedAt !== order.createdAt && (
            <Text style={styles.orderUpdateText}>
              <Text style={styles.orderUpdateLabel}>Updated: </Text>
              {formatDate(order.updatedAt.toString())}
            </Text>
          )}
        </View>

        {/* Buyer Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>
          <View style={styles.buyerCard}>
            <View style={styles.buyerHeader}>
              <View style={styles.buyerAvatarContainer}>
                <View style={styles.buyerAvatar}>
                  <Text style={styles.buyerAvatarText}>
                    {buyer.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              </View>
              <View style={styles.buyerInfo}>
                <Text style={styles.buyerName}>{buyer.name || 'Unknown Buyer'}</Text>
                <Text style={styles.buyerEmail}>{buyer.email || 'No email provided'}</Text>
                {buyer.phone && (
                  <Text style={styles.buyerPhone}>📞 {buyer.phone}</Text>
                )}
              </View>
            </View>
            {buyer.address && (
              <View style={styles.buyerAddressContainer}>
                <Text style={styles.buyerAddressLabel}>Delivery Address:</Text>
                <Text style={styles.buyerAddress}>{buyer.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              quantity={order.quantity[index]}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₱{order.totalPrice.toFixed(2)}</Text>
        </View>

        {/* Action buttons based on order status */}
        {order.status === 0 && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton, submitting && styles.actionButtonDisabled]}
              onPress={() => handleStatusUpdate(ORDER_STATUSES.indexOf('Canceled'))}
              disabled={submitting}
            >
              <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                {submitting ? "Processing..." : "Reject Order"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton, submitting && styles.actionButtonDisabled]}
              onPress={() => handleStatusUpdate(ORDER_STATUSES.indexOf('Confirmed'))}
              disabled={submitting}
            >
              <Text style={[styles.actionButtonText, styles.acceptButtonText]}>
                {submitting ? "Processing..." : "Accept Order"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 1 && (
          <TouchableOpacity
            style={[styles.singleActionButton, submitting && styles.actionButtonDisabled]}
            onPress={() => handleStatusUpdate(ORDER_STATUSES.indexOf('Ready For Pickup'))}
            disabled={submitting}
          >
            <Text style={styles.singleActionButtonText}>
              {submitting ? "Processing..." : "Mark Ready for Pickup"}
            </Text>
          </TouchableOpacity>
        )}

        {order.status === 2 && (
          <TouchableOpacity
            style={[styles.singleActionButton, submitting && styles.actionButtonDisabled]}
            onPress={() => handleStatusUpdate(ORDER_STATUSES.indexOf('Completed'))}
            disabled={submitting}
          >
            <Text style={styles.singleActionButtonText}>
              {submitting ? "Processing..." : "Complete Order"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  statusCard: {
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '600',
  },
  orderIdText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  orderDateText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  orderDateLabel: {
    fontWeight: typography.fontWeights.bold,
  },
  orderUpdateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  orderUpdateLabel: {
    fontWeight: typography.fontWeights.bold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  buyerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
  },
  buyerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buyerAvatarContainer: {
    marginRight: spacing.md,
  },
  buyerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyerAvatarText: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  buyerEmail: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  buyerPhone: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  buyerAddressContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.sm,
  },
  buyerAddressLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  buyerAddress: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
  totalAmount: {
    fontSize: typography.fontSizes.xxl,
    color: colors.primary,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  singleActionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: colors.text.inverse,
  },
  acceptButtonText: {
    color: colors.text.inverse,
  },
  singleActionButtonText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  backButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.inverse,
    fontWeight: '600',
  },
}); 