interface BusinessHours {
    isOpen: boolean,
    openTime: string,
    closeTime: string,
}

interface Store {
    id: string,
    sellerId: string,
    name: string,
    storeDescription: string,
    storeImageUrl: string,
    storeCoverUrl: string,
    storeCategory: string,
    tags: string[],
    businessHours: BusinessHours[],
    isClosedOverride: boolean,
    address: string,
    city: string,
    province: string,
    zipCode: string,
    latitude: number,
    longitude: number
}

const mockBusinessHours: BusinessHours[] = [
    { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Monday
    { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Tuesday  
    { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Wednesday
    { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Thursday
    { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Friday
    { isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Saturday
    { isOpen: false, openTime: "", closeTime: "" } // Sunday
];

const mockStore: Store = {
    id: "store-1",
    sellerId: "user-1",
    name: "Huggle Sample Store",
    storeDescription: "A premium store offering high-quality coffee, tea, and artisan chocolates sourced from around the world. We pride ourselves on sustainable sourcing and exceptional customer service.",
    storeImageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop",
    storeCoverUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=300&fit=crop",
    storeCategory: "Food & Beverages",
    tags: ["Coffee", "Tea", "Chocolate", "Organic", "Artisan", "Premium"],
    businessHours: mockBusinessHours,
    isClosedOverride: false,
    address: "123 Commerce Street, Building A, Unit 15",
    city: "Makati City",
    province: "Metro Manila",
    zipCode: "1224",
    latitude: 14.5547,
    longitude: 121.0244
};

const getStore = async (storeId: string, token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Return mockStore regardless of storeId for demo purposes
            const storeData = {
                ...mockStore,
                id: storeId // Use the requested storeId
            };
            resolve({
                data: storeData,
                status: 200
            });
        }, 400);
    });
};

const updateStore = async (store: Store, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (store.id === mockStore.id) {
                // Update the mock store data
                Object.assign(mockStore, store);
                resolve({
                    data: mockStore,
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Store not found"
                });
            }
        }, 600);
    });
};

export { Store, getStore, updateStore };