interface Product {
    id? : string,
    name: string,
    description: string,
    productType: string,
    coverImage: string,
    additionalImages: string[],
    discountedPrice: number,
    originalPrice: number,
    expirationDate: string,
    stock: number,
    category: string[],
    storeId: string,
}

interface FullProduct extends Product {
    isActive : boolean,
    createdAt : string,
    updatedAt: string,
    rating: number,
    ratingCount: number,
}

const mockProducts: FullProduct[] = [
    {
        id: "1",
        name: "Premium Coffee Beans",
        description: "High-quality arabica coffee beans sourced from Colombia",
        productType: "Food & Beverage",
        coverImage: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
        additionalImages: [
            "https://images.unsplash.com/photo-1504627298434-2119d56b0fa8?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop"
        ],
        discountedPrice: 15.00,
        originalPrice: 20.00,
        expirationDate: "2024-12-31",
        stock: 50,
        category: ["Coffee", "Beverages"],
        storeId: "store-1",
        isActive: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-02-01T14:20:00Z",
        rating: 4.8,
        ratingCount: 125
    },
    {
        id: "2",
        name: "Organic Tea Collection",
        description: "A curated selection of organic teas from around the world",
        productType: "Food & Beverage",
        coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        additionalImages: [
            "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop"
        ],
        discountedPrice: 12.50,
        originalPrice: 15.00,
        expirationDate: "2025-01-31",
        stock: 30,
        category: ["Tea", "Beverages", "Organic"],
        storeId: "store-1",
        isActive: true,
        createdAt: "2024-01-20T09:15:00Z",
        updatedAt: "2024-02-05T11:30:00Z",
        rating: 4.6,
        ratingCount: 89
    },
    {
        id: "3",
        name: "Artisan Chocolate Box",
        description: "Handcrafted chocolate assortment with exotic flavors",
        productType: "Food & Beverage",
        coverImage: "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=400&h=400&fit=crop",
        additionalImages: [
            "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=400&fit=crop"
        ],
        discountedPrice: 25.00,
        originalPrice: 30.00,
        expirationDate: "2024-06-30",
        stock: 25,
        category: ["Chocolate", "Sweets", "Artisan"],
        storeId: "store-1",
        isActive: true,
        createdAt: "2024-01-10T16:45:00Z",
        updatedAt: "2024-01-25T10:00:00Z",
        rating: 4.9,
        ratingCount: 156
    }
];

const createProduct = async (product: Product, token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newProduct: FullProduct = {
                ...product,
                id: (mockProducts.length + 1).toString(),
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rating: 0,
                ratingCount: 0
            };
            mockProducts.push(newProduct);
            resolve({
                data: newProduct,
                status: 201
            });
        }, 800);
    });
};

const getAllProducts = async (search: string, token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const filteredProducts = search 
                ? mockProducts.filter(p => 
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.description.toLowerCase().includes(search.toLowerCase())
                  )
                : mockProducts;
            
            resolve({
                data: filteredProducts,
                status: 200
            });
        }, 600);
    });
};

const getProductbyID = async (productId: string, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const product = mockProducts.find(p => p.id === productId);
            if (product) {
                resolve({
                    data: product,
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Product not found"
                });
            }
        }, 400);
    });
};

const updateProduct = async (product: FullProduct, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockProducts.findIndex(p => p.id === product.id);
            if (index !== -1) {
                mockProducts[index] = {
                    ...product,
                    updatedAt: new Date().toISOString()
                };
                resolve({
                    data: mockProducts[index],
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Product not found"
                });
            }
        }, 700);
    });
};

const deleteProduct = async (id: string, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                mockProducts.splice(index, 1);
                resolve({
                    data: { message: "Product deleted successfully" },
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Product not found"
                });
            }
        }, 500);
    });
};

export { Product, createProduct, getAllProducts, getProductbyID, updateProduct, deleteProduct };