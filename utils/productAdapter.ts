import { 
  SellerProductDto, 
  Product, 
  FullProduct, 
  ProductRequestDto,
  ProductAdapter 
} from '@/types/product';

/**
 * Utility class for converting between backend DTOs and legacy frontend format
 * This ensures backward compatibility while transitioning to the new backend structure
 */
export class ProductAdapterImpl implements ProductAdapter {
  /**
   * Converts a SellerProductDto from the backend to the legacy FullProduct format
   * used throughout the existing frontend components
   */
  fromSellerDto(dto: SellerProductDto): FullProduct {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description || '',
      productType: dto.productType || '',
      // Map the first image as cover image, rest as additional images
      coverImage: dto.image.length > 0 ? dto.image[0] : '',
      additionalImages: dto.image.slice(1),
      discountedPrice: dto.price,
      originalPrice: dto.originalPrice,
      expirationDate: dto.expiresOn,
      stock: dto.stock,
      category: dto.tags, // Map tags to category for legacy compatibility
      storeId: dto.storeId,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      rating: 0, // These fields aren't available in SellerProductDto
      ratingCount: 0,
    };
  }

  /**
   * Converts a legacy Product to ProductRequestDto for API calls
   */
  toProductRequest(product: Product, storeId: string): ProductRequestDto {
    // Combine cover image and additional images
    const allImages = [product.coverImage, ...product.additionalImages].filter(Boolean);
    
    return {
      storeId: storeId,
      name: product.name,
      description: product.description || '',
      image: allImages,
      tags: product.category, // Map category to tags
      productType: product.productType,
      price: product.discountedPrice,
      originalPrice: product.originalPrice,
      productCost: product.productCost || product.originalPrice * 0.7, // Use provided cost or default to 70% of original price
      stock: product.stock,
      expiresOn: product.expirationDate,
      isActive: true,
      isDynamicPricingEnabled: product.isDynamicPricingEnabled || false,
      dynamicPricingStartDays: product.dynamicPricingStartDays || 14,
    };
  }

  /**
   * Updates a FullProduct with data from a ProductRequestDto
   * Useful for updating local state after API calls
   */
  updateFullProductFromRequest(
    existingProduct: FullProduct, 
    requestDto: ProductRequestDto
  ): FullProduct {
    return {
      ...existingProduct,
      name: requestDto.name,
      description: requestDto.description || '',
      productType: requestDto.productType || '',
      coverImage: requestDto.image.length > 0 ? requestDto.image[0] : '',
      additionalImages: requestDto.image.slice(1),
      discountedPrice: requestDto.price,
      originalPrice: requestDto.originalPrice,
      expirationDate: requestDto.expiresOn || existingProduct.expirationDate,
      stock: requestDto.stock || 0,
      category: requestDto.tags,
      isActive: requestDto.isActive !== undefined ? requestDto.isActive : true,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Batch converts an array of SellerProductDto to FullProduct[]
   */
  fromSellerDtoArray(dtos: SellerProductDto[]): FullProduct[] {
    return dtos.map(dto => this.fromSellerDto(dto));
  }

  /**
   * Validates a product before conversion
   */
  validateProduct(product: Product): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required');
    }
    
    if (!product.description || product.description.trim().length === 0) {
      errors.push('Product description is required');
    }

    if (product.discountedPrice <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (product.originalPrice < product.discountedPrice) {
      errors.push('Original price cannot be less than discounted price');
    }

    if (product.stock < 0) {
      errors.push('Stock cannot be negative');
    }

    if (!product.coverImage || product.coverImage.trim().length === 0) {
      errors.push('Cover image is required');
    }

    if (!product.storeId || product.storeId.trim().length === 0) {
      errors.push('Store ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a new FullProduct with default values
   * Useful for form initialization
   */
  createEmptyProduct(storeId: string): FullProduct {
    const now = new Date().toISOString();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    return {
      name: '',
      description: '',
      productType: '',
      coverImage: '',
      additionalImages: [],
      discountedPrice: 0,
      originalPrice: 0,
      expirationDate: futureDate.toISOString(),
      stock: 0,
      category: [],
      storeId: storeId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      rating: 0,
      ratingCount: 0,
    };
  }
}

// Export a default instance for convenience
export const productAdapter = new ProductAdapterImpl();