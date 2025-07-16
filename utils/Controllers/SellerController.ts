import axios from "axios";

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

const createSeller = async (seller: Seller, token?: string) => {
  const response = await axios.post(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/sellers`,
    seller,
    {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return response;
};

export { createSeller }; 