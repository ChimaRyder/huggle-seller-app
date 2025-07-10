import axios from "axios";

interface Product {
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

const createProduct = async (product: Product, token: string) => {

    const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/products/`,
        product,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      )

    return response;
}

const getAllProducts = async (search : string, token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/products/?Name=${search}`, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        }
    });

    return response;
}

const getProductbyID = async (productId : string, token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/products/${productId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });

    return response;
}

const updateProduct = async (product : FullProduct, token : string) => {
    const response = await axios
      .put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/products/update`,
        product,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      )

    return response;
}

export {Product, createProduct, getAllProducts, getProductbyID, updateProduct};
