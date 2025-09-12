export interface BusinessHourDay {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}

export interface Seller {
    // Shop Information
    storeName: string;
    storeDescription: string;
    storeCategory: string;
    businessHours: BusinessHourDay[];
    // Business Information
    sellerType: string;
    storeRegisteredName: string;
    sellerEmail: string;
    sellerPhone: string;
    // Entity Information
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
    businessName?: string;
    // Address Information
    address: string;
    city: string;
    province: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
    // Tax Information
    governmentIdType?: string;
    governmentIdImage?: string;
    businessPermitPdf?: string;
    // Additional fields
    id?: string;
}

const mockSellers: Seller[] = [
    {
        id: "seller-1",
        storeName: "Huggle Sample Store",
        storeDescription: "A premium store offering high-quality coffee, tea, and artisan chocolates sourced from around the world.",
        storeCategory: "Food & Beverages",
        businessHours: [
            { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Monday
            { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Tuesday
            { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Wednesday
            { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Thursday
            { isOpen: true, openTime: "08:00", closeTime: "18:00" }, // Friday
            { isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Saturday
            { isOpen: false, openTime: "", closeTime: "" } // Sunday
        ],
        sellerType: "Individual",
        storeRegisteredName: "Huggle Premium Foods",
        sellerEmail: "seller@huggle.com",
        sellerPhone: "+639123456789",
        firstName: "Maria",
        lastName: "Santos",
        middleName: "Cruz",
        businessName: "Huggle Premium Foods",
        address: "123 Commerce Street, Building A, Unit 15",
        city: "Makati City",
        province: "Metro Manila",
        zipCode: "1224",
        latitude: 14.5547,
        longitude: 121.0244,
        governmentIdType: "Driver's License",
        governmentIdImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
        businessPermitPdf: "https://example.com/business-permit.pdf"
    }
];

const createSeller = async (seller: Seller, token?: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newSeller: Seller = {
                ...seller,
                id: `seller-${mockSellers.length + 1}`
            };
            mockSellers.push(newSeller);
            
            resolve({
                data: newSeller,
                status: 201
            });
        }, 1000); // Simulate longer creation time
    });
};

export { createSeller };