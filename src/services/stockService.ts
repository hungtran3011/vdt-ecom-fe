// Stock Management Service
import api from '@/lib/axios';
import { 
  StockItem, 
  StockMovement, 
  StockAlert, 
  StockSummary,
  CreateStockMovementRequest,
  UpdateStockRequest
} from '@/types/Stock';

export const stockService = {
  // Get all stock items with pagination and filters
  async getStockItems(params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
    search?: string;
    categoryId?: number;
    lowStock?: boolean;
    outOfStock?: boolean;
  }) {
    const queryParams = {
      ...params,
      // Ensure consistent parameter naming
      size: params?.size || 10
    };
    
    const response = await api.get('/v1/admin/stock', { params: queryParams });
    return response.data;
  },

  // Get stock item by product ID
  async getStockByProductId(productId: number): Promise<StockItem> {
    const response = await api.get(`/v1/admin/stock/product/${productId}`);
    return response.data;
  },

  // Get stock movements history
  async getStockMovements(params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
    productId?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = {
      ...params,
      // Ensure consistent parameter naming
      size: params?.size || 10
    };
    
    const response = await api.get('/v1/admin/stock/movements', { params: queryParams });
    return response.data;
  },

  // Create stock movement (add/remove stock)
  async createStockMovement(data: CreateStockMovementRequest): Promise<StockMovement> {
    const response = await api.post('/v1/admin/stock/movements', data);
    return response.data;
  },

  // Update stock settings
  async updateStock(data: UpdateStockRequest): Promise<StockItem> {
    const response = await api.put(`/v1/admin/stock/product/${data.productId}`, data);
    return response.data;
  },

  // Get stock alerts (low stock, out of stock, etc.)
  async getStockAlerts(params?: {
    acknowledged?: boolean;
    severity?: string;
  }) {
    const response = await api.get('/v1/admin/stock/alerts', { params });
    return response.data;
  },

  // Acknowledge stock alert
  async acknowledgeAlert(alertId: number): Promise<void> {
    await api.patch(`/v1/admin/stock/alerts/${alertId}/acknowledge`);
  },

  // Get stock summary/statistics
  async getStockSummary(): Promise<StockSummary> {
    const response = await api.get('/v1/admin/stock/summary');
    return response.data;
  },

  // Bulk update stock levels
  async bulkUpdateStock(updates: Array<{
    productId: number;
    quantity: number;
    reason: string;
  }>): Promise<void> {
    await api.post('/v1/admin/stock/bulk-update', { updates });
  },

  // Export stock report
  async exportStockReport(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await api.get(`/v1/admin/stock/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default stockService;
