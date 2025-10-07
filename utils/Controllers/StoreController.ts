import axios from "axios"

interface BusinessHours {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface Store {
    id: string,
    sellerId: string,
    name: string,
    storeType: string,
    description: string,
    profileImageUrl: string,
    coverImageUrl: string,
    tags: string[],
    businessHours: BusinessHours[],
    isOpen: boolean,
    isVerified: boolean,
    address: string,
    city: string,
    province: string,
    phoneNumber?: string,
    Location?: {
        Latitude: number,
        Longitude: number
    },
    createdAt: string,
    updatedAt: string
}

const getStore = async (storeId : string, token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stores/${storeId}`,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

const getMyStore = async (token: string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stores/my-store`,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

const updateStore = async (store: Store, token : string) => {
    // First get current store data to preserve existing image URLs if new ones are empty
    let currentStore;
    try {
        const currentResponse = await getMyStore(token);
        currentStore = currentResponse.data?.data || currentResponse.data;
    } catch (error) {
        console.warn('Could not fetch current store data:', error);
    }

    // Map Store object to UpdateStoreRequest format that backend expects
    const updateRequest = {
        name: store.name,
        storeType: store.storeType,
        description: store.description,
        tags: store.tags,
        phoneNumber: store.phoneNumber,
        // Preserve existing image URLs if new ones are empty
        profileImageUrl: store.profileImageUrl || currentStore?.profileImageUrl || '',
        coverImageUrl: store.coverImageUrl || currentStore?.coverImageUrl || '',
        address: store.address,
        city: store.city,
        province: store.province,
        businessHours: store.businessHours,
        isOpen: store.isOpen
    };

    console.log('Sending update request with image URLs:', {
        profileImageUrl: updateRequest.profileImageUrl,
        coverImageUrl: updateRequest.coverImageUrl,
        preservedFromCurrent: {
            profileImageUrl: currentStore?.profileImageUrl,
            coverImageUrl: currentStore?.coverImageUrl
        }
    });

    const response = await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stores/${store.id}`,
        updateRequest,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

export {Store, getStore, getMyStore, updateStore};