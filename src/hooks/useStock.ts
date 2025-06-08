// Stock Management Hooks using TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import stockService from '@/services/stockService';
import { 
  CreateStockMovementRequest,
  UpdateStockRequest
} from '@/types/Stock';

// Query Keys
export const stockKeys = {
  all: ['stock'] as const,
  items: () => [...stockKeys.all, 'items'] as const,
  item: (productId: number) => [...stockKeys.all, 'item', productId] as const,
  movements: () => [...stockKeys.all, 'movements'] as const,
  alerts: () => [...stockKeys.all, 'alerts'] as const,
  summary: () => [...stockKeys.all, 'summary'] as const,
};

// Get stock items with pagination
export function useStockItems(params?: {
  page?: number;
  size?: number;
  cursor?: string | number;
  search?: string;
  categoryId?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
}) {
  return useQuery({
    queryKey: [...stockKeys.items(), params],
    queryFn: () => stockService.getStockItems(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get stock item by product ID
export function useStockItem(productId: number) {
  return useQuery({
    queryKey: stockKeys.item(productId),
    queryFn: () => stockService.getStockByProductId(productId),
    enabled: !!productId,
  });
}

// Get stock movements
export function useStockMovements(params?: {
  page?: number;
  size?: number;
  cursor?: string | number;
  productId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...stockKeys.movements(), params],
    queryFn: () => stockService.getStockMovements(params),
    staleTime: 60000, // 1 minute
  });
}

// Get stock alerts
export function useStockAlerts(params?: {
  acknowledged?: boolean;
  severity?: string;
}) {
  return useQuery({
    queryKey: [...stockKeys.alerts(), params],
    queryFn: () => stockService.getStockAlerts(params),
    refetchInterval: 60000, // Refetch every minute for alerts
  });
}

// Get stock summary
export function useStockSummary() {
  return useQuery({
    queryKey: stockKeys.summary(),
    queryFn: () => stockService.getStockSummary(),
    staleTime: 30000, // 30 seconds
  });
}

// Create stock movement mutation
export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementRequest) => 
      stockService.createStockMovement(data),
    onSuccess: () => {
      // Invalidate and refetch stock data
      queryClient.invalidateQueries({ queryKey: stockKeys.items() });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Update stock mutation
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStockRequest) => 
      stockService.updateStock(data),
    onSuccess: (updatedStock) => {
      // Update the cache for the specific item
      queryClient.setQueryData(
        stockKeys.item(updatedStock.productId),
        updatedStock
      );
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: stockKeys.items() });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Acknowledge alert mutation
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: number) => 
      stockService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Bulk update stock mutation
export function useBulkUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{
      productId: number;
      quantity: number;
      reason: string;
    }>) => stockService.bulkUpdateStock(updates),
    onSuccess: () => {
      // Invalidate all stock-related queries
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

// Export stock report mutation
export function useExportStockReport() {
  return useMutation({
    mutationFn: (format: 'csv' | 'xlsx' = 'csv') => 
      stockService.exportStockReport(format),
    onSuccess: (blob, format) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
