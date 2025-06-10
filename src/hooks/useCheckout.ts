'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartContext } from '@/contexts/CartContext';
import { checkoutService } from '@/services/checkoutService';

interface CheckoutCartItem {
  productId: number;
  variationId?: number;
  quantity: number;
  unitPrice: number;
}

interface CheckoutRequest {
  items: CheckoutCartItem[];
  paymentMethodId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
}

/**
 * Custom hook for checkout functionality
 */
export const useCheckout = () => {
  const { cart, clearCart } = useCartContext();

  const checkoutMutation = useMutation({
    mutationFn: (request: Omit<CheckoutRequest, 'items'>) => {
      // Convert cart items to checkout format
      const checkoutItems: CheckoutCartItem[] = cart.items.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      return checkoutService.checkoutCart({
        ...request,
        items: checkoutItems,
      });
    },
    onSuccess: () => {
      // Clear cart after successful checkout
      clearCart();
    },
  });

  return {
    checkout: checkoutMutation.mutate,
    checkoutAsync: checkoutMutation.mutateAsync,
    isCheckingOut: checkoutMutation.isPending,
    checkoutError: checkoutMutation.error,
    checkoutResult: checkoutMutation.data,
    reset: checkoutMutation.reset,
  };
};

/**
 * Custom hook for validating cart items
 */
export const useValidateCart = () => {
  const { cart } = useCartContext();

  return useQuery({
    queryKey: ['validateCart', cart.items],
    queryFn: () => {
      const checkoutItems: CheckoutCartItem[] = cart.items.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      return checkoutService.validateCartItems(checkoutItems);
    },
    enabled: cart.items.length > 0,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });
};

/**
 * Custom hook for getting shipping options
 */
export const useShippingOptions = (address: {
  city: string;
  state: string;
  zipCode: string;
  country: string;
} | null) => {
  const { cart } = useCartContext();

  return useQuery({
    queryKey: ['shippingOptions', cart.items, address],
    queryFn: () => {
      if (!address) throw new Error('Address is required');

      const checkoutItems: CheckoutCartItem[] = cart.items.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      return checkoutService.getShippingOptions(checkoutItems, address);
    },
    enabled: !!address && cart.items.length > 0,
  });
};

/**
 * Custom hook for calculating tax
 */
export const useCalculateTax = (address: {
  city: string;
  state: string;
  zipCode: string;
  country: string;
} | null) => {
  const { cart } = useCartContext();

  return useQuery({
    queryKey: ['calculateTax', cart.items, address],
    queryFn: () => {
      if (!address) throw new Error('Address is required');

      const checkoutItems: CheckoutCartItem[] = cart.items.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      return checkoutService.calculateTax(checkoutItems, address);
    },
    enabled: !!address && cart.items.length > 0,
  });
};
