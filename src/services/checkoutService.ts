'use client';

import { apiClient } from '@/utils/apiClient';
import { CreateOrderRequest, OrderDto } from '@/types/Order';

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

interface CheckoutResponse {
  order: OrderDto;
  paymentRequired: boolean;
  paymentUrl?: string;
}

class CheckoutService {
  /**
   * Convert localStorage cart to an order
   */
  async checkoutCart(request: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const response = await apiClient.post<CheckoutResponse>('/api/checkout', request);
      return response.data;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }

  /**
   * Validate cart items before checkout
   */
  async validateCartItems(items: CheckoutCartItem[]): Promise<{
    valid: boolean;
    invalidItems: Array<{
      productId: number;
      variationId?: number;
      reason: string;
    }>;
  }> {
    try {
      const response = await apiClient.post('/api/cart/validate', { items });
      return response.data;
    } catch (error) {
      console.error('Error validating cart items:', error);
      throw error;
    }
  }

  /**
   * Get shipping options for cart
   */
  async getShippingOptions(items: CheckoutCartItem[], address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) {
    try {
      const response = await apiClient.post('/api/shipping/options', {
        items,
        address,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting shipping options:', error);
      throw error;
    }
  }

  /**
   * Calculate tax for cart
   */
  async calculateTax(items: CheckoutCartItem[], address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) {
    try {
      const response = await apiClient.post('/api/tax/calculate', {
        items,
        address,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }
}

export const checkoutService = new CheckoutService();
export default checkoutService;
