// Payment Management Hooks using TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentService from '@/services/paymentService';
import { 
  RefundRequest,
  ProcessPaymentRequest
} from '@/types/Payment';

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  orderPayments: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,
  summary: () => [...paymentKeys.all, 'summary'] as const,
  analytics: () => [...paymentKeys.all, 'analytics'] as const,
  disputes: () => [...paymentKeys.all, 'disputes'] as const,
};

// Get payments with pagination
export function usePayments(params?: {
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
  return useQuery({
    queryKey: paymentKeys.list(params || {}),
    queryFn: () => paymentService.getPayments(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get payment by ID
export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => paymentService.getPaymentById(paymentId),
    enabled: !!paymentId,
  });
}

// Get payments by order ID
export function useOrderPayments(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.orderPayments(orderId),
    queryFn: () => paymentService.getPaymentsByOrderId(orderId),
    enabled: !!orderId,
  });
}

// Get payment summary
export function usePaymentSummary(params?: {
  startDate?: string;
  endDate?: string;
  method?: string;
}) {
  return useQuery({
    queryKey: [...paymentKeys.summary(), params],
    queryFn: () => paymentService.getPaymentSummary(params),
    staleTime: 60000, // 1 minute
  });
}

// Get payment analytics
export function usePaymentAnalytics(params?: {
  period?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...paymentKeys.analytics(), params],
    queryFn: () => paymentService.getPaymentAnalytics(params),
    staleTime: 300000, // 5 minutes
  });
}

// Get payment disputes
export function usePaymentDisputes(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: [...paymentKeys.disputes(), params],
    queryFn: () => paymentService.getPaymentDisputes(params),
    staleTime: 60000, // 1 minute
  });
}

// Process payment mutation
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessPaymentRequest) => 
      paymentService.processPayment(data),
    onSuccess: (updatedPayment) => {
      // Update the specific payment in cache
      queryClient.setQueryData(
        paymentKeys.detail(updatedPayment.id),
        updatedPayment
      );
      
      // Invalidate payment lists and summary
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.summary() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.analytics() });
    },
  });
}

// Create refund mutation
export function useCreateRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefundRequest) => 
      paymentService.createRefund(data),
    onSuccess: (updatedPayment) => {
      // Update the specific payment in cache
      queryClient.setQueryData(
        paymentKeys.detail(updatedPayment.id),
        updatedPayment
      );
      
      // Invalidate payment lists and summary
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.summary() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.analytics() });
    },
  });
}

// Reconcile payments mutation
export function useReconcilePayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      startDate: string;
      endDate: string;
      provider: string;
    }) => paymentService.reconcilePayments(data),
    onSuccess: () => {
      // Invalidate payment lists after reconciliation
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.summary() });
    },
  });
}

// Handle payment dispute mutation
export function useHandlePaymentDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, action, reason }: {
      disputeId: string;
      action: 'ACCEPT' | 'REJECT';
      reason?: string;
    }) => paymentService.handlePaymentDispute(disputeId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.disputes() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

// Export payment report mutation
export function useExportPaymentReport() {
  return useMutation({
    mutationFn: (params: {
      format: 'csv' | 'xlsx';
      startDate?: string;
      endDate?: string;
      status?: string;
      method?: string;
    }) => paymentService.exportPaymentReport(params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-report.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Filter payments with advanced criteria
export function useFilterPayments(filterParams: {
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
}, enabled = true) {
  return useQuery({
    queryKey: [...paymentKeys.all, 'filter', filterParams],
    queryFn: () => paymentService.filterPayments(filterParams),
    enabled: enabled,
    staleTime: 30000,
  });
}
