import { apiClient, handleApiResponse } from './api';
import { getAllProducts } from './Controllers/ProductController';

export interface StoreStatistics {
  productCount: number;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface AnalyticsSummary {
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

export interface ProductReview {
  id: string;
  rating: number;
  content: string;
  buyerName: string;
  createdAt: string;
}

/**
 * Get analytics summary for a store using /my-store endpoint
 * @param token - Authentication token
 * @returns Promise with analytics summary data
 */
export const getStoreAnalyticsSummary = async (token: string): Promise<AnalyticsSummary | null> => {
  try {
    // First get store info to get storeId
    const storeResponse = await apiClient.get<any>('/api/stores/my-store', token);
    const storeData = handleApiResponse<any>(storeResponse);
    
    if (!storeData?.Id) {
      return null;
    }

    // Get analytics summary for the store
    const response = await apiClient.get<any>(
      `/api/analytics/store/${storeData.Id}/summary?period=all`,
      token
    );
    
    const analyticsData = handleApiResponse<AnalyticsSummary>(response);
    return analyticsData;
  } catch (error) {
    console.error('Error fetching store analytics summary:', error);
    return null;
  }
};

/**
 * Get product count for a store
 * @param token - Authentication token
 * @returns Promise with product count
 */
export const getStoreProductCount = async (token: string): Promise<number> => {
  try {
    const response = await getAllProducts('', token);
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch (error) {
    console.error('Error fetching store product count:', error);
    return 0;
  }
};

/**
 * Get reviews for all products in a store
 * @param token - Authentication token
 * @returns Promise with aggregated review data
 */
export const getStoreReviewStats = async (token: string): Promise<{ averageRating: number; totalReviews: number }> => {
  try {
    // Get all products for the store
    const productsResponse = await getAllProducts('', token);
    const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
    
    let totalRating = 0;
    let totalReviews = 0;
    
    // Get reviews for each product
    for (const product of products) {
      try {
        const reviewsResponse = await apiClient.get<any>(
          `/api/reviews/product/${product.id}`,
          token
        );
        
        const reviews = handleApiResponse<ProductReview[]>(reviewsResponse) || [];
        
        for (const review of reviews) {
          if (review.rating && review.rating > 0) {
            totalRating += review.rating;
            totalReviews++;
          }
        }
      } catch (error) {
        // Continue if we can't get reviews for a specific product
        console.warn(`Could not fetch reviews for product ${product.id}:`, error);
      }
    }
    
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews
    };
  } catch (error) {
    console.error('Error fetching store review stats:', error);
    return { averageRating: 0, totalReviews: 0 };
  }
};

// Add a simple cache to prevent repeated requests
let statsCache: { [token: string]: { data: StoreStatistics; timestamp: number } } = {};
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Get comprehensive store statistics
 * @param token - Authentication token
 * @returns Promise with complete store statistics
 */
export const getStoreStatistics = async (token: string): Promise<StoreStatistics> => {
  try {
    // Check cache first
    const cached = statsCache[token];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const [productCount, analyticsSummary, reviewStats] = await Promise.all([
      getStoreProductCount(token),
      getStoreAnalyticsSummary(token),
      getStoreReviewStats(token)
    ]);

    const stats = {
      productCount,
      totalViews: analyticsSummary?.totalViewCount || 0,
      totalOrders: analyticsSummary?.totalOrderCount || 0,
      totalRevenue: analyticsSummary?.totalRevenue || 0,
      averageRating: reviewStats.averageRating,
      totalReviews: reviewStats.totalReviews
    };

    // Cache the result
    statsCache[token] = {
      data: stats,
      timestamp: Date.now()
    };

    return stats;
  } catch (error) {
    console.error('Error fetching comprehensive store statistics:', error);
    return {
      productCount: 0,
      totalViews: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalReviews: 0
    };
  }
};