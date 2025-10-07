import { apiClient, handleApiResponse, handleApiError } from '../api';
import { getAllProducts } from '../Controllers/ProductController';

interface Review {
    id: string;
    productId: string;
    buyerId: string;
    buyerName?: string;
    orderId: string;
    orderItemId?: string;
    content: string;
    imageUrls: string[]; // Multiple images array - matches backend ImageUrlsList
    rating: number;
    createdAt: string;
    updatedAt: string;
}

const getReviews = async (token: string, storeId: string) => {
    try {
        // Try the store endpoint first
        const response = await apiClient.get(`/api/reviews/store/${storeId}`, token);
        return {
            data: handleApiResponse<Review[]>(response),
            status: response.status
        };
    } catch (error: any) {
        console.error('Store reviews endpoint not available, trying alternative approach:', error);
        
        // If store endpoint doesn't exist, we need to get all products for the store
        // and then get reviews for each product to aggregate them
        try {
            console.log('Getting all products for store to aggregate reviews...');
            // Get all products for the store using the existing function
            const productsResponse = await getAllProducts('', token, storeId);
            const products = productsResponse.data || [];
            console.log(`Found ${products.length} products for store ${storeId}`);
            
            // Get reviews for each product and aggregate them
            let allReviews: Review[] = [];
            for (const product of products) {
                try {
                    console.log(`Getting reviews for product ${product.id}`);
                    const reviewsResponse = await getProductReviews(token, product.id);
                    const productReviews = reviewsResponse.data || [];
                    console.log(`Found ${productReviews.length} reviews for product ${product.id}`);
                    allReviews = [...allReviews, ...productReviews];
                } catch (reviewError) {
                    console.log(`No reviews for product ${product.id}:`, reviewError);
                }
            }
            
            console.log(`Total aggregated reviews: ${allReviews.length}`);
            
            // Sort by creation date, newest first
            allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            return {
                data: allReviews,
                status: 200
            };
        } catch (productsError) {
            console.error('Could not get products to aggregate reviews:', productsError);
            return {
                data: [] as Review[],
                status: 200
            };
        }
    }
};

const getProductReviews = async (token: string, productId: string) => {
    try {
        const response = await apiClient.get(`/api/reviews/product/${productId}`, token);
        return {
            data: handleApiResponse<Review[]>(response),
            status: response.status
        };
    } catch (error: any) {
        console.error('Error fetching product reviews:', error);
        throw error;
    }
};

export { Review, getReviews, getProductReviews };