import { Product, ProductVariation } from './Product';

export interface CartItem {
  id: string;
  product: Product;
  variation?: ProductVariation;
  quantity: number;
  price: number; // Current price at the time of adding to cart
  totalPrice: number; // price * quantity
  addedAt: Date;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddToCartRequest {
  productId: number;
  variationId?: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}
