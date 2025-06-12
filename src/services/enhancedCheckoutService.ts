'use client';

import { apiClient } from '@/utils/apiClient';
import { orderService } from '@/services/orderService';
import { CreateOrderRequest, OrderDto, Order } from '@/types/Order';

export interface CheckoutCartItem {
  productId: number;
  variationId?: number;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutRequest {
  items: CheckoutCartItem[];
  userEmail?: string;
  address: string;
  phone: string;
  note?: string;
  paymentMethod: string;
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
}

export interface CheckoutResponse {
  order: OrderDto;
  paymentRequired: boolean;
  paymentUrl?: string;
}

export interface ValidationResult {
  valid: boolean;
  invalidItems: Array<{
    productId: number;
    variationId?: number;
    reason: string;
    availableQuantity?: number;
  }>;
}

class EnhancedCheckoutService {
  /**
   * Checkout selected cart items and create an order
   */
  async checkoutSelectedItems(request: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      // First, validate all items
      const validation = await this.validateCartItems(request.items);
      if (!validation.valid) {
        throw new Error(`Invalid items in cart: ${validation.invalidItems.map(item => item.reason).join(', ')}`);
      }

      // Create order request
      const orderRequest: CreateOrderRequest = {
        userEmail: request.userEmail,
        address: request.address,
        phone: request.phone,
        note: request.note,
        paymentMethod: request.paymentMethod as any, // Cast to enum
        totalPrice: request.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        items: request.items.map(item => ({
          productId: item.productId,
          productName: '', // Will be populated by backend
          productImage: '', // Will be populated by backend
          quantity: item.quantity,
          price: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      };

      // Create the order
      const createdOrder = await orderService.createOrder(orderRequest as any);

      return {
        order: createdOrder as OrderDto,
        paymentRequired: true, // Assume payment is required
        paymentUrl: undefined, // Would be set by payment processor
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }

  /**
   * Validate cart items before checkout
   */
  async validateCartItems(items: CheckoutCartItem[]): Promise<ValidationResult> {
    try {
      const invalidItems: ValidationResult['invalidItems'] = [];

      // Validate each item
      for (const item of items) {
        try {
          const validation = await this.validateSingleItem(item);
          if (!validation.valid) {
            invalidItems.push({
              productId: item.productId,
              variationId: item.variationId,
              reason: validation.reason,
              availableQuantity: validation.availableQuantity,
            });
          }
        } catch (error) {
          invalidItems.push({
            productId: item.productId,
            variationId: item.variationId,
            reason: 'Error validating item',
          });
        }
      }

      return {
        valid: invalidItems.length === 0,
        invalidItems,
      };
    } catch (error) {
      console.error('Error validating cart items:', error);
      return {
        valid: false,
        invalidItems: [{
          productId: 0,
          reason: 'Error validating cart',
        }],
      };
    }
  }

  /**
   * Validate a single cart item
   */
  private async validateSingleItem(item: CheckoutCartItem): Promise<{
    valid: boolean;
    reason?: string;
    availableQuantity?: number;
  }> {
    try {
      // Import stockService dynamically to avoid circular dependencies
      const { stockService } = await import('@/services/stockService');
      
      const stockValidation = await stockService.validateProductStockAvailability(
        item.productId, 
        item.quantity
      );

      if (!stockValidation.available) {
        return {
          valid: false,
          reason: stockValidation.message || 'Insufficient stock',
          availableQuantity: stockValidation.availableQuantity,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        reason: 'Error validating stock',
      };
    }
  }

  /**
   * Get shipping options for cart items
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
      // Return default shipping option
      return [{
        id: 'standard',
        name: 'Standard Shipping',
        price: 0,
        estimatedDays: 3-5,
      }];
    }
  }

  /**
   * Calculate tax for cart items
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
      // Return 0 tax as fallback
      return {
        taxAmount: 0,
        taxRate: 0,
      };
    }
  }

  /**
   * Process payment for an order
   */
  async processPayment(orderId: string, paymentDetails: {
    method: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    billingAddress?: any;
  }) {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/payment`, paymentDetails);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}

export const enhancedCheckoutService = new EnhancedCheckoutService();
export default enhancedCheckoutService;
