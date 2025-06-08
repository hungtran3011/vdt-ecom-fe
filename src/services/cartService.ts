import { apiClient } from '@/utils/apiClient';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartSummary } from '@/types/Cart';

class CartService {
  private readonly BASE_URL = '/v1/cart';

  /**
   * Get current user's cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>(this.BASE_URL);
    return response.data;
  }

  /**
   * Add item to cart
   */
  async addToCart(request: AddToCartRequest): Promise<CartItem> {
    const response = await apiClient.post<CartItem>(`${this.BASE_URL}/items`, request);
    return response.data;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(request: UpdateCartItemRequest): Promise<CartItem> {
    const response = await apiClient.put<CartItem>(`${this.BASE_URL}/items/${request.cartItemId}`, {
      quantity: request.quantity
    });
    return response.data;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/items/${cartItemId}`);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete(this.BASE_URL);
  }

  /**
   * Get cart summary (totals, taxes, etc.)
   */
  async getCartSummary(): Promise<CartSummary> {
    const response = await apiClient.get<CartSummary>(`${this.BASE_URL}/summary`);
    return response.data;
  }

  /**
   * Sync cart with server (useful for guest users)
   */
  async syncCart(cart: Cart): Promise<Cart> {
    const response = await apiClient.post<Cart>(`${this.BASE_URL}/sync`, cart);
    return response.data;
  }
}

export const cartService = new CartService();
