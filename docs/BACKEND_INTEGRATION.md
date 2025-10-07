# Backend Integration Architecture

This document outlines the backend integration architecture for the Huggle Seller App, focusing on reusability, maintainability, and easy understanding.

## Architecture Overview

The backend integration follows a layered architecture pattern:

```
Components (UI Layer)
    ↓
Controllers (API Layer)  
    ↓
API Client (HTTP Layer)
    ↓
Backend Services
```

## Core Components

### 1. API Client (`utils/api.ts`)

The `ApiClient` class provides a reusable HTTP client with the following features:
- Consistent error handling
- Automatic authentication header injection
- Standardized request/response format
- Type-safe generic methods

**Usage:**
```typescript
import { apiClient } from '@/utils/api';

const response = await apiClient.get<ProductDto[]>('/api/products', token);
```

### 2. Type Definitions (`types/product.ts`)

Comprehensive TypeScript interfaces that match backend DTOs:
- `BuyerProductDto` - For buyer-facing product data
- `SellerProductDto` - For seller-facing product data  
- `ProductRequestDto` - For create/update operations
- Legacy interfaces for backward compatibility

### 3. Data Adapters (`utils/productAdapter.ts`)

The `ProductAdapter` handles conversion between backend DTOs and legacy frontend formats:
- Ensures backward compatibility
- Centralizes data transformation logic
- Provides validation utilities

**Usage:**
```typescript
import { productAdapter } from '@/utils/productAdapter';

// Convert backend DTO to legacy format
const legacyProduct = productAdapter.fromSellerDto(sellerDto);
```

### 4. Controllers (`utils/Controllers/`)

Service layer that handles business logic and API calls:
- `ProductController.ts` - Product CRUD operations
- Each controller focuses on a specific domain
- Consistent error handling and response formatting

### 5. Utilities (`utils/sellerUtils.ts`)

Helper functions for seller-specific operations:
- Store ID extraction from JWT token claims (preferred)
- Store ID extraction from user metadata (fallback)
- Seller registration validation
- Access control checks

### 6. JWT Token Integration

The seller app uses Clerk's JWT tokens with the `seller_app` template, which includes the seller's store ID in the token claims. This provides several advantages:

**Benefits:**
- More secure than relying on client-side metadata
- Eliminates additional API calls to get seller info
- Ensures consistency between authentication and data access
- Reduces race conditions during seller registration

**Implementation:**
```typescript
// Get token with seller-specific claims
const token = await getToken({ template: "seller_app" });

// Extract store ID from token automatically
const storeId = getStoreIdFromToken(token);

// Use in API calls
const products = await getAllProducts("", token); // storeId extracted automatically
```

## Implementation Details

### Product Management Flow

1. **Fetching Products:**
   - Component gets JWT token with `getToken({ template: "seller_app" })`
   - Component calls `getAllProducts()` from ProductController
   - Controller extracts storeId from JWT token claims automatically
   - Controller validates seller access using `validateSellerAccess(token, user)`
   - API call made to `/api/products/store/{storeId}`
   - Response converted from `SellerProductDto[]` to legacy format

2. **Creating Products:**
   - Component provides Product data in legacy format
   - Controller converts to `ProductRequestDto` using productAdapter
   - API call made to `/api/products`
   - Response handled consistently

3. **Error Handling:**
   - Network errors caught and formatted by ApiClient
   - Business logic errors handled in Controllers
   - User-friendly messages shown in components

### Authentication & Authorization

- JWT tokens obtained using Clerk's `getToken({ template: "seller_app" })`
- **Store ID extracted from JWT token claims (preferred method)**
- Fallback to user's `publicMetadata.storeId` if token claims unavailable
- Access validation performed before API calls using token-based approach

## Benefits of This Architecture

1. **Reusability:** ApiClient and utilities can be used across all features
2. **Maintainability:** Clear separation of concerns
3. **Type Safety:** Strong TypeScript typing throughout
4. **Backward Compatibility:** Legacy format preserved while migrating to new backend
5. **Error Handling:** Consistent error patterns across the app
6. **Extensibility:** Easy to add new endpoints and features

## Adding New Endpoints

To add a new API endpoint:

1. **Define Types:** Add DTOs to appropriate type files
2. **Create Controller Method:**
   ```typescript
   const getNewData = async (token: string, storeId: string) => {
     const response = await apiClient.get<NewDataDto[]>('/api/new-data', token);
     return handleApiResponse<NewDataDto[]>(response);
   };
   ```
3. **Use in Components:**
   ```typescript
   import { getNewData } from '@/utils/Controllers/NewController';
   
   const data = await getNewData(token, storeId);
   ```

## Error Handling Patterns

### API Errors
```typescript
try {
  const response = await apiClient.get('/api/endpoint', token);
} catch (error) {
  const apiError = error as ApiError;
  const userMessage = handleApiError(apiError);
  showToast('error', 'Error', userMessage);
}
```

### Validation Errors
```typescript
const validation = validateSellerAccess(user);
if (!validation.isValid) {
  showToast('error', 'Access Denied', validation.error);
  return;
}
```

## Testing Considerations

- Mock the ApiClient in tests
- Test adapter conversions with sample data
- Validate error handling paths
- Test with different user permission levels

## Migration Notes

This architecture allows gradual migration from mock data to real backend:
1. Legacy components continue to work unchanged
2. Data flows through adapters for format conversion
3. Backend integration happens at the controller level
4. Once stable, legacy formats can be gradually phased out