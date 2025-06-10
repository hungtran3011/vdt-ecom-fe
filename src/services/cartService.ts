import { apiClient } from '@/utils/apiClient';
import { 
  CartDto, 
  CreateCartRequest, 
  UpdateCartRequest,
  CartItemsResponse,
  CartItemDto,
  AddToCartRequest,
  UpdateCartItemRequest
} from '@/types/Cart';

class CartService {
  private readonly BASE_URL = '/v1/cart';

  /**
   * Create a new cart
   */
  async createCart(request: CreateCartRequest): Promise<CartDto> {
    const response = await apiClient.post<CartDto>(this.BASE_URL, request);
    return response.data;
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId: number): Promise<CartDto> {
    const response = await apiClient.get<CartDto>(`${this.BASE_URL}/${cartId}`);
    return response.data;
  }

  /**
   * Update cart
   */
  async updateCart(cartId: number, request: UpdateCartRequest): Promise<CartDto> {
    const response = await apiClient.put<CartDto>(`${this.BASE_URL}/${cartId}`, request);
    return response.data;
  }

  /**
   * Delete cart
   */
  async deleteCart(cartId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${cartId}`);
  }

  /**
   * Get cart items with pagination
   */
  async getCartItems(
    cartId: number,
    page: number = 0,
    size: number = 10,
    cursor?: string
  ): Promise<CartItemsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await apiClient.get<CartItemsResponse>(
      `${this.BASE_URL}/${cartId}/items?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get previous page of cart items
   */
  async getPreviousCartItems(
    cartId: number,
    cursor: string,
    page: number = 0,
    size: number = 10
  ): Promise<CartItemsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      cursor,
    });

    const response = await apiClient.get<CartItemsResponse>(
      `${this.BASE_URL}/${cartId}/items/previous?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get cart items for a specific user with pagination
   */
  async getUserCartItems(
    userId: number,
    page: number = 0,
    size: number = 10,
    cursor?: string
  ): Promise<CartItemsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await apiClient.get<CartItemsResponse>(
      `${this.BASE_URL}/user/${userId}/items?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get previous page of cart items for a specific user
   */
  async getPreviousUserCartItems(
    userId: number,
    cursor: string,
    page: number = 0,
    size: number = 10
  ): Promise<CartItemsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      cursor,
    });

    const response = await apiClient.get<CartItemsResponse>(
      `${this.BASE_URL}/user/${userId}/items/previous?${params.toString()}`
    );
    return response.data;
  }

  // Cart Item Operations (assuming separate endpoints exist)
  
  /**
   * Add item to cart
   */
  async addItemToCart(cartId: number, request: AddToCartRequest): Promise<CartItemDto> {
    const response = await apiClient.post<CartItemDto>(`${this.BASE_URL}/${cartId}/items`, request);
    return response.data;
  }

  /**
   * Update cart item
   */
  async updateCartItem(cartId: number, itemId: number, request: UpdateCartItemRequest): Promise<CartItemDto> {
    const response = await apiClient.put<CartItemDto>(`${this.BASE_URL}/${cartId}/items/${itemId}`, request);
    return response.data;
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(cartId: number, itemId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${cartId}/items/${itemId}`);
  }

  /**
   * Get specific cart item
   */
  async getCartItem(cartId: number, itemId: number): Promise<CartItemDto> {
    const response = await apiClient.get<CartItemDto>(`${this.BASE_URL}/${cartId}/items/${itemId}`);
    return response.data;
  }
}

export const cartService = new CartService();
