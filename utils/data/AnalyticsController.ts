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

const mockTopProducts: TopProduct[] = [
    {
        productId: "1",
        productName: "Premium Coffee Beans",
        views: 1250,
        cartAdds: 340,
        purchases: 180,
        revenue: 2700,
        engagementScore: 85
    },
    {
        productId: "2", 
        productName: "Organic Tea Collection",
        views: 980,
        cartAdds: 260,
        purchases: 140,
        revenue: 1820,
        engagementScore: 78
    },
    {
        productId: "3",
        productName: "Artisan Chocolate Box",
        views: 750,
        cartAdds: 180,
        purchases: 95,
        revenue: 1425,
        engagementScore: 72
    }
];

const mockStoreAnalytics: StoreAnalytics = {
    storeName: "Huggle Sample Store",
    monthIndex: 2,
    totalProducts: 15,
    totalViews: 5840,
    totalCartAdds: 1250,
    totalPurchases: 620,
    totalRevenue: 9350,
    averageEngagementScore: 78.5,
    averageViewsPerProduct: 389,
    averageRevenuePerProduct: 623,
    topProducts: mockTopProducts
};

const getStoreAnalytics = async (token: string, storeId: string, timeSpan: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: mockStoreAnalytics,
                status: 200
            });
        }, 500);
    });
};

export { StoreAnalytics, TopProduct, getStoreAnalytics };