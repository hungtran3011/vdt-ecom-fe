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

  // JWT-based Cart Operations (recommended for authenticated users)
  
  /**
   * Get cart for current authenticated user (using JWT)
   */
  async getCurrentUserCart(): Promise<CartDto> {
    const response = await apiClient.get<CartDto>(`${this.BASE_URL}/current`);
    return response.data;
  }

  /**
   * Get or create cart for current authenticated user (using JWT)
   */
  async getOrCreateCurrentUserCart(): Promise<CartDto> {
    const response = await apiClient.post<CartDto>(`${this.BASE_URL}/current`);
    return response.data;
  }

  /**
   * Get cart items for current authenticated user with pagination
   */
  async getCurrentUserCartItems(
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
      `${this.BASE_URL}/current/items?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Add item to cart for current authenticated user
   */
  async addItemToCurrentUserCart(request: AddToCartRequest): Promise<CartDto> {
    const response = await apiClient.post<CartDto>(`${this.BASE_URL}/current/items`, request);
    return response.data;
  }

  /**
   * Update cart item for current authenticated user
   */
  async updateCurrentUserCartItem(
    itemId: number, 
    request: UpdateCartItemRequest
  ): Promise<CartDto> {
    const response = await apiClient.put<CartDto>(
      `${this.BASE_URL}/current/items/${itemId}`, 
      request
    );
    return response.data;
  }

  /**
   * Remove item from cart for current authenticated user
   */
  async removeItemFromCurrentUserCart(itemId: number): Promise<CartDto> {
    const response = await apiClient.delete<CartDto>(`${this.BASE_URL}/current/items/${itemId}`);
    return response.data;
  }

  /**
   * Clear all items from cart for current authenticated user
   */
  async clearCurrentUserCart(): Promise<CartDto> {
    const response = await apiClient.delete<CartDto>(`${this.BASE_URL}/current/items`);
    return response.data;
  }

  // Backward compatibility methods - these route to JWT-based endpoints
  // Note: userEmail parameter is ignored as JWT token is used instead
  
  /**
   * @deprecated Use getCurrentUserCart() instead
   * Routes to JWT-based endpoint, userEmail parameter is ignored
   */
  async getCartByEmail(userEmail?: string): Promise<CartDto> {
    if (userEmail) {
      console.warn('getCartByEmail userEmail parameter is ignored. Using JWT token instead.');
    }
    return this.getCurrentUserCart();
  }

  /**
   * @deprecated Use getOrCreateCurrentUserCart() instead
   * Routes to JWT-based endpoint, userEmail parameter is ignored
   */
  async getOrCreateCartByEmail(userEmail?: string): Promise<CartDto> {
    if (userEmail) {
      console.warn('getOrCreateCartByEmail userEmail parameter is ignored. Using JWT token instead.');
    }
    return this.getOrCreateCurrentUserCart();
  }

  /**
   * @deprecated Use getCurrentUserCartItems() instead
   * Routes to JWT-based endpoint, userEmail parameter is ignored
   */
  async getCartItemsByEmail(
    userEmail?: string,
    page: number = 0,
    size: number = 10,
    cursor?: string
  ): Promise<CartItemsResponse> {
    if (userEmail) {
      console.warn('getCartItemsByEmail userEmail parameter is ignored. Using JWT token instead.');
    }
    return this.getCurrentUserCartItems(page, size, cursor);
  }

  /**
   * @deprecated Use addItemToCurrentUserCart() instead
   * Routes to JWT-based endpoint, userEmail parameter is ignored
   */
  async addItemToCartByEmail(userEmail: string | undefined, request: AddToCartRequest): Promise<CartDto> {
    if (userEmail) {
      console.warn('addItemToCartByEmail userEmail parameter is ignored. Using JWT token instead.');
    }
    return this.addItemToCurrentUserCart(request);
  }

  /**
   * @deprecated Use updateCurrentUserCartItem() instead
   * Routes to JWT-based endpoint, userEmail parameter is ignored
   */
  async updateCartItemByEmail(
    userEmail: string | undefined, 
    itemId: number, 
    request: UpdateCartItemRequest
  ): Promise<CartDto> {
    if (userEmail) {
      console.warn('updateCartItemByEmail userEmail parameter is ignored. Using JWT token instead.');
    }
    return this.updateCurrentUserCartItem(itemId, request);
  }

  /**
   * @deprecated Use removeItemFromCurrentUserCart() instead
   * Routes to JWT-based endpoint, userEmail parameter is ignored
   */
  async removeItemFromCartByEmail(userEmail: string | undefined, itemId: number): Promise<CartDto> {
    if (userEmail) {
      console.warn('removeItemFromCartByEmail userEmail parameter is ignored. Using JWT token instead.');
    }
    return this.removeItemFromCurrentUserCart(itemId);
  }

  /**
   * @deprecated Use clearCurrentUserCart() instead
   * Routes to JWT-based endpoint, userEmail parameter is ignored
   */
  async clearCartByEmail(userEmail?: string): Promise<CartDto> {
    if (userEmail) {
      console.warn('clearCartByEmail userEmail parameter is ignored. Using JWT token instead.');
    }
    return this.clearCurrentUserCart();
  }

}

export const cartService = new CartService();
