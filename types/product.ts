// Product interfaces matching the backend DTOs

export interface BuyerProductDto {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  image: string[];
  tags: string[];
  productType?: string;
  price: number;
  originalPrice: number;
  stock: number;
  expiresOn: string; // ISO date string
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Dynamic pricing info for buyers (derived fields)
  discountPercentage: number;
  hasDiscount: boolean;
  
  // Store information for buyer context
  storeName?: string;
  storeImageUrl?: string;
  storeDescription?: string;
}

export interface SellerProductDto {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  image: string[];
  tags: string[];
  productType?: string;
  price: number;
  originalPrice: number;
  productCost: number;
  stock: number;
  expiresOn: string; // ISO date string
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  
  // Dynamic pricing fields for sellers
  isDynamicPricingEnabled: boolean;
  dynamicPricingStartDays: number;
  lastPriceUpdate?: string; // ISO date string
  discountPercentage: number;
}

export interface ProductRequestDto {
  storeId: string;
  name: string;
  description?: string;
  image: string[];
  tags: string[];
  productType?: string;
  price: number;
  originalPrice: number;
  productCost: number;
  stock?: number;
  expiresOn?: string; // ISO date string
  isActive?: boolean;
  
  // Dynamic pricing fields for product creation/updates
  isDynamicPricingEnabled?: boolean;
  dynamicPricingStartDays?: number;
}

// Legacy interfaces for backward compatibility (matching the current frontend usage)
export interface Product {
  id?: string;
  name: string;
  description: string;
  productType: string;
  coverImage: string;
  additionalImages: string[];
  discountedPrice: number;
  originalPrice: number;
  expirationDate: string;
  stock: number;
  category: string[];
  storeId: string;
  // Dynamic pricing fields
  isDynamicPricingEnabled?: boolean;
  productCost?: number;
  dynamicPricingStartDays?: number;
}

export interface FullProduct extends Product {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rating: number;
  ratingCount: number;
  // Additional dynamic pricing fields from SellerProductDto
  lastPriceUpdate?: string;
  discountPercentage?: number;
}

// Helper type for converting between legacy and new formats
export interface ProductAdapter {
  fromSellerDto: (dto: SellerProductDto) => FullProduct;
  toProductRequest: (product: Product, storeId: string) => ProductRequestDto;
}

// Pagination response for product lists
export interface PaginatedProductResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  page: number;
  totalPages: number;
}

// Product search and filter types
export enum ProductSortBy {
  Name = 'name',
  Price = 'price',
  Stock = 'stock',
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt'
}

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc'
}

export interface ProductSearchOptions {
  search?: string;
  sortBy?: ProductSortBy;
  sortDirection?: SortDirection;
  isActive?: boolean;
  lowStockThreshold?: number;
  page?: number;
  pageSize?: number;
}

// API response wrapper (matches backend ApiResponse format)
export interface ApiResponseWrapper<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}