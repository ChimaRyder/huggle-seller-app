import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, ActivityIndicator , Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Order, getOrderbyID, updateOrder, cancelOrder } from '@/utils/Controllers/OrderController';
import { Buyer, getBuyer } from '@/utils/data/BuyerController';
import { getProductbyID } from '@/utils/Controllers/ProductController';
import { FullProduct } from '@/types/product';
import { showToast } from "@/components/Toast";
import { colors, spacing, typography } from '@/constants/theme';
import { apiClient } from '@/utils/api';

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Ready For Pickup',
  'Completed',
  'Canceled',
];

const STATUS_MAP: { [key: string]: number } = {
  'Pending': 0,
  'Confirmed': 1,
  'Ready For Pickup': 2,
  'Ready for Pickup': 2,
  'ReadyForPickup': 2, // Handle backend format (no spaces)
  'Completed': 3,
  'Canceled': 4,
  'Cancelled': 4,
};

const getStatusIndex = (status: string): number => {
  return STATUS_MAP[status] ?? 0;
};

interface ProductItemProps {
  product: FullProduct;
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
  const { user } = useUser();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order>({} as Order);
  const [buyer, setBuyer] = useState<Buyer>({} as Buyer);
  const [products, setProducts] = useState<FullProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getStatusInfo = (status: string | number) => {
    const statusIndex = typeof status === 'string' ? getStatusIndex(status) : status;
    const statusMap = {
      0: { label: 'Pending', color: colors.warning, bgColor: colors.warning + '20' },
      1: { label: 'Confirmed', color: colors.info, bgColor: colors.info + '20' },
      2: { label: 'Ready for Pickup', color: colors.success, bgColor: colors.success + '20' },
      3: { label: 'Completed', color: colors.success, bgColor: colors.success + '20' },
      4: { label: 'Cancelled', color: colors.error, bgColor: colors.error + '20' },
    };
    return statusMap[statusIndex as keyof typeof statusMap] || statusMap[0];
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

  const getOrder = async (token: string) => {
    try {
      console.log('Fetching order details for:', params.id);
      const orderResponse = await getOrderbyID(params.id as string, token);
      console.log('Order fetched successfully:', JSON.stringify(orderResponse.data, null, 2));
      setOrder(orderResponse.data);
    } catch (error) {
      console.error("Error getting order: ", error);
    }  
  }

  const getUser = async (token: string) => {
    try {
      // If the order already has buyerName, use it as a fallback
      if (order.buyerName) {
        setBuyer({ 
          name: order.buyerName,
          emailAddress: 'No email provided',
        } as Buyer);
      }
      
      // Try to get full buyer details from API
      try {
        const buyerResponse = await getBuyer(token, order.buyerId);
        setBuyer((buyerResponse as any).data);
      } catch (buyerError) {
        console.warn("Could not fetch buyer details from API, using fallback:", buyerError);
        // Keep the fallback buyer data we set above
      }
    } catch (error) {
      console.error("Error getting buyer: ", error);
      // Set minimal buyer info as fallback
      setBuyer({ 
        name: order.buyerName || 'Unknown Customer',
        emailAddress: 'No email provided',
      } as Buyer);
    }
  }

  const getProducts = async (token: string) => {
    try {
      console.log('Processing order items:', order.items);
      
      if (!order.items || order.items.length === 0) {
        console.log('No items found in order');
        setProducts([]);
        return;
      }
      
      // Convert order items to FullProduct format for display
      const products = order.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        description: '', // Not provided in order item
        discountedPrice: item.unitPrice,
        coverImage: item.productImage || 'https://via.placeholder.com/150x150?text=No+Image'
      } as FullProduct));

