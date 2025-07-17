import axios from "axios"

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

const updateStore = async (store: Store, token : string) => {
    console.log(token);
    console.log(store);
    const response = await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/stores/${store.id}`,
        store,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

export {Store, getStore, updateStore};