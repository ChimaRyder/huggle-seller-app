import axios from 'axios';

interface Request {
    id: string,
    sellerId: string,	
    governmentIdImageUrl: string,	
    status: number,
    governmentIdType: string,
    businessPermitPdfUrl: string,	
    message: string,
    createdAt: string,
    updatedAt: string
}

interface InitialRequest {
    sellerId: string,	
    governmentIdImageUrl: string,	
    governmentIdType: string,
    businessPermitPdfUrl: string,	
}

const getRequests = async (token : string, sellerId : string) => {
    const response = await axios.get(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/verification-requests/seller/${sellerId}`,
    {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return response;
}

const getRequest = async (token : string, id : string) => {
    const response = await axios.get(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/verification-requests/${id}`,
    {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return response;
}

const createRequest = async (token : string, request : InitialRequest) => {
    const response = await axios.post(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/verification-requests`,
    request,
    {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return response;
}

export {Request, getRequests, getRequest, createRequest, InitialRequest}