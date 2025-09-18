/**
 * Seller Profile screen navigation menu items
 * Used for the main profile screen menu options for sellers
 */

export interface SellerProfileMenuItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
  description?: string;
}

export const sellerProfileMenuItems: SellerProfileMenuItem[] = [
  {
    id: 'reviews',
    title: 'Customer Reviews',
    icon: 'star',
    screen: '/(main)/profile/reviewsSummary',
    description: 'Manage customer feedback'
  },
  {
    id: 'store-settings',
    title: 'Store Settings',
    icon: 'store',
    screen: '/(main)/profile/storeSettings',
    description: 'Update store information'
  },
  {
    id: 'account-settings',
    title: 'Account Settings',
    icon: 'settings',
    screen: '/(main)/profile/settings',
    description: 'Manage your account'
  },
  {
    id: 'seller-support',
    title: 'Seller Support',
    icon: 'help-circle',
    screen: '/(main)/profile/support',
    description: 'Get help and assistance'
  },
];

export const quickActionItems: SellerProfileMenuItem[] = [
  {
    id: 'create-product',
    title: 'Add Product',
    icon: 'plus-circle',
    screen: '/(main)/products/createProduct',
    description: 'Create new product listing'
  },
  {
    id: 'create-promotion',
    title: 'Create Post',
    icon: 'megaphone',
    screen: '/(main)/promotions/createPost',
    description: 'Promote your products'
  },
];