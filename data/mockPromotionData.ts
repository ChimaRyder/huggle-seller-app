/**
 * Mock Data for Seller App Promotions
 * This provides sample posts data for sellers to promote their products and events
 */

export interface MockPost {
  id: string;
  storeId: string;
  storeName: string;
  storeAvatar: string;
  images: string[];
  caption: string;
  likes: number;
  views: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  postType: 'product_promotion' | 'event' | 'announcement' | 'sale';
  tags: string[];
}

export const mockPosts: MockPost[] = [
  {
    id: 'promo-1',
    storeId: 'seller-store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
    ],
    caption: 'New wireless headphones just arrived! 🎧 Experience crystal clear sound with our latest addition. Limited time offer - 30% off for the first 50 customers!',
    likes: 145,
    views: 892,
    shares: 23,
    createdAt: '2024-08-08T14:00:00Z',
    updatedAt: '2024-08-08T14:00:00Z',
    isActive: true,
    postType: 'product_promotion',
    tags: ['electronics', 'headphones', 'sale', 'new-arrival']
  },
  {
    id: 'promo-2',
    storeId: 'seller-store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    images: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600'
    ],
    caption: '🎮 Gaming setup sale! Complete your battlestation with our premium gaming peripherals. Keyboards, mice, and monitors - everything a gamer needs! #Gaming #TechSale',
    likes: 89,
    views: 567,
    shares: 15,
    createdAt: '2024-08-07T11:30:00Z',
    updatedAt: '2024-08-07T11:30:00Z',
    isActive: true,
    postType: 'sale',
    tags: ['gaming', 'peripherals', 'sale', 'tech']
  },
  {
    id: 'promo-3',
    storeId: 'seller-store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'
    ],
    caption: '📱 Smartphone showcase event this weekend! Come see the latest phones, get hands-on demos, and enjoy exclusive launch day discounts. See you there!',
    likes: 203,
    views: 1234,
    shares: 45,
    createdAt: '2024-08-06T08:15:00Z',
    updatedAt: '2024-08-06T08:15:00Z',
    isActive: true,
    postType: 'event',
    tags: ['smartphones', 'event', 'demo', 'launch']
  },
  {
    id: 'promo-4',
    storeId: 'seller-store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600'
    ],
    caption: '💻 Back to school special! Students get 15% off all laptops and accessories. Valid student ID required. Perfect timing for the new semester! #BackToSchool #StudentDiscount',
    likes: 267,
    views: 1567,
    shares: 67,
    createdAt: '2024-08-05T09:00:00Z',
    updatedAt: '2024-08-05T09:00:00Z',
    isActive: true,
    postType: 'sale',
    tags: ['laptops', 'students', 'back-to-school', 'discount']
  },
  {
    id: 'promo-5',
    storeId: 'seller-store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    images: [
      'https://images.unsplash.com/photo-1544127150-6d508118d5d5?w=600'
    ],
    caption: '⚡ Power bank collection just restocked! Never run out of battery again. Multiple capacities available - from compact 5000mAh to powerful 20000mAh units.',
    likes: 156,
    views: 789,
    shares: 22,
    createdAt: '2024-08-04T14:30:00Z',
    updatedAt: '2024-08-04T14:30:00Z',
    isActive: true,
    postType: 'product_promotion',
    tags: ['power-bank', 'accessories', 'battery', 'portable']
  },
  {
    id: 'promo-6',
    storeId: 'seller-store-1',
    storeName: 'TechHub Electronics',
    storeAvatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600'
    ],
    caption: '🔧 Tech repair services now available! We fix smartphones, laptops, tablets, and more. Professional service with warranty included. Book your appointment today!',
    likes: 134,
    views: 998,
    shares: 31,
    createdAt: '2024-08-03T16:45:00Z',
    updatedAt: '2024-08-03T16:45:00Z',
    isActive: true,
    postType: 'announcement',
    tags: ['repair', 'service', 'warranty', 'booking']
  }
];

export const mockEngagementStats = {
  totalPosts: mockPosts.length,
  totalLikes: mockPosts.reduce((sum, post) => sum + post.likes, 0),
  totalViews: mockPosts.reduce((sum, post) => sum + post.views, 0),
  totalShares: mockPosts.reduce((sum, post) => sum + post.shares, 0),
  averageEngagement: mockPosts.length > 0
    ? Math.round((mockPosts.reduce((sum, post) => sum + post.likes + post.shares, 0) / mockPosts.length))
    : 0
};

export const getPostsByType = (type: MockPost['postType']) => {
  return mockPosts.filter(post => post.postType === type);
};

export const getRecentPosts = (days: number = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return mockPosts.filter(post => new Date(post.createdAt) >= cutoffDate);
};

export const searchPosts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockPosts.filter(post =>
    post.caption.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};