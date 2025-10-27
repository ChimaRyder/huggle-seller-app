import { apiClient, handleApiResponse, handleApiError, ApiError } from '../api';
import { getStoreIdFromToken } from '../sellerUtils';
import {
  BundleRequestDto,
  BundleUpdateRequestDto,
  SellerBundleDto,
  ExternalBundleResponse,
  ExternalMultipleBundlesResponse,
  BundleGenerationRequest
} from '@/types/bundle';

/**
 * Creates a new bundle for the seller
 * @param bundle - Bundle data to create
 * @param token - Authentication token
 * @returns Promise with the created bundle response
 */
const createBundle = async (bundle: BundleRequestDto, token: string) => {
  try {
    // Make API call to create bundle
    const response = await apiClient.post<any, BundleRequestDto>(
      '/api/products/bundles',
      bundle,
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
 * Gets all bundles for the authenticated seller
 * @param search - Search term (optional)
 * @param token - Authentication token
 * @param storeId - The seller's store ID (optional, will be extracted from token if not provided)
 * @returns Promise with the seller's bundles
 */
const getAllBundles = async (search: string, token: string, storeId?: string) => {
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
    
    // Add bundles filter
    params.append('type', 'bundles');
    
    // Add query params to endpoint
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    // Make API call
    const response = await apiClient.get<any>(endpoint, token);
    
    // Extract the actual data from the response
    const rawData = handleApiResponse<any>(response);
    
    // Ensure we have an array to work with
    let bundles: SellerBundleDto[];
    if (Array.isArray(rawData)) {
      bundles = rawData as SellerBundleDto[];
    } else if (rawData && Array.isArray(rawData.items)) {
      bundles = rawData.items as SellerBundleDto[];
    } else if (rawData && Array.isArray(rawData.bundles)) {
      bundles = rawData.bundles as SellerBundleDto[];
    } else if (rawData && Array.isArray(rawData.data)) {
      bundles = rawData.data as SellerBundleDto[];
    } else {
      bundles = [];
    }
    
    return {
      data: bundles,
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
 * Gets a specific bundle by its ID
 * @param bundleId - The bundle ID to fetch
 * @param token - Authentication token
 * @returns Promise with the bundle data
 */
const getBundleById = async (bundleId: string, token: string) => {
  try {
    const response = await apiClient.get<any>(`/api/products/bundles/${bundleId}`, token);
    
    const bundleData = handleApiResponse<SellerBundleDto>(response);
    
    return {
      data: bundleData,
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
 * Updates an existing bundle
 * @param bundleId - The bundle ID to update
 * @param bundle - The bundle data to update
 * @param token - Authentication token
 * @returns Promise with the update response
 */
const updateBundle = async (bundleId: string, bundle: BundleUpdateRequestDto, token: string) => {
  try {
    // Make API call to update bundle
    const response = await apiClient.put<any, BundleUpdateRequestDto>(
      `/api/products/bundles/${bundleId}`,
      bundle,
      token
    );
    
    return {
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    // If it's already an API error with proper structure, re-throw it
    if (error.response && error.response.data) {
      throw error;
    }
    
    // If it's an ApiError object, format it properly
    if (error.message && error.status) {
      throw {
        response: {
          status: error.status,
          data: { message: error.message }
        }
      };
    }
    
    // Fallback for unknown error types
    throw error;
  }
};

/**
 * Deletes a bundle by its ID
 * @param bundleId - The bundle ID to delete
 * @param token - Authentication token
 * @returns Promise with the deletion response
 */
const deleteBundle = async (bundleId: string | number, token: string) => {
  try {
    const response = await apiClient.delete<any>(`/api/products/bundles/${bundleId}`, token);
    
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
 * Deletes multiple bundles by their IDs
 * @param bundleIds - Array of bundle IDs to delete
 * @param token - Authentication token
 * @returns Promise with the deletion results
 */
const deleteMultipleBundles = async (bundleIds: (string | number)[], token: string) => {
  const results = {
    deleted: [],
    failed: [],
    totalAttempted: bundleIds.length,
  };
  
  console.log(`🗑️ [deleteMultipleBundles] Attempting to delete ${bundleIds.length} bundles:`, bundleIds);
  
  for (const bundleId of bundleIds) {
    try {
      await deleteBundle(bundleId, token);
      results.deleted.push(bundleId);
      console.log(`✅ [deleteMultipleBundles] Successfully deleted bundle ${bundleId}`);
    } catch (error) {
      results.failed.push({ bundleId, error });
      console.error(`❌ [deleteMultipleBundles] Failed to delete bundle ${bundleId}:`, error);
    }
  }
  
  console.log(`📊 [deleteMultipleBundles] Results: ${results.deleted.length} deleted, ${results.failed.length} failed`);
  return results;
};

/**
 * Generates a bundle from an external AI service
 * @param storeId - The store ID for context
 * @param token - Authentication token
 * @returns Promise with the generated bundle data
 */
const generateBundleFromExternal = async (storeId: string, token: string) => {
  try {
    const bundleGenerationUrl = process.env.EXPO_PUBLIC_BUNDLE_GENERATION_URL;
    
    if (!bundleGenerationUrl) {
      throw new Error('Bundle generation service URL not configured');
    }
    
    // Prepare request payload for external service
    const requestPayload = {
      store_id: storeId,
      // Additional context can be added here
    };
    
    // Make API call to external bundle generation service
    const response = await fetch(bundleGenerationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestPayload),
    });
    
    if (!response.ok) {
      throw new Error(`External bundle generation failed: ${response.statusText}`);
    }
    
    const externalBundleData: ExternalBundleResponse = await response.json();
    
    return {
      data: externalBundleData,
      status: response.status
    };
  } catch (error) {
    if (error instanceof Error) {
      throw {
        response: {
          status: 500,
          data: { message: error.message }
        }
      };
    }
    throw error;
  }
};

/**
 * Generates multiple bundles from an external AI service with selection capability
 * @param storeId - The store ID for context
 * @param token - Authentication token
 * @param numBundles - Number of bundles to generate (default: 3)
 * @returns Promise with the generated bundles data
 */
const generateMultipleBundlesFromExternal = async (storeId: string, token: string, numBundles: number = 3) => {
  try {
    const bundleGenerationUrl = process.env.EXPO_PUBLIC_BUNDLE_GENERATION_URL;
    
    console.log('🌐 [generateMultipleBundlesFromExternal] Bundle generation URL:', bundleGenerationUrl);
    
    if (!bundleGenerationUrl) {
      throw new Error('Bundle generation service URL not configured');
    }
    
    // Prepare request payload for external service
    const requestPayload: BundleGenerationRequest = {
      store_id: storeId,
      num_bundles: numBundles,
    };
    
    console.log('📤 [generateMultipleBundlesFromExternal] Request payload:', requestPayload);
    
    // Make API call to external bundle generation service
    const response = await fetch(bundleGenerationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestPayload),
    });
    
    console.log('📥 [generateMultipleBundlesFromExternal] Response status:', response.status);
    console.log('📥 [generateMultipleBundlesFromExternal] Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [generateMultipleBundlesFromExternal] Error response:', errorText);
      throw new Error(`External bundle generation failed: ${response.statusText} - ${errorText}`);
    }
    
    const responseText = await response.text();
    console.log('📄 [generateMultipleBundlesFromExternal] Raw response text:', responseText);
    
    let externalBundlesData;
    try {
      externalBundlesData = JSON.parse(responseText);
      console.log('📦 [generateMultipleBundlesFromExternal] Parsed response:', externalBundlesData);
    } catch (parseError) {
      console.error('❌ [generateMultipleBundlesFromExternal] JSON parse error:', parseError);
      throw new Error('Invalid JSON response from bundle generation service');
    }
    
    return {
      data: externalBundlesData,
      status: response.status
    };
  } catch (error) {
    console.error('❌ [generateMultipleBundlesFromExternal] Full error:', error);
    if (error instanceof Error) {
      throw {
        response: {
          status: 500,
          data: { message: error.message }
        }
      };
    }
    throw error;
  }
};

/**
 * Converts external bundle response to bundle request format
 * @param externalBundle - External bundle response
 * @param storeId - Store ID
 * @returns BundleRequestDto formatted for backend
 */
const convertExternalBundleToRequest = (
  externalBundle: ExternalBundleResponse, 
  storeId: string
): BundleRequestDto => {
  // Since the AI bundles don't include product prices, we'll use estimated pricing
  // This is a reasonable default - the seller can adjust the prices in the form
  const estimatedPricePerProduct = 100; // ₱100 per product as default
  const totalProductCount = externalBundle.products.length;
  const estimatedOriginalPrice = totalProductCount * estimatedPricePerProduct;
  const estimatedBundlePrice = estimatedOriginalPrice * 0.85; // 15% bundle discount
  
  return {
    storeId: storeId,
    name: externalBundle.name,
    description: externalBundle.description || '',
    productIds: externalBundle.products.map(p => p.id),
    images: externalBundle.images || [],
    stock: externalBundle.stock,
    imageUrl: externalBundle.image_url,
    price: estimatedBundlePrice,
    originalPrice: estimatedOriginalPrice,
    expiresOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
    isDynamicPricingEnabled: false,
    dynamicPricingStartDays: 14
  };
};

export {
  createBundle,
  getAllBundles,
  getBundleById,
  updateBundle,
  deleteBundle,
  deleteMultipleBundles,
  generateBundleFromExternal,
  generateMultipleBundlesFromExternal,
  convertExternalBundleToRequest
};