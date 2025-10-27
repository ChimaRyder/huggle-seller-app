export interface BundleProduct {
  id: string;
  name: string;
  tags: string[];
  stock: number;
  expiresOn?: Date;
  productType?: string;
  price: number;
  originalPrice: number;
  image: string[];
  isActive: boolean;
}

export interface BundleRequestDto {
  storeId: string;
  name: string;
  description?: string;
  productIds: string[];
  images: string[];
  stock: number;
  imageUrl?: string;
  price: number;
  originalPrice: number;
  expiresOn: Date;
  isActive: boolean;
  isDynamicPricingEnabled: boolean;
  dynamicPricingStartDays: number;
}

export interface SellerBundleDto {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  products: BundleProduct[];
  images: string[];
  stock: number;
  signature: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  price: number;
  originalPrice: number;
  totalCost: number;
  expiresOn: Date;
  isActive: boolean;
  isDynamicPricingEnabled: boolean;
  dynamicPricingStartDays: number;
  lastPriceUpdate?: Date;
  discountPercentage: number;
  totalProductPrice: number;
  totalProductOriginalPrice: number;
  totalProductCost: number;
  profitMargin: number;
}

export interface BundleUpdateRequestDto {
  name?: string;
  description?: string;
  productIds?: string[];
  images?: string[];
  stock?: number;
  imageUrl?: string;
  price?: number;
  originalPrice?: number;
  expiresOn?: Date;
  isActive?: boolean;
  isDynamicPricingEnabled?: boolean;
  dynamicPricingStartDays?: number;
}

// External server response format (matches BundleOut from API)
export interface ExternalBundleResponse {
  id: number;
  name: string;
  description?: string;
  products: ExternalProductIn[];
  images: string[];
  image_url?: string;
  stock: number;
  created_at: string;
}

// The API returns bundles directly as an array, not wrapped
export type ExternalMultipleBundlesResponse = ExternalBundleResponse[];

// Bundle generation request for AI service
export interface BundleGenerationRequest {
  store_id: string;
  num_bundles: number;
}

export interface ExternalProductIn {
  id: string;
  name: string;
  product_type?: string;
  expires_on?: string;
  stock: number;
  tags: string[];
  // Note: The API doesn't include price in ProductIn, we'll need to handle this
}

// Bundle creation form data
export interface BundleFormData {
  name: string;
  description: string;
  selectedProductIds: string[];
  images: string[];
  coverImage: string;
  price: string;
  originalPrice: string;
  stock: string;
  expiresOn: Date;
  isDynamicPricingEnabled: boolean;
  productCost: string;
  dynamicPricingStartDays: string;
}

// Bundle creation mode
export type BundleCreationMode = 'from-products' | 'external-generation';

// Product selection interface for bundle creation
export interface SelectableProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  coverImage: string;
  isSelected: boolean;
  productType: string;
  expiresOn?: Date;
}