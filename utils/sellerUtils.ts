import { User } from '@clerk/clerk-expo';

/**
 * Utility functions for seller-related operations
 */

/**
 * Extracts the store ID from JWT token claims (preferred method)
 * @param token - The JWT token from Clerk with seller_app template
 * @returns The store ID or null if not found
 */
export const getStoreIdFromToken = (token: string | null): string | null => {
  console.log('🔍 [getStoreIdFromToken] Starting token analysis...');
  
  if (!token) {
    console.log('❌ [getStoreIdFromToken] No token provided');
    return null;
  }
  
  console.log('🔑 [getStoreIdFromToken] Token length:', token.length);
  console.log('🔑 [getStoreIdFromToken] Token preview:', token.substring(0, 50) + '...');
  
  try {
    // Decode JWT token to extract claims
    // JWT format: header.payload.signature
    const parts = token.split('.');
    console.log('🧩 [getStoreIdFromToken] Token parts count:', parts.length);
    
    if (parts.length !== 3) {
      console.log('❌ [getStoreIdFromToken] Invalid JWT format');
      return null;
    }
    
    // Decode the payload (base64url)
    const payload = parts[1];
    console.log('📦 [getStoreIdFromToken] Payload length:', payload.length);
    
    // React Native compatible base64url decoding
    let paddedPayload = payload;
    while (paddedPayload.length % 4) {
      paddedPayload += '=';
    }
    
    // Convert base64url to base64
    const base64Payload = paddedPayload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode using React Native compatible method
    let decoded;
    if (typeof atob !== 'undefined') {
      // Browser/React Native environment
      decoded = JSON.parse(atob(base64Payload));
    } else {
      // Node.js environment (fallback)
      decoded = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    }
    
    console.log('🔓 [getStoreIdFromToken] Decoded token claims:', JSON.stringify(decoded, null, 2));
    
    // Extract store ID from claims (check multiple possible field names)
    const storeId = decoded.storeId || decoded.store_id || decoded.storeID || decoded.store_ID || 
                   decoded.customClaims?.storeId || decoded.metadata?.storeId || 
                   decoded.publicMetadata?.storeId || decoded.public_metadata?.storeId || null;
    
    console.log('🏪 [getStoreIdFromToken] Extracted store ID:', storeId);
    
    return storeId;
  } catch (error) {
    console.error('❌ [getStoreIdFromToken] Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Extracts the store ID from user's public metadata (fallback method)
 * @param user - The authenticated user object from Clerk
 * @returns The store ID or null if not found
 */
export const getStoreIdFromUser = (user: User | null | undefined): string | null => {
  if (!user || !user.publicMetadata) {
    return null;
  }
  
  return (user.publicMetadata.storeId as string) || null;
};

/**
 * Gets store ID using the preferred method (JWT claims) with fallback
 * @param token - The JWT token from Clerk
 * @param user - The user object (fallback)
 * @returns The store ID or null if not found
 */
export const getStoreId = (token: string | null, user?: User | null | undefined): string | null => {
  // Try to get from JWT claims first (preferred)
  const storeIdFromToken = getStoreIdFromToken(token);
  
  if (storeIdFromToken) {
    return storeIdFromToken;
  }
  
  // Fallback to user metadata
  const storeIdFromUser = getStoreIdFromUser(user);
  
  return storeIdFromUser;
};

/**
 * Checks if the seller registration is complete based on token or user data
 * @param token - The JWT token from Clerk
 * @param user - The authenticated user object from Clerk (fallback)
 * @returns True if seller registration is complete
 */
export const isSellerRegistrationComplete = (token: string | null, user?: User | null | undefined): boolean => {
  const storeId = getStoreId(token, user);
  return !!storeId;
};

/**
 * Gets seller information from token claims and user metadata
 * @param token - The JWT token from Clerk
 * @param user - The authenticated user object from Clerk  
 * @returns Seller information object
 */
export const getSellerInfo = (token: string | null, user?: User | null | undefined) => {
  const storeId = getStoreId(token, user);
  const isComplete = isSellerRegistrationComplete(token, user);
  
  return {
    storeId,
    isRegistrationComplete: isComplete,
    displayName: user?.firstName || user?.username || 'User',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    // Add other seller-specific metadata as needed
  };
};

/**
 * Validates if the seller can perform store-related operations using token claims
 * @param token - The JWT token from Clerk
 * @param user - The authenticated user object from Clerk (fallback)
 * @returns Object with validation result and error message if invalid
 */
export const validateSellerAccess = (token: string | null, user?: User | null | undefined) => {
  const storeId = getStoreId(token, user);
  
  if (!storeId) {
    return {
      isValid: false,
      error: 'Please complete your seller registration to access this feature.',
      storeId: null,
    };
  }
  
  return {
    isValid: true,
    error: null,
    storeId,
  };
};

/**
 * Legacy function for backward compatibility - now uses token approach
 * @deprecated Use validateSellerAccess(token, user) instead
 */
export const validateSellerAccessLegacy = (user: User | null | undefined) => {
  const storeId = getStoreIdFromUser(user);
  
  if (!storeId) {
    return {
      isValid: false,
      error: 'Please complete your seller registration to access this feature.',
      storeId: null,
    };
  }
  
  return {
    isValid: true,
    error: null,
    storeId,
  };
};
