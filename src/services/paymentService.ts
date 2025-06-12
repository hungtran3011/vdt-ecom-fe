// Payment Management Service
import api from '@/lib/axios';
import { 
  Payment, 
  PaymentSummary, 
  PaymentAnalytics,
  RefundRequest,
  ProcessPaymentRequest
} from '@/types/Payment';
import { PaymentMethod } from '@/types/Order';
import { ApiError } from '@/types/api';

// Customer-facing payment interfaces
export interface PaymentInitiationRequest {
  orderId: string;
  returnType?: 'WEB' | 'QR' | 'DEEPLINK';
  returnUrl?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  orderId: string;
  vtRequestId: string;
  returnType: string;
  paymentUrl?: string;
  qrCode?: string;
  deepLink?: string;
  message: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  orderStatus: string;
  transactionStatus: string;
  vtRequestId: string;
  errorCode: string;
  lastUpdated: string;
}

export interface CustomerRefundRequest {
  orderId: string;
  refundAmount?: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  orderId: string;
  refundId: string;
  refundAmount: number;
  status: string;
  message: string;
}

export const paymentService = {
  // Get all payments with pagination and filters
  async getPayments(params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
    search?: string;
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) {
    const queryParams = {
      ...params,
      // Ensure consistent parameter naming
      size: params?.size || 10
    };
    
    const response = await api.get('/v1/payments', { params: queryParams });
    return response.data;
  },

  // Get payment by ID
  async getPaymentById(paymentId: string): Promise<Payment> {
    const response = await api.get(`/v1/payments/${paymentId}`);
    return response.data;
  },

  // Get payments by order ID
  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    const response = await api.get(`/v1/payments/order/${orderId}`);
    return response.data;
  },

  // Process payment (approve, reject, refund) - Admin only
  async processAdminPayment(data: ProcessPaymentRequest): Promise<Payment> {
    const response = await api.post(`/v1/payments/${data.paymentId}/process`, data);
    return response.data;
  },

  // Create refund
  async createRefund(data: RefundRequest): Promise<Payment> {
    const response = await api.post(`/v1/payments/${data.paymentId}/refund`, data);
    return response.data;
  },

  // Get payment summary/statistics
  async getPaymentSummary(params?: {
    startDate?: string;
    endDate?: string;
    method?: string;
  }): Promise<PaymentSummary> {
    const response = await api.get('/v1/payments/summary', { params });
    return response.data;
  },

  // Get payment analytics
  async getPaymentAnalytics(params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentAnalytics> {
    const response = await api.get('/v1/payments/analytics', { params });
    return response.data;
  },

  // Reconcile payments (match with bank statements)
  async reconcilePayments(data: {
    startDate: string;
    endDate: string;
    provider: string;
  }): Promise<{
    matched: number;
    unmatched: number;
    discrepancies: Array<{
      paymentId: string;
      issue: string;
      amount: number;
    }>;
  }> {
    const response = await api.post('/v1/payments/reconcile', data);
    return response.data;
  },

  // Export payment report
  async exportPaymentReport(params: {
    format: 'csv' | 'xlsx';
    startDate?: string;
    endDate?: string;
    status?: string;
    method?: string;
  }): Promise<Blob> {
    const response = await api.get('/v1/payments/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get payment disputes
  async getPaymentDisputes(params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
    status?: string;
  }) {
    const queryParams = {
      page: 0,
      size: 10,
      ...params
    };
    
    const response = await api.get('/v1/payments/disputes', { params: queryParams });
    return response.data;
  },

  // Handle payment dispute
  async handlePaymentDispute(disputeId: string, action: 'ACCEPT' | 'REJECT', reason?: string) {
    const response = await api.post(`/v1/payments/disputes/${disputeId}/handle`, {
      action,
      reason
    });
    return response.data;
  },

  // Filter payments with advanced search criteria
  async filterPayments(filterParams: {
    page?: number;
    size?: number;
    cursor?: string | number;
    search?: string;
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }) {
    const queryParams = {
      page: 0,
      size: 10,
      ...filterParams
    };
    
    const response = await api.post('/v1/payments/filter/search', queryParams);
    return response.data;
  },

  // Customer Payment Operations
  
  /**
   * Initiate Viettel Money payment for an order
   * @param request Payment initiation request
   * @returns Promise with payment initiation response
   */
  async initiateViettelPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    try {
      const { orderId, returnType = 'WEB', returnUrl } = request;
      
      const params = new URLSearchParams();
      params.append('returnType', returnType);
      if (returnUrl) {
        params.append('returnUrl', returnUrl);
      }

      const response = await api.post(`/v1/payment/viettel/initiate/${orderId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error initiating Viettel payment:', error);
      throw error as ApiError;
    }
  },

  /**
   * Check payment status for an order
   * @param orderId The order ID
   * @returns Promise with payment status
   */
  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await api.get(`/v1/payment/viettel/status/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking payment status for order ${orderId}:`, error);
      throw error as ApiError;
    }
  },

  /**
   * Process customer refund for an order
   * @param request Refund request
   * @returns Promise with refund response
   */
  async processCustomerRefund(request: CustomerRefundRequest): Promise<RefundResponse> {
    try {
      const { orderId, refundAmount, reason } = request;
      
      const params = new URLSearchParams();
      if (refundAmount) {
        params.append('refundAmount', refundAmount.toString());
      }
      if (reason) {
        params.append('reason', reason);
      }

      const response = await api.post(`/v1/payment/viettel/refund/${orderId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error processing refund for order ${request.orderId}:`, error);
      throw error as ApiError;
    }
  },

  /**
   * Get payment methods available for checkout
   * @returns Promise with available payment methods
   */
  async getAvailablePaymentMethods(): Promise<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  }[]> {
    try {
      // For now, return static payment methods
      // This could be replaced with a backend call if payment methods become dynamic
      return [
        {
          id: 'cod',
          name: 'Thanh toán khi nhận hàng (COD)',
          description: 'Thanh toán bằng tiền mặt khi nhận hàng',
          enabled: true
        },
        {
          id: 'bank_transfer',
          name: 'Chuyển khoản ngân hàng',
          description: 'Chuyển khoản qua Internet Banking hoặc ATM',
          enabled: true
        },
        {
          id: 'credit_card',
          name: 'Thẻ tín dụng/Ghi nợ',
          description: 'Visa, MasterCard, JCB',
          enabled: true
        },
        {
          id: 'viettel_money',
          name: 'Viettel Money',
          description: 'Thanh toán qua ví điện tử Viettel Money',
          enabled: true
        }
      ];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error as ApiError;
    }
  },

  /**
   * Process payment based on selected method
   * @param orderId Order ID
   * @param paymentMethod Selected payment method
   * @param returnUrl Return URL for web payments
   * @returns Promise with payment processing result
   */
  async processPayment(
    orderId: string, 
    paymentMethod: PaymentMethod,
    returnUrl?: string
  ): Promise<{
    success: boolean;
    paymentUrl?: string;
    qrCode?: string;
    deepLink?: string;
    message: string;
  }> {
    try {
      switch (paymentMethod) {
        case PaymentMethod.VIETTEL_MONEY:
          const viettelResponse = await this.initiateViettelPayment({
            orderId,
            returnType: 'WEB',
            returnUrl
          });
          return {
            success: viettelResponse.success,
            paymentUrl: viettelResponse.paymentUrl,
            qrCode: viettelResponse.qrCode,
            deepLink: viettelResponse.deepLink,
            message: viettelResponse.message
          };

        case PaymentMethod.CASH_ON_DELIVERY:
          // COD doesn't require immediate payment processing
          return {
            success: true,
            message: 'Đơn hàng đã được tạo thành công. Bạn sẽ thanh toán khi nhận hàng.'
          };

        case PaymentMethod.CREDIT_CARD:
          // For now, redirect to a placeholder or integrate with other payment gateways
          return {
            success: true,
            message: 'Thanh toán bằng thẻ tín dụng sẽ được xử lý sau.'
          };

        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error(`Error processing payment for order ${orderId}:`, error);
      throw error as ApiError;
    }
  },

  /**
   * Handle payment callback from payment gateway
   * @param orderId Order ID
   * @param paymentData Payment callback data
   * @returns Promise with callback processing result
   */
  async handlePaymentCallback(orderId: string, paymentData: Record<string, unknown>): Promise<{
    success: boolean;
    orderStatus: string;
    message: string;
  }> {
    try {
      // This would typically validate the callback and update order status
      const statusResponse = await this.checkPaymentStatus(orderId);
      console.log('Payment callback data:', paymentData); // Use the parameter
      
      return {
        success: statusResponse.transactionStatus === 'SUCCESS',
        orderStatus: statusResponse.orderStatus,
        message: statusResponse.transactionStatus === 'SUCCESS' 
          ? 'Thanh toán thành công!' 
          : 'Thanh toán thất bại!'
      };
    } catch (error) {
      console.error(`Error handling payment callback for order ${orderId}:`, error);
      throw error as ApiError;
    }
  }
};

export default paymentService;
