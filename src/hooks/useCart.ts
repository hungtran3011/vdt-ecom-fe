'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartSummary } from '@/types/Cart';
import { cartService } from '@/services/cartService';

/**
 * Custom hook for fetching user's cart
 */
export const useCart = () => {
  return useQuery<Cart, Error>({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

/**
 * Custom hook for getting cart summary
 */
export const useCartSummary = () => {
  return useQuery<CartSummary, Error>({
    queryKey: ['cart', 'summary'],
    queryFn: () => cartService.getCartSummary(),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Custom hook for adding items to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: AddToCartRequest) => cartService.addToCart(request),
    onSuccess: () => {
      // Invalidate cart queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Custom hook for updating cart item quantity
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: UpdateCartItemRequest) => cartService.updateCartItem(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Custom hook for removing items from cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cartItemId: string) => cartService.removeFromCart(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Custom hook for clearing entire cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Custom hook for syncing cart with server
 */
export const useSyncCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cart: Cart) => cartService.syncCart(cart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
