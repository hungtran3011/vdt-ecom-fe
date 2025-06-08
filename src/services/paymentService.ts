// Payment Management Service
import api from '@/lib/axios';
import { 
  Payment, 
  PaymentSummary, 
  PaymentAnalytics,
  RefundRequest,
  ProcessPaymentRequest
} from '@/types/Payment';

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
    
    const response = await api.get('/v1/admin/payments', { params: queryParams });
    return response.data;
  },

  // Get payment by ID
  async getPaymentById(paymentId: string): Promise<Payment> {
    const response = await api.get(`/v1/admin/payments/${paymentId}`);
    return response.data;
  },

  // Get payments by order ID
  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    const response = await api.get(`/v1/admin/payments/order/${orderId}`);
    return response.data;
  },

  // Process payment (approve, reject, refund)
  async processPayment(data: ProcessPaymentRequest): Promise<Payment> {
    const response = await api.post(`/v1/admin/payments/${data.paymentId}/process`, data);
    return response.data;
  },

  // Create refund
  async createRefund(data: RefundRequest): Promise<Payment> {
    const response = await api.post(`/v1/admin/payments/${data.paymentId}/refund`, data);
    return response.data;
  },

  // Get payment summary/statistics
  async getPaymentSummary(params?: {
    startDate?: string;
    endDate?: string;
    method?: string;
  }): Promise<PaymentSummary> {
    const response = await api.get('/v1/admin/payments/summary', { params });
    return response.data;
  },

  // Get payment analytics
  async getPaymentAnalytics(params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentAnalytics> {
    const response = await api.get('/v1/admin/payments/analytics', { params });
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
    const response = await api.post('/v1/admin/payments/reconcile', data);
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
    const response = await api.get('/v1/admin/payments/export', {
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
    
    const response = await api.get('/v1/admin/payments/disputes', { params: queryParams });
    return response.data;
  },

  // Handle payment dispute
  async handlePaymentDispute(disputeId: string, action: 'ACCEPT' | 'REJECT', reason?: string) {
    const response = await api.post(`/v1/admin/payments/disputes/${disputeId}/handle`, {
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
    
    const response = await api.post('/v1/admin/payments/filter/search', queryParams);
    return response.data;
  }
};

export default paymentService;
