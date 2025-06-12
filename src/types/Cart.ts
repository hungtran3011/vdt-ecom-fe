import { Product, ProductVariation } from './Product';
import { PaginatedResponse } from './api';

export interface CartItemDto {
  id: number;
  cartId: number;
  productId: number;
  product?: Product;
  variationId?: number;
  variation?: ProductVariation;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
  updatedAt?: string;
}

export interface CartDto {
  id: number;
  userId?: number;
  userEmail?: string;
  sessionId?: string;
  status: 'ACTIVE' | 'ABANDONED' | 'CONVERTED';
  totalItems: number;
  totalPrice: number;
  items?: CartItemDto[];
  createdAt: string;
  updatedAt?: string;
}

// Request DTOs
export interface CreateCartRequest {
  userId?: number;
  userEmail?: string;
  sessionId?: string;
}

export interface AddToCartRequest {
  productId: number;
  variationId?: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartRequest {
  status?: 'ACTIVE' | 'ABANDONED' | 'CONVERTED';
}

// Response types for paginated cart items
export type CartItemsResponse = PaginatedResponse<CartItemDto>;

// Legacy types for backwards compatibility (can be removed later)
export interface CartItem extends CartItemDto {
  price: number; // Alias for unitPrice
}

export interface Cart extends CartDto {
  items: CartItem[];
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}
