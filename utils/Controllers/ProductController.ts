import { apiClient, handleApiResponse, handleApiError, ApiError } from '../api';
import { productAdapter } from '../productAdapter';
import { getStoreIdFromToken } from '../sellerUtils';
import {
  Product,
  FullProduct,
  ProductRequestDto,
  SellerProductDto,
  ProductSearchOptions
} from '@/types/product';

/**
 * Creates a new product for the seller
 * @param product - Product data to create
 * @param token - Authentication token
 * @returns Promise with the created product response
 */
const createProduct = async (product: Product, token: string) => {
  try {
    // Convert legacy Product format to ProductRequestDto
    const productRequest = productAdapter.toProductRequest(product, product.storeId);
    
    // Make API call to create product
    const response = await apiClient.post<any, ProductRequestDto>(
      '/api/products',
      productRequest,
      token
    );
    
    return {
      data: response.data,
      status: response.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Gets all products for the authenticated seller
 * This function fetches products using the seller's storeId from JWT claims or parameter
 * @param search - Search term (optional)
 * @param token - Authentication token (contains storeId in claims)
 * @param storeId - The seller's store ID (optional, will be extracted from token if not provided)
 * @returns Promise with the seller's products in legacy format
 */
const getAllProducts = async (search: string, token: string, storeId?: string) => {
  try {
    // Extract storeId from token if not provided
    const extractedStoreId = getStoreIdFromToken(token);
    const actualStoreId = storeId || extractedStoreId;
    
    if (!actualStoreId) {
      throw new Error('Store ID not found in token or parameters. Please ensure you have a valid seller account.');
    }
    
    let endpoint = `/api/products/store/${actualStoreId}`;
    const params = new URLSearchParams();
    
    // Add search parameter if provided
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    // Add query params to endpoint if any
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    // Make API call
    const response = await apiClient.get<any>(endpoint, token);
    
    // Extract the actual data from the response
    const rawData = handleApiResponse<any>(response);
    
    // Ensure we have an array to work with
    let sellerProducts: SellerProductDto[];
    if (Array.isArray(rawData)) {
      sellerProducts = rawData as SellerProductDto[];
    } else if (rawData && Array.isArray(rawData.items)) {
      // Handle paginated response if backend returns { items: [...], hasNext: boolean, ... }
      sellerProducts = rawData.items as SellerProductDto[];
    } else if (rawData && Array.isArray(rawData.products)) {
      // Handle nested structure if backend returns { products: [...] }
      sellerProducts = rawData.products as SellerProductDto[];
    } else if (rawData && Array.isArray(rawData.data)) {
      // Handle nested structure if backend returns { data: [...] }
      sellerProducts = rawData.data as SellerProductDto[];
    } else {
      sellerProducts = [];
    }
    
    // Convert to legacy format for backward compatibility
    const legacyProducts = productAdapter.fromSellerDtoArray(sellerProducts);
    
    return {
      data: legacyProducts,
      status: response.status
    };
  } catch (error) {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      throw {
        response: {
          status: apiError.status,
          data: { message: apiError.message }
        }
      };
    }
    throw error;
  }
};

/**
 * Gets a specific product by its ID
 * @param productId - The product ID to fetch
 * @param token - Authentication token
 * @returns Promise with the product data in legacy format
 */
const getProductbyID = async (productId: string, token: string) => {
  try {
    const response = await apiClient.get<any>(`/api/products/${productId}`, token);
    
    // The response could be either BuyerProductDto or SellerProductDto depending on the user's role
    // For sellers, we'll get SellerProductDto and convert it to legacy format
    const productData = handleApiResponse<SellerProductDto>(response);
    const legacyProduct = productAdapter.fromSellerDto(productData);
    
    return {
      data: legacyProduct,
      status: response.status
    };
  } catch (error) {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      throw {
        response: {
          status: apiError.status,
          data: { message: apiError.message }
        }
      };
    }
    throw error;
  }
};

/**
 * Updates an existing product
 * @param product - The product data to update (legacy format)
 * @param token - Authentication token
 * @returns Promise with the update response
 */
const updateProduct = async (product: FullProduct, token: string) => {
  try {
    if (!product.id) {
      throw new Error('Product ID is required for updates');
    }
    
    // Convert legacy format to ProductRequestDto
    const productRequest = productAdapter.toProductRequest(product, product.storeId);
    
    // Make API call to update product
    const response = await apiClient.put<any, ProductRequestDto>(
      `/api/products/${product.id}`,
      productRequest,
      token
    );
    
    return {
      data: response.data,
      status: response.status
    };
  } catch (error) {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      throw {
        response: {
          status: apiError.status,
          data: { message: apiError.message }
        }
      };
    }
    throw error;
  }
};

/**
 * Deletes a product by its ID
 * @param id - The product ID to delete
 * @param token - Authentication token
 * @returns Promise with the deletion response
 */
const deleteProduct = async (id: string, token: string) => {
  try {
    const response = await apiClient.delete<any>(`/api/products/${id}`, token);
    
    return {
      data: response.data,
      status: response.status
    };
  } catch (error) {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      throw {
        response: {
          status: apiError.status,
          data: { message: apiError.message }
        }
      };
    }
    throw error;
  }
};

export {Product, createProduct, getAllProducts, getProductbyID, updateProduct, deleteProduct};
