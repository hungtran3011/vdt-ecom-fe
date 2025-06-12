'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  CartDto, 
  CreateCartRequest, 
  UpdateCartRequest,
  CartItemsResponse,
  CartItemDto,
  AddToCartRequest,
  UpdateCartItemRequest
} from '@/types/Cart';
import { cartService } from '@/services/cartService';

/**
 * Custom hook for creating a new cart
 */
export const useCreateCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateCartRequest) => cartService.createCart(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Custom hook for fetching a cart by ID
 */
export const useCart = (cartId: number) => {
  return useQuery<CartDto, Error>({
    queryKey: ['cart', cartId],
    queryFn: () => cartService.getCart(cartId),
    enabled: !!cartId,
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

/**
 * Custom hook for updating a cart
 */
export const useUpdateCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, request }: { cartId: number; request: UpdateCartRequest }) => 
      cartService.updateCart(cartId, request),
    onSuccess: (_, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });
};

/**
 * Custom hook for deleting a cart
 */
export const useDeleteCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cartId: number) => cartService.deleteCart(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Custom hook for fetching cart items with pagination
 */
export const useCartItems = (
  cartId: number, 
  page: number = 0, 
  size: number = 10, 
  cursor?: string
) => {
  return useQuery<CartItemsResponse, Error>({
    queryKey: ['cartItems', cartId, page, size, cursor],
    queryFn: () => cartService.getCartItems(cartId, page, size, cursor),
    enabled: !!cartId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  });
};

/**
 * Custom hook for fetching previous page of cart items
 */
export const usePreviousCartItems = () => {
  return useMutation({
    mutationFn: ({ 
      cartId, 
      cursor, 
      page = 0, 
      size = 10 
    }: { 
      cartId: number; 
      cursor: string; 
      page?: number; 
      size?: number; 
    }) => cartService.getPreviousCartItems(cartId, cursor, page, size),
  });
};

/**
 * Custom hook for fetching user cart items with pagination
 */
export const useUserCartItems = (
  userId: number, 
  page: number = 0, 
  size: number = 10, 
  cursor?: string
) => {
  return useQuery<CartItemsResponse, Error>({
    queryKey: ['userCartItems', userId, page, size, cursor],
    queryFn: () => cartService.getUserCartItems(userId, page, size, cursor),
    enabled: !!userId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};

/**
 * Custom hook for fetching previous page of user cart items
 */
export const usePreviousUserCartItems = () => {
  return useMutation({
    mutationFn: ({ 
      userId, 
      cursor, 
      page = 0, 
      size = 10 
    }: { 
      userId: number; 
      cursor: string; 
      page?: number; 
      size?: number; 
    }) => cartService.getPreviousUserCartItems(userId, cursor, page, size),
  });
};

/**
 * Custom hook for adding item to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, request }: { cartId: number; request: AddToCartRequest }) => 
      cartService.addItemToCart(cartId, request),
    onSuccess: (_, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
      queryClient.invalidateQueries({ queryKey: ['cartItems', cartId] });
    },
  });
};

/**
 * Custom hook for updating cart item
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      cartId, 
      itemId, 
      request 
    }: { 
      cartId: number; 
      itemId: number; 
      request: UpdateCartItemRequest;
    }) => cartService.updateCartItem(cartId, itemId, request),
    onSuccess: (_, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
      queryClient.invalidateQueries({ queryKey: ['cartItems', cartId] });
    },
  });
};

/**
 * Custom hook for removing item from cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, itemId }: { cartId: number; itemId: number }) => 
      cartService.removeCartItem(cartId, itemId),
    onSuccess: (_, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
      queryClient.invalidateQueries({ queryKey: ['cartItems', cartId] });
    },
  });
};

/**
 * Custom hook for getting specific cart item
 */
export const useCartItem = (cartId: number, itemId: number) => {
  return useQuery<CartItemDto, Error>({
    queryKey: ['cartItem', cartId, itemId],
    queryFn: () => cartService.getCartItem(cartId, itemId),
    enabled: !!cartId && !!itemId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};

/**
 * Custom hook for clearing cart (deleting and recreating)
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cartId: number) => cartService.deleteCart(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      // Clear cart ID from localStorage so a new one will be created
      localStorage.removeItem('cart_id');
    },
  });
};

// JWT-based cart hooks (recommended for authenticated users)

/**
 * Custom hook for getting current user's cart
 */
export const useCurrentUserCart = () => {
  return useQuery<CartDto, Error>({
    queryKey: ['currentUserCart'],
    queryFn: () => cartService.getCurrentUserCart(),
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

/**
 * Custom hook for getting or creating current user's cart
 */
export const useGetOrCreateCurrentUserCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartService.getOrCreateCurrentUserCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserCart'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserCartItems'] });
    },
  });
};

/**
 * Custom hook for getting current user's cart items
 */
export const useCurrentUserCartItems = (
  page: number = 0, 
  size: number = 10, 
  cursor?: string
) => {
  return useQuery<CartItemsResponse, Error>({
    queryKey: ['currentUserCartItems', page, size, cursor],
    queryFn: () => cartService.getCurrentUserCartItems(page, size, cursor),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  });
};

/**
 * Custom hook for adding item to current user's cart
 */
export const useAddToCurrentUserCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: AddToCartRequest) => cartService.addItemToCurrentUserCart(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserCart'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserCartItems'] });
    },
  });
};

/**
 * Custom hook for updating current user's cart item
 */
export const useUpdateCurrentUserCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      itemId, 
      request 
    }: { 
      itemId: number; 
      request: UpdateCartItemRequest;
    }) => cartService.updateCurrentUserCartItem(itemId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserCart'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserCartItems'] });
    },
  });
};

/**
 * Custom hook for removing item from current user's cart
 */
export const useRemoveFromCurrentUserCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: number) => cartService.removeItemFromCurrentUserCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserCart'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserCartItems'] });
    },
  });
};

/**
 * Custom hook for clearing current user's cart
 */
export const useClearCurrentUserCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartService.clearCurrentUserCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserCart'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserCartItems'] });
    },
  });
};
