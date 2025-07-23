import axios from "axios";

interface TopProduct {
    productId: string;
    productName: string;
    views: number;
    cartAdds: number;
    purchases: number;
    revenue: number;
    engagementScore: number;
}

interface StoreAnalytics {
    storeName: string;
    monthIndex: number;
    totalProducts: number;
    totalViews: number;
    totalCartAdds: number;
    totalPurchases: number;
    totalRevenue: number;
    averageEngagementScore: number;
    averageViewsPerProduct: number;
    averageRevenuePerProduct: number;
    topProducts: Array<TopProduct>;
}

const getStoreAnalytics = async (token: string, storeId: string, timeSpan: number) => {
  const response = await axios.get(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/analytics/store/${storeId}/summary/${timeSpan}`,
    {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

export { StoreAnalytics, TopProduct, getStoreAnalytics };
