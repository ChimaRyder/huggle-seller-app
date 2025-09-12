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

const mockReviews: Review[] = [
    {
        id: "review-001",
        productId: "2",
        buyerId: "buyer-1", 
        orderId: "ord-001",
        content: "Absolutely love this organic tea collection! The variety is amazing and the quality is top-notch. The Earl Grey is my favorite.",
        imageUrls: [
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop"
        ],
        rating: 5,
        createdAt: "2024-02-14T16:30:00Z",
        updatedAt: "2024-02-14T16:30:00Z"
    },
    {
        id: "review-002",
        productId: "1",
        buyerId: "buyer-2",
        orderId: "ord-003", 
        content: "Great coffee beans! Rich flavor and perfect roast. Will definitely order again.",
        imageUrls: [],
        rating: 5,
        createdAt: "2024-02-13T14:20:00Z",
        updatedAt: "2024-02-13T14:20:00Z"
    },
    {
        id: "review-003",
        productId: "3",
        buyerId: "buyer-3",
        orderId: "ord-002",
        content: "The chocolate box was a delightful surprise. Each piece had unique flavors and the presentation was beautiful.",
        imageUrls: [
            "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&h=200&fit=crop"
        ],
        rating: 4,
        createdAt: "2024-02-12T11:45:00Z",
        updatedAt: "2024-02-12T11:45:00Z"
    },
    {
        id: "review-004",
        productId: "1",
        buyerId: "buyer-4",
        orderId: "ord-005",
        content: "Good coffee but the packaging could be improved. The flavor is excellent though.",
        imageUrls: [],
        rating: 4,
        createdAt: "2024-02-11T09:30:00Z", 
        updatedAt: "2024-02-11T09:30:00Z"
    },
    {
        id: "review-005",
        productId: "2",
        buyerId: "buyer-2",
        orderId: "ord-006",
        content: "The chamomile tea is very soothing. Perfect for evening relaxation.",
        imageUrls: [],
        rating: 5,
        createdAt: "2024-02-10T19:15:00Z",
        updatedAt: "2024-02-10T19:15:00Z"
    }
];

const getReviews = async (token: string, storeId: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes, return all reviews (in real app would filter by store)
            resolve({
                data: mockReviews,
                status: 200
            });
        }, 500);
    });
};

const getProductReviews = async (token: string, productId: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const productReviews = mockReviews.filter(r => r.productId === productId);
            resolve({
                data: productReviews,
                status: 200
            });
        }, 400);
    });
};

export { Review, getReviews, getProductReviews };