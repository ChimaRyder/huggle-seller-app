import axios, { AxiosResponse, AxiosError } from 'axios';

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Standard headers for API requests
const getHeaders = (token?: string) => ({
  'Content-Type': 'application/json;charset=UTF-8',
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Generic API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Error response type
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// HTTP client class for reusable API calls
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL || '') {
    this.baseURL = baseURL;
  }

  // Generic GET request
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axios.get(
        `${this.baseURL}${endpoint}`,
        {
          headers: getHeaders(token),
        }
      );
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic POST request
  async post<T, U = any>(endpoint: string, data?: U, token?: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axios.post(
        `${this.baseURL}${endpoint}`,
        data,
        {
          headers: getHeaders(token),
        }
      );
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PUT request
  async put<T, U = any>(endpoint: string, data?: U, token?: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axios.put(
        `${this.baseURL}${endpoint}`,
        data,
        {
          headers: getHeaders(token),
        }
      );
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PATCH request
  async patch<T, U = any>(endpoint: string, data?: U, token?: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axios.patch(
        `${this.baseURL}${endpoint}`,
        data,
        {
          headers: getHeaders(token),
        }
      );
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axios.delete(
        `${this.baseURL}${endpoint}`,
        {
          headers: getHeaders(token),
        }
      );
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler for consistent error formatting
  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      return {
        message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
        status: axiosError.response?.status || 500,
        details: axiosError.response?.data,
      };
    }
    
    return {
      message: error.message || 'An unknown error occurred',
      status: 500,
      details: error,
    };
  }
}

// Export a default instance for convenience
export const apiClient = new ApiClient();

// Utility function for handling common API response patterns
export const handleApiResponse = <T>(response: ApiResponse<any>): T => {
  // If the response has a nested data structure (common with backend responses)
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data as T;
  }
  
  // Otherwise, return the data directly
  return response.data as T;
};

// Utility function for handling API errors in components
export const handleApiError = (error: ApiError): string => {
  switch (error.status) {
    case 400:
      return error.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication failed. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};