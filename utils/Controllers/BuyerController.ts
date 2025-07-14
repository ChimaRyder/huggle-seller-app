import axios from "axios";

interface Buyer {
    name : string,
    emailAddress: string,
}

const getBuyer = async (token : string, id : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/buyer/${id}`, 
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    );

    return response;
}

export {Buyer, getBuyer};