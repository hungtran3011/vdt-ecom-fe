'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enhancedCheckoutService, CheckoutRequest, CheckoutResponse, ValidationResult } from '@/services/enhancedCheckoutService';
import { useCartContext } from '@/contexts/EnhancedCartContext';

/**
 * Hook for enhanced checkout with selected items
 */
export const useEnhancedCheckout = () => {
  const queryClient = useQueryClient();
  const { removeSelectedFromCart } = useCartContext();

  return useMutation<CheckoutResponse, Error, CheckoutRequest>({
    mutationFn: enhancedCheckoutService.checkoutSelectedItems.bind(enhancedCheckoutService),
    onSuccess: async (data) => {
      // Remove selected items from cart after successful checkout
      try {
        await removeSelectedFromCart();
        console.log('Successfully removed selected items from cart after checkout');
      } catch (error) {
        console.error('Error removing selected items from cart:', error);
      }

      // Invalidate order queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
  });
};

/**
 * Hook for validating cart items before checkout
 */
export const useValidateCheckout = () => {
  const { getSelectedItems } = useCartContext();

  return useQuery<ValidationResult>({
    queryKey: ['validateCheckout', getSelectedItems()],
    queryFn: () => {
      const selectedItems = getSelectedItems();
      const checkoutItems = selectedItems.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      return enhancedCheckoutService.validateCartItems(checkoutItems);
    },
    enabled: getSelectedItems().length > 0,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to keep stock data current
  });
};

/**
 * Hook for getting shipping options
 */
export const useShippingOptions = (address: {
  city: string;
  state: string;
  zipCode: string;
  country: string;
}) => {
  const { getSelectedItems } = useCartContext();

  return useQuery({
    queryKey: ['shippingOptions', address, getSelectedItems()],
    queryFn: () => {
      const selectedItems = getSelectedItems();
      const checkoutItems = selectedItems.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      return enhancedCheckoutService.getShippingOptions(checkoutItems, address);
    },
    enabled: getSelectedItems().length > 0 && !!address.city && !!address.country,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for calculating tax
 */
export const useCalculateTax = (address: {
  city: string;
  state: string;
  zipCode: string;
  country: string;
}) => {
  const { getSelectedItems } = useCartContext();

  return useQuery({
    queryKey: ['calculateTax', address, getSelectedItems()],
    queryFn: () => {
      const selectedItems = getSelectedItems();
      const checkoutItems = selectedItems.map(item => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      return enhancedCheckoutService.calculateTax(checkoutItems, address);
    },
    enabled: getSelectedItems().length > 0 && !!address.city && !!address.country,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for processing payment
 */
export const useProcessPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentDetails }: {
      orderId: string;
      paymentDetails: {
        method: string;
        cardNumber?: string;
        expiryDate?: string;
        cvv?: string;
        billingAddress?: any;
      };
    }) => enhancedCheckoutService.processPayment(orderId, paymentDetails),
    onSuccess: () => {
      // Invalidate order queries after payment
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
  });
};
