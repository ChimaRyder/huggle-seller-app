import { apiClient, ApiResponse, handleApiResponse, handleApiError } from '@/utils/api';

// Types based on backend response models
export interface MonthlyAnalytics {
  id: string;
  month: number;
  year: number;
  viewCount: number;
  addToCartCount: number;
  orderCount: number;
  totalRevenue: number;
  createdAt: string;
}

export interface StoreAnalyticsResponse {
  storeId: string;
  storeName: string;
  monthsRequested: number;
  analytics: MonthlyAnalytics[];
}

export interface StoreAnalyticsSummary {
  storeId: string;
  storeName: string;
  period: string;
  totalViewCount: number;
  totalAddToCartCount: number;
  totalOrderCount: number;
  totalRevenue: number;
  averageViewsPerMonth: number;
  averageOrdersPerMonth: number;
  averageRevenuePerMonth: number;
  monthsCovered: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  viewCount: number;
  addToCartCount: number;
  orderCount: number;
  quantitySold: number;
  totalRevenue: number;
  conversionRate: number;
  cartConversionRate: number;
}

export interface TopProductsResponse {
  storeId: string;
  storeName: string;
  period: string;
  topProducts: TopProduct[];
}

export interface ConversionFunnelMetrics {
  views: number;
  addToCarts: number;
  orders: number;
  viewToCartRate: number;
  cartToOrderRate: number;
  overallConversionRate: number;
}

export interface RevenueMetrics {
  total: number;
  averageOrderValue: number;
  revenuePerView: number;
}

export interface ConversionFunnelResponse {
  storeId: string;
  storeName: string;
  period: string;
  funnel: ConversionFunnelMetrics;
  revenue: RevenueMetrics;
}

export interface MonthlyProductBreakdown {
  month: number;
  year: number;
  viewCount: number;
  addToCartCount: number;
  orderCount: number;
  quantitySold: number;
  revenue: number;
}

export interface ProductPerformanceResponse {
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  period: string;
  totalViews: number;
  totalAddToCarts: number;
  totalOrders: number;
  totalQuantitySold: number;
  totalRevenue: number;
  conversionRate: number;
  cartConversionRate: number;
  averageOrderValue: number;
  monthlyBreakdown: MonthlyProductBreakdown[];
}

/**
 * Get store analytics summary
 * @param token - Authentication token
 * @param storeId - Store ID
 * @param period - Period to analyze ('current', '6months', 'year', 'all')
 * @returns Store analytics summary
 */
export const getStoreAnalyticsSummary = async (
  token: string, 
  storeId: string, 
  period: 'current' | '6months' | 'year' | 'all' = 'current'
): Promise<ApiResponse<StoreAnalyticsSummary>> => {
  try {
    const endpoint = `/api/analytics/store/${storeId}/summary?period=${period}`;
    return await apiClient.get<StoreAnalyticsSummary>(endpoint, token);
  } catch (error: any) {
    console.error('Error fetching store analytics summary:', error);
    throw error;
  }
};

/**
 * Get top performing products for a store
 * @param token - Authentication token
 * @param storeId - Store ID
 * @param months - Number of months to analyze (optional)
 * @param limit - Number of top products to return (default 10)
 * @returns Top products data
 */
export const getStoreTopProducts = async (
  token: string, 
  storeId: string, 
  months?: number, 
  limit: number = 10
): Promise<ApiResponse<TopProductsResponse>> => {
  try {
    const params = new URLSearchParams();
    if (months) params.append('months', months.toString());
    params.append('limit', limit.toString());
    
    const endpoint = `/api/analytics/store/${storeId}/top-products?${params.toString()}`;
    return await apiClient.get<TopProductsResponse>(endpoint, token);
  } catch (error: any) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

/**
 * Get product performance analytics
 * @param token - Authentication token
 * @param productId - Product ID
 * @param period - Period to analyze ('current', '6months', 'year', 'all')
 * @returns Product performance data
 */
export const getProductPerformance = async (
  token: string, 
  productId: string, 
  period: 'current' | '6months' | 'year' | 'all' = 'current'
): Promise<ApiResponse<ProductPerformanceResponse>> => {
  try {
    const endpoint = `/api/analytics/product/${productId}?period=${period}`;
    console.log('📊 Fetching product performance from:', endpoint);
    
    const response = await apiClient.get<ProductPerformanceResponse>(endpoint, token);
    console.log('📈 Product performance response:', response);
    
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching product performance:', error);
    
    // Return empty analytics data if the endpoint doesn't exist or fails
    // This prevents the product page from breaking
    return {
      data: {
        productId,
        productName: 'Unknown Product',
        storeId: '',
        storeName: '',
        period,
        totalViews: 0,
        totalAddToCarts: 0,
        totalOrders: 0,
        totalQuantitySold: 0,
        totalRevenue: 0,
        conversionRate: 0,
        cartConversionRate: 0,
        averageOrderValue: 0,
        monthlyBreakdown: []
      },
      status: 200
    };
  }
};

/**
 * Calculate conversion funnel metrics from analytics data
 * @param summary - Store analytics summary
 * @param topProducts - Top products data (optional)
 * @returns Conversion funnel data
 */
export const calculateConversionFunnel = (
  summary: StoreAnalyticsSummary,
  topProducts?: TopProductsResponse
): ConversionFunnelResponse => {
  const totalViews = summary.totalViewCount;
  const totalAddToCarts = summary.totalAddToCartCount;
  const totalOrders = summary.totalOrderCount;
  const totalRevenue = summary.totalRevenue;

  return {
    storeId: summary.storeId,
    storeName: summary.storeName,
    period: summary.period,
    funnel: {
      views: totalViews,
      addToCarts: totalAddToCarts,
      orders: totalOrders,
      viewToCartRate: totalViews > 0 ? (totalAddToCarts / totalViews) * 100 : 0,
      cartToOrderRate: totalAddToCarts > 0 ? (totalOrders / totalAddToCarts) * 100 : 0,
      overallConversionRate: totalViews > 0 ? (totalOrders / totalViews) * 100 : 0
    },
    revenue: {
      total: totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      revenuePerView: totalViews > 0 ? totalRevenue / totalViews : 0
    }
  };
};


