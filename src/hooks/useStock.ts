// Stock Management Hooks using TanStack Query - Updated to match backend API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import stockService from '@/services/stockService';
import { 
  UpdateStockRequest,
  CreateStockRequest
} from '@/types/Stock';

// Query Keys
export const stockKeys = {
  all: ['stock'] as const,
  items: () => [...stockKeys.all, 'items'] as const,
  item: (stockId: number) => [...stockKeys.all, 'item', stockId] as const,
  itemByProduct: (productId: number) => [...stockKeys.all, 'product', productId] as const,
  movements: () => [...stockKeys.all, 'movements'] as const,
  movementsByStock: (stockId: number) => [...stockKeys.all, 'movements', stockId] as const,
  alerts: () => [...stockKeys.all, 'alerts'] as const,
  summary: () => [...stockKeys.all, 'summary'] as const,
  history: (stockId: number) => [...stockKeys.all, 'history', stockId] as const,
  variations: (productId: number) => [...stockKeys.all, 'variations', productId] as const,
};

// Get stock items with pagination and filters
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

// Get stock item by ID
export function useStockItem(stockId: number) {
  return useQuery({
    queryKey: stockKeys.item(stockId),
    queryFn: () => stockService.getStockById(stockId),
    enabled: !!stockId,
  });
}

// Get stock item by product ID
export function useStockByProduct(productId: number) {
  return useQuery({
    queryKey: stockKeys.itemByProduct(productId),
    queryFn: () => stockService.getStockByProductId(productId),
    enabled: !!productId,
  });
}

// Get product variation stock
export function useProductVariationStock(productId: number) {
  return useQuery({
    queryKey: stockKeys.variations(productId),
    queryFn: () => stockService.getProductVariationStock(productId),
    enabled: !!productId,
  });
}

// Get stock movements
export function useStockMovements(params?: {
  page?: number;
  size?: number;
  cursor?: string | number;
  stockId?: number;
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

// Get movements for specific stock item
export function useStockMovementsByStockId(stockId: number, params?: {
  page?: number;
  size?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...stockKeys.movementsByStock(stockId), params],
    queryFn: () => stockService.getStockMovementsByStockId(stockId, params),
    enabled: !!stockId,
    staleTime: 60000, // 1 minute
  });
}

// Get stock history
export function useStockHistory(stockId: number, params?: {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...stockKeys.history(stockId), params],
    queryFn: () => stockService.getStockHistory(stockId, params),
    enabled: !!stockId,
    staleTime: 60000, // 1 minute
  });
}

// Get stock alerts
export function useStockAlerts(params?: {
  acknowledged?: boolean;
  severity?: string;
  page?: number;
  size?: number;
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

// Create stock item mutation
export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockRequest) => 
      stockService.createStock(data),
    onSuccess: () => {
      // Invalidate all stock-related queries
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

// Update stock item mutation
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, data }: { stockId: number; data: UpdateStockRequest }) => 
      stockService.updateStock(stockId, data),
    onSuccess: (updatedStock) => {
      // Update the cache for the specific item
      queryClient.setQueryData(
        stockKeys.item(updatedStock.id),
        updatedStock
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: stockKeys.items() });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Delete stock item mutation
export function useDeleteStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stockId: number) => 
      stockService.deleteStock(stockId),
    onSuccess: () => {
      // Invalidate all stock-related queries
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });
}

// Stock Operations Mutations

// Restock operation
export function useRestock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, data }: { 
      stockId: number; 
      data: { quantity: number; reason?: string; reference?: string; }
    }) => stockService.restockProduct(stockId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: stockKeys.item(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: stockKeys.movementsByStock(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Sale operation
export function useRecordSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, data }: { 
      stockId: number; 
      data: { quantity: number; orderId?: string; reference?: string; }
    }) => stockService.recordSale(stockId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: stockKeys.item(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: stockKeys.movementsByStock(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Return operation
export function useRecordReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, data }: { 
      stockId: number; 
      data: { quantity: number; orderId?: string; reason?: string; reference?: string; }
    }) => stockService.recordReturn(stockId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: stockKeys.item(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: stockKeys.movementsByStock(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Stock adjustment operation
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, data }: { 
      stockId: number; 
      data: { quantity: number; reason: string; reference?: string; }
    }) => stockService.adjustStock(stockId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: stockKeys.item(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.movements() });
      queryClient.invalidateQueries({ queryKey: stockKeys.movementsByStock(variables.stockId) });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: stockKeys.alerts() });
    },
  });
}

// Validation hooks

// Validate stock availability
export function useValidateStock() {
  return useMutation({
    mutationFn: ({ stockId, quantity }: { stockId: number; quantity: number }) => 
      stockService.validateStockAvailability(stockId, quantity),
  });
}

// Bulk validate stock
export function useBulkValidateStock() {
  return useMutation({
    mutationFn: (items: Array<{ stockId: number; quantity: number; }>) => 
      stockService.bulkValidateStock(items),
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
      stockId: number;
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
