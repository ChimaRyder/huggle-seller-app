import axios from "axios"

interface PushToken {
    pushToken: string,
    userId: string,
    isActive: boolean
}

const addToken = async (token : string, pushToken : PushToken) => {
    const response = axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/pushtoken`,
        pushToken,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

const getToken = async (token : string) => {
    const response = axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/pushtoken`,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

const updateToken = async (token : string, pushToken : PushToken) => {
    const response = axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/pushtoken`,
        pushToken,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

const disableToken = async (token : string, pushToken : PushToken) => {
    const response = axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/pushtoken/disable`,
        pushToken,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    )

    return response;
}

export {PushToken, addToken, getToken, updateToken, disableToken}