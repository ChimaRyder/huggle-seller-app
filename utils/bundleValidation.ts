import { BundleProduct } from '@/types/bundle';

export interface StockValidationResult {
  isValid: boolean;
  maxStock: number;
  errorMessage?: string;
}

/**
 * Calculates the maximum possible stock for a bundle based on included products
 * @param products - Array of products in the bundle
 * @returns The minimum stock among all products
 */
export const calculateMaxBundleStock = (products: BundleProduct[]): number => {
  if (!products || products.length === 0) {
    return 0;
  }
  
  // Find the product with the lowest stock
  const activeProducts = products.filter(p => p.isActive);
  if (activeProducts.length === 0) {
    return 0;
  }
  
  return Math.min(...activeProducts.map(p => p.stock));
};

/**
 * Validates if a requested bundle stock is valid
 * @param requestedStock - The stock amount requested for the bundle
 * @param products - Array of products in the bundle
 * @returns Validation result with max stock and error message if invalid
 */
export const validateBundleStock = (
  requestedStock: number, 
  products: BundleProduct[]
): StockValidationResult => {
  const maxStock = calculateMaxBundleStock(products);
  
  if (requestedStock < 0) {
    return {
      isValid: false,
      maxStock,
      errorMessage: 'Stock cannot be negative'
    };
  }
  
  if (requestedStock > maxStock) {
    return {
      isValid: false,
      maxStock,
      errorMessage: `Bundle stock cannot exceed ${maxStock}. This is limited by the product with the lowest stock.`
    };
  }
  
  return {
    isValid: true,
    maxStock
  };
};

/**
 * Finds the product(s) that limit bundle stock
 * @param products - Array of products in the bundle
 * @returns Array of product names that have the minimum stock
 */
export const findStockLimitingProducts = (products: BundleProduct[]): string[] => {
  if (!products || products.length === 0) {
    return [];
  }
  
  const activeProducts = products.filter(p => p.isActive);
  if (activeProducts.length === 0) {
    return [];
  }
  
  const minStock = Math.min(...activeProducts.map(p => p.stock));
  return activeProducts
    .filter(p => p.stock === minStock)
    .map(p => p.name);
};

/**
 * Gets a user-friendly message explaining stock limitations
 * @param products - Array of products in the bundle
 * @returns Human-readable explanation of stock limitations
 */
export const getStockLimitationMessage = (products: BundleProduct[]): string => {
  const maxStock = calculateMaxBundleStock(products);
  const limitingProducts = findStockLimitingProducts(products);
  
  if (maxStock === 0) {
    return 'This bundle cannot have any stock because it contains inactive or out-of-stock products.';
  }
  
  if (limitingProducts.length === 1) {
    return `Maximum bundle stock is ${maxStock} because "${limitingProducts[0]}" only has ${maxStock} in stock.`;
  }
  
  if (limitingProducts.length > 1) {
    const productList = limitingProducts.join('", "');
    return `Maximum bundle stock is ${maxStock} because "${productList}" each have only ${maxStock} in stock.`;
  }
  
  return `Maximum bundle stock is ${maxStock}.`;
};