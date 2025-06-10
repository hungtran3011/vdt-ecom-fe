'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus } from '@/types/Order';
import { orderService } from '@/services/orderService';

/**
 * Custom hook for fetching all orders with React Query and pagination
 */
export const useOrders = (params?: {
  page?: number;
  size?: number;
  cursor?: string | number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}, initialData?: Order[]) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getAllOrders(params),
    initialData,
  });
};

/**
 * Custom hook for fetching a single order by ID
 */
export const useOrder = (orderId: string) => {
  return useQuery<Order, Error>({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};

/**
 * Alias for useOrder for consistency
 */
export const useOrderById = useOrder;

/**
 * Custom hook for creating an order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => 
      orderService.createOrder(newOrder),
    onSuccess: () => {
      // Invalidate the orders query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Custom hook for updating an order's status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => 
      orderService.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      // Update specific order in cache
      queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder);
      // Invalidate the orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Custom hook for deleting an order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => orderService.deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      // Remove from specific order cache
      queryClient.removeQueries({ queryKey: ['orders', orderId] });
      // Invalidate the orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Custom hook for reordering an order
 */
export const useReorderOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => orderService.reorderOrder(orderId),
    onSuccess: (newOrder) => {
      // Invalidate the orders list to show the new order
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Cache the new order
      queryClient.setQueryData(['orders', newOrder.id], newOrder);
    },
  });
};

/**
 * Custom hook for fetching current user's orders
 */
export const useUserOrders = () => {
  return useQuery<Order[], Error>({
    queryKey: ['orders', 'user'],
    queryFn: () => orderService.getUserOrders(),
  });
};

/**
 * Custom hook for fetching orders with filters
 */
export const useOrdersWithFilters = (filters: {
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: ['orders', 'filtered', filters],
    queryFn: () => orderService.getOrdersWithFilters(filters),
    enabled: Object.keys(filters).length > 0,
  });
};

/**
 * Custom hook for fetching order statistics
 */
export const useOrderStatistics = () => {
  return useQuery({
    queryKey: ['orders', 'statistics'],
    queryFn: () => orderService.getOrderStatistics(),
  });
};

/**
 * Custom hook for exporting orders
 */
export const useExportOrders = () => {
  return useMutation({
    mutationFn: (filters?: {
      status?: string;
      paymentMethod?: string;
      dateFrom?: string;
      dateTo?: string;
      // Legacy parameter names for backwards compatibility
      startDate?: string;
      endDate?: string;
    }) => orderService.exportOrders(filters),
    onSuccess: (blob) => {
      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
  });
};

/**
 * Custom hook for bulk updating order statuses
 */
export const useBulkUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: { id: string; status: OrderStatus }[]) => 
      orderService.bulkUpdateOrderStatus(updates),
    onSuccess: () => {
      // Invalidate orders queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Custom hook for filtering orders with advanced criteria
 */
export const useFilterOrders = (filterParams: {
  page?: number;
  size?: number;
  cursor?: string | number;
  search?: string;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}, enabled = true) => {
  return useQuery({
    queryKey: ['orders', 'filter', filterParams],
    queryFn: () => orderService.filterOrders(filterParams),
    enabled: enabled,
  });
};
