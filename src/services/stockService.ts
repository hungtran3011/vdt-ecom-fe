// Stock Management Service - Updated to match actual backend API endpoints
import api from '@/lib/axios';
import { 
  StockItem, 
  StockMovement, 
  StockSummary,
  UpdateStockRequest,
  CreateStockRequest
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
    
    const response = await api.get('/v1/stock', { params: queryParams });
    return response.data;
  },

  // Get stock item by ID
  async getStockById(stockId: number): Promise<StockItem> {
    const response = await api.get(`/v1/stock/${stockId}`);
    return response.data;
  },

  // Get stock item by product ID
  async getStockByProductId(productId: number): Promise<StockItem> {
    const response = await api.get(`/api/v1/stock/product/${productId}`);
    return response.data;
  },

  // Create new stock item
  async createStock(data: CreateStockRequest): Promise<StockItem> {
    const response = await api.post('/v1/stock', data);
    return response.data;
  },

  // Update stock item
  async updateStock(stockId: number, data: UpdateStockRequest): Promise<StockItem> {
    const response = await api.put(`/v1/stock/${stockId}`, data);
    return response.data;
  },

  // Delete stock item
  async deleteStock(stockId: number): Promise<void> {
    await api.delete(`/v1/stock/${stockId}`);
  },

  // Stock Operations
  
  // Restock operation (add stock)
  async restockProduct(stockId: number, data: {
    quantity: number;
    reason?: string;
    reference?: string;
  }): Promise<StockMovement> {
    const response = await api.post(`/v1/stock/${stockId}/restock`, data);
    return response.data;
  },

  // Sale operation (reduce stock)
  async recordSale(stockId: number, data: {
    quantity: number;
    orderId?: string;
    reference?: string;
  }): Promise<StockMovement> {
    const response = await api.post(`/v1/stock/${stockId}/sale`, data);
    return response.data;
  },

  // Return operation (add back stock from return)
  async recordReturn(stockId: number, data: {
    quantity: number;
    orderId?: string;
    reason?: string;
    reference?: string;
  }): Promise<StockMovement> {
    const response = await api.post(`/v1/stock/${stockId}/return`, data);
    return response.data;
  },

  // Adjustment operation (manual stock adjustment)
  async adjustStock(stockId: number, data: {
    quantity: number;
    reason: string;
    reference?: string;
  }): Promise<StockMovement> {
    const response = await api.post(`/v1/stock/${stockId}/adjust`, data);
    return response.data;
  },

  // Get stock movements history
  async getStockMovements(params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
    stockId?: number;
    productId?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = {
      ...params,
      size: params?.size || 10
    };
    
    const response = await api.get('/v1/stock/movements', { params: queryParams });
    return response.data;
  },

  // Get movements for specific stock item
  async getStockMovementsByStockId(stockId: number, params?: {
    page?: number;
    size?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = {
      ...params,
      size: params?.size || 10
    };
    
    const response = await api.get(`/v1/stock/${stockId}/movements`, { params: queryParams });
    return response.data;
  },

  // Product Variations Management
  
  // Get stock for product variations
  async getProductVariationStock(productId: number): Promise<StockItem[]> {
    const response = await api.get(`/v1/stock/product/${productId}/variations`);
    return response.data;
  },

  // Validation
  
  // Validate stock availability
  async validateStockAvailability(stockId: number, quantity: number): Promise<{
    available: boolean;
    availableQuantity: number;
    message?: string;
  }> {
    const response = await api.post(`/v1/stock/${stockId}/validate`, { quantity });
    return response.data;
  },

  // Bulk validate stock for multiple items
  async bulkValidateStock(items: Array<{
    stockId: number;
    quantity: number;
  }>): Promise<Array<{
    stockId: number;
    available: boolean;
    availableQuantity: number;
    message?: string;
  }>> {
    const response = await api.post('/v1/stock/validate/bulk', { items });
    return response.data;
  },

  // History and Reporting
  
  // Get stock history for a specific stock item
  async getStockHistory(stockId: number, params?: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = {
      ...params,
      size: params?.size || 10
    };
    
    const response = await api.get(`/v1/stock/${stockId}/history`, { params: queryParams });
    return response.data;
  },

  // Get stock alerts (low stock, out of stock, etc.)
  async getStockAlerts(params?: {
    acknowledged?: boolean;
    severity?: string;
    page?: number;
    size?: number;
  }) {
    const queryParams = {
      ...params,
      size: params?.size || 10
    };
    
    const response = await api.get('/v1/stock/alerts', { params: queryParams });
    return response.data;
  },

  // Acknowledge stock alert
  async acknowledgeAlert(alertId: number): Promise<void> {
    await api.patch(`/v1/stock/alerts/${alertId}/acknowledge`);
  },

  // Get stock summary/statistics
  async getStockSummary(): Promise<StockSummary> {
    const response = await api.get('/v1/stock/summary');
    return response.data;
  },

  // Bulk update stock levels
  async bulkUpdateStock(updates: Array<{
    stockId: number;
    quantity: number;
    reason: string;
  }>): Promise<void> {
    await api.post('/v1/stock/bulk-update', { updates });
  },

  // Export stock report
  async exportStockReport(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await api.get(`/v1/stock/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default stockService;
