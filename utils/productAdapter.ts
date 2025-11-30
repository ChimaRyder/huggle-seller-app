import { 
  SellerProductDto, 
  Product, 
  FullProduct, 
  ProductRequestDto,
  ProductAdapter 
} from '@/types/product';
import { SellerBundleDto, BundleProduct } from '@/types/bundle';

/**
 * Utility class for converting between backend DTOs and legacy frontend format
 * This ensures backward compatibility while transitioning to the new backend structure
 */
export class ProductAdapterImpl implements ProductAdapter {
  /**
   * Converts a SellerProductDto from the backend to the legacy FullProduct format
   * used throughout the existing frontend components
   */
  fromSellerDto(dto: SellerProductDto | any): FullProduct {
    console.log('🔄 Converting SellerProductDto:', JSON.stringify(dto, null, 2));
    
    // Check if this is a bundle by looking for bundle-specific fields
    const isBundle = !!(dto.products && Array.isArray(dto.products) && dto.signature);
    console.log('🎁 Is Bundle:', isBundle);
    
    if (isBundle) {
      return this.fromBundleDto(dto);
    }
    
    // Handle different image field formats from backend
    let imageArray: string[] = [];
    
    if (dto.image && Array.isArray(dto.image)) {
      imageArray = dto.image;
    } else if ((dto as any).images && Array.isArray((dto as any).images)) {
      imageArray = (dto as any).images;
    } else if ((dto as any).imageUrl && typeof (dto as any).imageUrl === 'string') {
      imageArray = [(dto as any).imageUrl];
    }
    
    console.log('📸 Processed image array:', imageArray);
    
    const result = {
      id: dto.id,
      name: dto.name,
      description: dto.description || '',
      productType: dto.productType || '',
      // Map the first image as cover image, rest as additional images
      coverImage: imageArray.length > 0 ? imageArray[0] : '',
      additionalImages: imageArray.slice(1),
      discountedPrice: dto.price,
      originalPrice: dto.originalPrice,
      expirationDate: dto.expiresOn,
      stock: dto.stock,
      category: dto.tags || [], // Map tags to category for legacy compatibility, default to empty array
      storeId: dto.storeId,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      rating: 0, // These fields aren't available in SellerProductDto
      ratingCount: 0,
      // Dynamic pricing fields from SellerProductDto
      isDynamicPricingEnabled: dto.isDynamicPricingEnabled,
      dynamicPricingStartDays: dto.dynamicPricingStartDays,
      productCost: dto.productCost,
      lastPriceUpdate: dto.lastPriceUpdate,
      discountPercentage: dto.discountPercentage,
    };
    
    console.log('✅ Converted product result:', JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * Converts a bundle DTO to FullProduct format with bundle-specific properties
   */
  fromBundleDto(bundleDto: any): FullProduct & { isBundle: true; bundleProducts: BundleProduct[]; bundleInfo: any } {
    console.log('🎁 Converting Bundle DTO:', JSON.stringify(bundleDto, null, 2));
    
    // Handle different image field formats for bundles
    let imageArray: string[] = [];
    
    if (bundleDto.images && Array.isArray(bundleDto.images)) {
      imageArray = bundleDto.images;
    } else if (bundleDto.imageUrl && typeof bundleDto.imageUrl === 'string') {
      imageArray = [bundleDto.imageUrl];
    }
    
    // Add bundle cover image if available
    if (bundleDto.imageUrl && !imageArray.includes(bundleDto.imageUrl)) {
      imageArray.unshift(bundleDto.imageUrl);
    }
    
    // Aggregate all images from bundle products
    if (bundleDto.products && Array.isArray(bundleDto.products)) {
      bundleDto.products.forEach((product: any) => {
        if (product.image && Array.isArray(product.image)) {
          product.image.forEach((img: string) => {
            if (img && !imageArray.includes(img)) {
              imageArray.push(img);
            }
          });
        }
      });
    }
    
    // Aggregate all tags from bundle products
    const allTags: string[] = [];
    if (bundleDto.products && Array.isArray(bundleDto.products)) {
      bundleDto.products.forEach((product: any) => {
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => {
            if (tag && !allTags.includes(tag)) {
              allTags.push(tag);
            }
          });
        }
      });
    }
    
    console.log('🖼️ Aggregated images:', imageArray);
    console.log('🏷️ Aggregated tags:', allTags);
    
    const result = {
      id: bundleDto.id,
      name: bundleDto.name,
      description: bundleDto.description || '',
      productType: 'Bundle',
      coverImage: imageArray.length > 0 ? imageArray[0] : '',
      additionalImages: imageArray.slice(1),
      discountedPrice: bundleDto.price,
      originalPrice: bundleDto.originalPrice || bundleDto.totalProductOriginalPrice,
      expirationDate: bundleDto.expiresOn,
      stock: bundleDto.stock,
      category: allTags,
      storeId: bundleDto.storeId,
      isActive: bundleDto.isActive,
      createdAt: bundleDto.createdAt,
      updatedAt: bundleDto.updatedAt,
      rating: 0,
      ratingCount: 0,
      // Bundle-specific properties
      isBundle: true as const,
      bundleProducts: bundleDto.products || [],
      bundleInfo: {
        signature: bundleDto.signature,
        totalProductPrice: bundleDto.totalProductPrice,
        totalProductOriginalPrice: bundleDto.totalProductOriginalPrice,
        profitMargin: bundleDto.profitMargin,
        isDynamicPricingEnabled: bundleDto.isDynamicPricingEnabled,
        storeName: bundleDto.storeName,
        storeDescription: bundleDto.storeDescription,
      }
    };
    
    console.log('✅ Converted bundle result:', JSON.stringify(result, null, 2));
    
    return result;
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
    console.log('🔄 Converting SellerProductDto array, count:', dtos?.length || 'undefined');
    
    if (!Array.isArray(dtos)) {
      console.error('❌ Expected array but got:', typeof dtos, dtos);
      return [];
    }
    
    try {
      const result = dtos.map((dto, index) => {
        console.log(`🔄 Converting item ${index + 1}/${dtos.length}`);
        return this.fromSellerDto(dto);
      });
      
      console.log('✅ Successfully converted all products, final count:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Error in fromSellerDtoArray:', error);
      return [];
    }
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