import { apiClient, handleApiResponse, handleApiError } from '../api';

interface OrderItem {
    id: string,
    productId: string,
    productName: string,
    productImage: string,
    quantity: number,
    unitPrice: number,
    totalPrice: number,
    hasReviewed: boolean
}

interface Order {
    id: string,
    buyerId: string,
    buyerName?: string,
    storeId: string,
    storeName?: string,
    items: OrderItem[],
    totalAmount: number,
    status: string,
    createdAt: string | Date,
    updatedAt: string | Date,
    // Legacy fields for backwards compatibility
    productId?: string[],
    quantity?: number[],
    totalPrice?: number
}

const getAllOrders = async (token: string, storeId?: string) => {
    try {
        // Always use the general orders endpoint since backend filters by role
        const endpoint = '/api/orders';
        
        console.log('Fetching orders from endpoint:', endpoint);
        const response = await apiClient.get(endpoint, token);
        const allOrders = handleApiResponse<Order[]>(response);
        
        // If storeId is provided, filter orders by storeId on client side
        if (storeId) {
            const storeOrders = allOrders.filter(order => order.storeId === storeId);
            console.log(`Filtered ${storeOrders.length} orders for store ${storeId}`);
            
            return {
                data: storeOrders,
                status: response.status
            };
        }
        
        return {
            data: allOrders,
            status: response.status
        };
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        
        // Handle 404 gracefully by returning empty array
        if (error?.status === 404 || error?.response?.status === 404) {
            console.log('Orders endpoint not available, returning empty result');
            return {
                data: [],
                status: 200
            };
        }
        
        // Re-throw non-404 errors
        throw error;
    }
};

const getOrderbyID = async (orderId: string, token: string) => {
    try {
        console.log('Fetching order by ID:', orderId);
        const response = await apiClient.get(`/api/orders/${orderId}`, token);
        
        return {
            data: handleApiResponse<Order>(response),
            status: response.status
        };
    } catch (error: any) {
        console.error('Error fetching order by ID:', error);
        
        // Handle 404 gracefully for individual orders
        if (error?.status === 404 || error?.response?.status === 404) {
            console.log(`Order ${orderId} not found, this may be expected`);
        }
        
        throw error;
    }
};

// Map string status to OrderStatus enum values (matching backend)
const getStatusEnumValue = (status: string): number => {
    const statusMap: { [key: string]: number } = {
        'Pending': 0,
        'Confirmed': 1, 
        'ReadyForPickup': 2,
        'Ready For Pickup': 2, // Handle space variation
        'Ready for Pickup': 2, // Handle case variation
        'Completed': 3,
        'Cancelled': 4,
        'Canceled': 4, // Handle spelling variation
    };
    
    const enumValue = statusMap[status];
    if (enumValue === undefined) {
        throw new Error(`Unknown order status: ${status}`);
    }
    
    return enumValue;
};

const cancelOrder = async (token: string, orderId: string, reason?: string) => {
    try {
        console.log('Canceling order:', orderId, 'with reason:', reason);
        
        // Use the correct backend endpoint: PUT /api/orders/{orderId}/cancel
        const requestBody = {
            reason: reason || 'Canceled by seller'
        };
        
        console.log('Cancel request body:', JSON.stringify(requestBody));
        const response = await apiClient.put(`/api/orders/${orderId}/cancel`, requestBody, token);
        
        console.log('Order cancellation successful:', response.status);
        
        return {
            data: handleApiResponse<Order>(response),
            status: response.status
        };
        
    } catch (error: any) {
        console.error('Error canceling order:', error);
        throw error;
    }
};

const updateOrder = async (token: string, order: Order) => {
    try {
        console.log('Updating order:', order.id, 'with status:', order.status);
        
        // Convert string status to enum value
        const statusEnumValue = getStatusEnumValue(order.status);
        console.log('Mapped status to enum value:', statusEnumValue);
        
        // Use the correct backend endpoint: PUT /api/orders/{orderId}/status
        const requestBody = {
            status: statusEnumValue
        };
        
        console.log('Request body:', JSON.stringify(requestBody));
        const response = await apiClient.put(`/api/orders/${order.id}/status`, requestBody, token);
        
        console.log('Order status update successful:', response.status);
        
        // The backend returns a minimal response, so we need to return the updated order
        // with the new status for the UI to update properly
        const updatedOrder = {
            ...order,
            status: order.status,
            updatedAt: new Date().toISOString()
        };
        
        return {
            data: updatedOrder,
            status: response.status
        };
        
    } catch (error: any) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export { Order, OrderItem, getAllOrders, getOrderbyID, updateOrder, cancelOrder };
