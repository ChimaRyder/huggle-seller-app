import axios from 'axios';

interface Order {
    id: string,
    buyerId: string,
    storeId: string,
    productId: string[],
    quantity: number[],
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
    status: number
}

const getAllOrders = async (token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/orders`, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        }
    });

    return response;
}

const getOrderbyID = async (orderId : string, token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });

    return response;
}

const updatePost = async (token : string) => {
    const response = await axios
      .put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/orders`,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      )

    return response;
}

const deletePost = async(postId : number, token : string) => {
    const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/${postId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });

    return response;
}

export {Order, getAllOrders, getOrderbyID};