      console.log('Products processed:', products.length);
      setProducts(products);
    } catch (error) {
      console.error("Error processing products: ", error);
      
      // Set fallback products from items if available
      if (order.items && order.items.length > 0) {
        const fallbackProducts = order.items.map((item) => ({
          id: item.productId,
          name: item.productName || 'Unknown Product',
          description: 'Product details unavailable',
          discountedPrice: item.unitPrice || 0,
          coverImage: item.productImage || 'https://via.placeholder.com/150x150?text=No+Image'
        } as FullProduct));
        setProducts(fallbackProducts);
      } else {
        setProducts([]);
      }
    }
  }
  
  const generateOrderNumber = (createdAt: string | Date): string => {
    try {
      const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
      if (isNaN(date.getTime())) {
        return "#UNKNOWN";
      }
      return `#${date.getTime().toString(36).toUpperCase()}`;
    } catch (error) {
      console.error("Error generating order number:", error);
      return "#ERROR";
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setSubmitting(true);
      const token = await getToken({template: "seller_app"});
      
      if (!token) {
        throw new Error('Authentication token not available');
      }

      // First, check current user authentication status
      console.log('📝 CHECKING USER AUTHENTICATION...');
      console.log('👤 Current user clerk ID:', user?.id);
      console.log('🏦 User store ID:', user?.publicMetadata?.storeId);
      console.log('📍 Order store ID:', order.storeId);
      console.log('🤔 Store IDs match:', user?.publicMetadata?.storeId === order.storeId);
      
      // Check if user has seller permissions
      if (user?.publicMetadata?.storeId !== order.storeId) {
        throw new Error(`Permission denied: User's store ID (${user?.publicMetadata?.storeId}) does not match order's store ID (${order.storeId})`);
      }
      
      // Debug: Check if user exists as seller in backend using proper API client
      try {
        console.log('🕵️ Checking if user exists as seller with proper JWT...');
        console.log('🔑 Using seller_app JWT template for authentication');
        
        const sellerResponse = await apiClient.get(`/api/sellers/${user?.id}`, token);
        
        if (sellerResponse.data) {
          console.log('👨‍💼 Seller exists:', JSON.stringify(sellerResponse.data, null, 2));
          console.log('✅ Authentication and seller record are both working correctly');
        }
      } catch (sellerError: any) {
        console.log('🚨 Seller check error details:', JSON.stringify(sellerError, null, 2));
        
        if (sellerError.status === 404) {
          console.log('⚠️ USER IS NOT REGISTERED AS SELLER!');
          console.log('🔧 This explains the "Invalid status transition" error');
          console.log('📝 The backend requires users to have a Seller record to update order status');
          
          console.log('🚫 ISSUE IDENTIFIED: Missing Seller Record');
          console.log('📈 Analysis:');
          console.log('  • User has store ID in metadata:', user?.publicMetadata?.storeId);
          console.log('  • But no Seller record exists in database for user:', user?.id);
          console.log('  • Backend validation requires Seller record to update orders');
          console.log('  • This suggests incomplete seller registration or data inconsistency');
          
          throw new Error('User is not registered as a seller in the database. Please complete seller registration or contact support.');
        } else if (sellerError.status === 401 || sellerError.status === 403) {
          console.log('🚨 AUTHENTICATION/AUTHORIZATION FAILED!');
          console.log('🔑 JWT template issue - seller_app template not working');
          console.log('📋 Error details:', sellerError.message);
          console.log('🔧 Possible fixes:');
          console.log('  • Check if seller_app JWT template is configured in Clerk');
          console.log('  • Verify JWT template includes proper seller role claims');
          console.log('  • Backend may not recognize the JWT structure');
          
          throw new Error(`Authentication failed: ${sellerError.message || 'Invalid JWT template or permissions'}`);
        } else {
          console.log('⚠️ Seller check request failed:', sellerError.status, sellerError.message);
          console.log('🤔 Unexpected error - check network connectivity and backend status');
          
          // Don't block the status update for other errors, just log them
          console.log('⏭️ Continuing with status update despite seller check failure');
        }
      }
      
      // First, refresh the order data to make sure we have the latest status
      console.log('🔄 REFRESHING ORDER DATA BEFORE UPDATE...');
      try {
        const freshOrderResponse = await getOrderbyID(order.id, token);
        const freshOrder = freshOrderResponse.data;
        console.log('🆕 Fresh order status:', freshOrder.status);
        
        if (freshOrder.status !== order.status) {
          console.log('⚠️ ORDER STATUS CHANGED! UI shows:', order.status, 'but backend has:', freshOrder.status);
          setOrder(freshOrder); // Update UI with fresh data
        }
        
        // Use fresh order data for the update
        console.log('🔄 ATTEMPTING STATUS UPDATE');
        console.log('📦 Order ID:', freshOrder.id);
        console.log('📊 Current Status:', freshOrder.status);
        console.log('🎯 Target Status:', newStatus);
        console.log('📅 Order Created:', freshOrder.createdAt);
        console.log('📅 Order Updated:', freshOrder.updatedAt);
        
        // Handle cancellation separately using the cancel endpoint
        if (newStatus === 'Canceled' || newStatus === 'Cancelled') {
          console.log('🗱️ Using cancel endpoint for order rejection');
          const cancelResponse = await cancelOrder(token, freshOrder.id, 'Order rejected by seller');
          console.log('Cancel response:', cancelResponse);
          setOrder(cancelResponse.data);
        } else {
          // Validate other transitions
          const validTransitions = {
            'Pending': ['Confirmed'],
            'Confirmed': ['Ready For Pickup'],
            'Ready For Pickup': ['Completed'],
            'ReadyForPickup': ['Completed'], // Backend uses ReadyForPickup without spaces
          };
          
          const allowedStatuses = validTransitions[freshOrder.status as keyof typeof validTransitions];
          console.log('🔍 VALIDATING STATUS TRANSITION:');
          console.log('  📊 Current status:', freshOrder.status);
          console.log('  🎯 Target status:', newStatus);
          console.log('  ✅ Allowed transitions:', allowedStatuses);
          console.log('  🤔 Is transition valid:', allowedStatuses?.includes(newStatus));
          
          if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
            throw new Error(`Invalid status transition: ${freshOrder.status} → ${newStatus}. Allowed transitions from ${freshOrder.status}: ${allowedStatuses?.join(', ') || 'none'}`);
          }
          
          console.log('✅ Frontend validation passed, sending to backend...');
          
          const updatedOrder = { ...freshOrder, status: newStatus };
          console.log('📝 Updated order payload:', JSON.stringify(updatedOrder, null, 2));
          
          console.log('🚀 SENDING UPDATE REQUEST TO BACKEND...');
          console.log('📡 Endpoint: PUT /api/orders/{id}/status');
          console.log('🔑 Using seller_app JWT token');
          console.log('👤 User ID:', user?.id);
          console.log('🏪 Store ID:', user?.publicMetadata?.storeId);
          console.log('📦 Order Store ID:', freshOrder.storeId);
          
          try {
            const orderResponse = await updateOrder(token, updatedOrder);
            console.log('✅ Update response successful:', orderResponse);
            setOrder(orderResponse.data);
          } catch (updateError: any) {
            console.log('❌ UPDATE REQUEST FAILED!');
            console.log('📋 Error details:', JSON.stringify(updateError, null, 2));
            console.log('🔍 Possible causes:');
            console.log('  • Backend seller validation still failing despite JWT');
            console.log('  • Backend status transition logic differs from frontend');
            console.log('  • Database constraint or additional validation rule');
            console.log('  • Order ownership validation failing');
            throw updateError;
          }
        }
        
      } catch (refreshError) {
        console.error('Error refreshing order data:', refreshError);
        // If we can't refresh, use the original order data
        if (newStatus === 'Canceled' || newStatus === 'Cancelled') {
          const cancelResponse = await cancelOrder(token, order.id, 'Order rejected by seller');
          setOrder(cancelResponse.data);
        } else {
          const updatedOrder = { ...order, status: newStatus };
          const orderResponse = await updateOrder(token, updatedOrder);
          setOrder(orderResponse.data);
        }
      }
      
      // Generate order number for toast message
      const orderNumber = generateOrderNumber(order.createdAt);
      
      switch (newStatus) {
        case 'Confirmed':
          showToast('success', 'Order Accepted!', `${orderNumber} has been accepted successfully.`);
          break;
        case 'Ready For Pickup':
        case 'Ready for Pickup':
          showToast('success', 'Ready for Pickup!', `${orderNumber} is now ready for pickup.`);
          break;
        case 'Completed':
          showToast('success', 'Order Completed!', `${orderNumber} has been completed.`);
          break;
        case 'Canceled':
        case 'Cancelled':
          showToast('success', 'Order Canceled', `${orderNumber} has been canceled.`);
          break;
      }
      
      // Navigate back after a short delay to allow toast to show
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error: any) {
      console.error("Error updating order: ", error);
      showToast('error', 'Update Failed', error.message || 'Something went wrong with updating the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const initializeOrder = async () => {
      try {
        console.log('🔧 Initializing with seller_app JWT template...');
        const token = await getToken({template: "seller_app"});
        if (token) {
          await getOrder(token);
        }
      } catch (error) {
        console.error('Error initializing order data:', error);
      }
    };
    
    initializeOrder();
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
              {generateOrderNumber(order.createdAt)}
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
                <Text style={styles.buyerEmail}>{buyer.emailAddress || 'No email provided'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {products.map((product, index) => {
            // Get quantity from the corresponding order item
            const quantity = order.items[index]?.quantity || 1;
            
            return (
              <ProductItem
                key={product.id}
                product={product}
                quantity={quantity}
              />
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₱{order.totalAmount.toFixed(2)}</Text>
        </View>

        {/* Action buttons based on order status */}
        {getStatusIndex(order.status) === 0 && (
          <View>
            <Text style={styles.actionTitle}>Order Actions</Text>
            <Text style={styles.actionSubtitle}>Choose an action for this pending order:</Text>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton, submitting && styles.actionButtonDisabled]}
                onPress={() => handleStatusUpdate('Canceled')}
                disabled={submitting}
              >
                <Ionicons name="close-circle" size={20} color={colors.text.inverse} style={{ marginRight: 8 }} />
                <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                  {submitting ? "Processing..." : "Reject"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton, submitting && styles.actionButtonDisabled]}
                onPress={() => handleStatusUpdate('Confirmed')}
                disabled={submitting}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} style={{ marginRight: 8 }} />
                <Text style={[styles.actionButtonText, styles.acceptButtonText]}>
                  {submitting ? "Processing..." : "Accept"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {getStatusIndex(order.status) === 1 && (
          <View>
            <Text style={styles.actionTitle}>Next Step</Text>
            <Text style={styles.actionSubtitle}>Mark this order as ready for customer pickup:</Text>
            <TouchableOpacity
              style={[styles.singleActionButton, styles.readyButton, submitting && styles.actionButtonDisabled]}
              onPress={() => handleStatusUpdate('Ready For Pickup')}
              disabled={submitting}
            >
              <Ionicons name="bag-check" size={20} color={colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.singleActionButtonText}>
                {submitting ? "Processing..." : "Mark Ready for Pickup"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {getStatusIndex(order.status) === 2 && (
          <View>
            <Text style={styles.actionTitle}>Complete Order</Text>
            <Text style={styles.actionSubtitle}>Mark this order as completed after customer pickup:</Text>
            <TouchableOpacity
              style={[styles.singleActionButton, styles.completeButton, submitting && styles.actionButtonDisabled]}
              onPress={() => handleStatusUpdate('Completed')}
              disabled={submitting}
            >
              <Ionicons name="checkmark-done-circle" size={20} color={colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.singleActionButtonText}>
                {submitting ? "Processing..." : "Mark as Completed"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {getStatusIndex(order.status) === 3 && (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-done-circle" size={48} color={colors.success} />
            <Text style={styles.completedText}>Order Completed</Text>
            <Text style={styles.completedSubtext}>This order has been successfully completed.</Text>
          </View>
        )}

        {getStatusIndex(order.status) === 4 && (
          <View style={styles.canceledContainer}>
            <Ionicons name="close-circle" size={48} color={colors.error} />
            <Text style={styles.canceledText}>Order Canceled</Text>
            <Text style={styles.canceledSubtext}>This order has been canceled.</Text>
          </View>
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
  actionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  singleActionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  readyButton: {
    backgroundColor: colors.primary,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: colors.text.inverse,
  },
  acceptButtonText: {
    color: colors.text.inverse,
  },
  singleActionButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  completedText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  completedSubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  canceledContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  canceledText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  canceledSubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
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