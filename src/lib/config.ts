/**
 * Application configuration
 * Contains API endpoints and other configuration constants
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Address endpoints
  ADDRESS: {
    PROVINCES: '/v1/address/provinces',
    DISTRICTS: (provinceCode: string) => `/v1/address/provinces/${provinceCode}/districts`,
    WARDS: (districtCode: string) => `/v1/address/districts/${districtCode}/wards`,
  },
  
  // Order endpoints
  ORDERS: '/v1/orders',
  
  // Product endpoints
  PRODUCTS: '/v1/products',
  
  // Cart endpoints
  CART: '/v1/carts',
  
  // Profile endpoints
  PROFILES: '/v1/profiles',
  
  // Media endpoints
  MEDIA: '/v1/media',
  
  // Auth endpoints
  AUTH: '/v1/auth',
  
  // Categories endpoints
  CATEGORIES: '/v1/categories',
  
  // Payment endpoints
  PAYMENT: {
    VIETTEL: '/api/payment/viettel',
  },
} as const;

// Other configuration constants
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_TIMEOUT = 10000;

// Environment checks
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
