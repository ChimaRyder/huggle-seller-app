import axios from 'axios'

interface Review {
  id: string;
  productId: string;
  buyerId: string;
  orderId: string;
  content: string;
  imageUrls: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const getReviews = async (token : string, storeId : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/reviews`,
        {
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    )

    return response;

}

export { Review }