const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export interface PushTokenRequest {
  token: string;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  deviceType: string;
  deviceId?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePushTokenStatusRequest {
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Add or register a new push token for seller
 */
export const addSellerPushToken = async (
  authToken: string | null,
  pushTokenData: PushTokenRequest
): Promise<ApiResponse<PushToken>> => {
  try {
    console.log('📱 PushToken: Adding seller push token:', pushTokenData.token.substring(0, 20) + '...');
    
    const url = `${API_BASE_URL}/api/sellers/push-tokens`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify(pushTokenData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PushToken: Failed to register push token:', errorText);
      return {
        success: false,
        error: `Failed to register push token: ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ PushToken: Successfully registered seller push token');
    
    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('❌ PushToken: Error adding push token:', error);
    return {
      success: false,
      error: 'Failed to register push token',
    };
  }
};

/**
 * Update push token status (enable/disable) for seller
 */
export const updateSellerPushTokenStatus = async (
  authToken: string | null,
  tokenId: string,
  statusData: UpdatePushTokenStatusRequest
): Promise<ApiResponse<any>> => {
  try {
    console.log(`📱 PushToken: Updating seller token status to ${statusData.isActive ? 'active' : 'inactive'}`);
    
    const url = `${API_BASE_URL}/api/sellers/push-tokens/${tokenId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ PushToken: Failed to update push token status:', errorText);
      return {
        success: false,
        error: `Failed to update push token status: ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('✅ PushToken: Successfully updated seller push token status');
    
    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('❌ PushToken: Error updating push token status:', error);
    return {
      success: false,
      error: 'Failed to update push token status',
    };
  }
};

/**
 * Disable push token (set isActive to false) for seller
 */
export const disableSellerPushToken = async (
  authToken: string | null,
  tokenId: string
): Promise<ApiResponse<any>> => {
  return updateSellerPushTokenStatus(authToken, tokenId, { isActive: false });
};

/**
 * Enable push token (set isActive to true) for seller
 */
export const enableSellerPushToken = async (
  authToken: string | null,
  tokenId: string
): Promise<ApiResponse<any>> => {
  return updateSellerPushTokenStatus(authToken, tokenId, { isActive: true });
};
