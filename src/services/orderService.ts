'use client';

import api from '@/lib/axios';
import { Order, OrderStatus } from '@/types/Order';
import { ApiError } from '@/types/api';

/**
 * Service for handling order-related API requests
 */
export class OrderService {
  /**
   * Fetches all orders with pagination and filtering
   * @param params Pagination and filter parameters
   * @returns Promise with paginated order data
   */
  async getAllOrders(params?: {
    page?: number;
    size?: number;
    cursor?: string | number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) {
    try {
      const queryParams = {
        page: 0,
        size: 20,
        ...params
      };
      
      const response = await api.get('/v1/orders', {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error as ApiError;
    }
  }

  /**
   * Fetch a single order by ID
   * @param id The order ID
   * @returns Promise with order data
   */
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get(`/v1/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Create a new order
   * @param order The order object without ID
   * @returns Promise with the created order
   */
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const response = await api.post('/v1/orders', order);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error as ApiError;
    }
  }

  /**
   * Update order status
   * @param id The order ID
   * @param status The new order status
   * @returns Promise with the updated order
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await api.patch(`/v1/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order status with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Delete an order (usually just for admin/testing purposes)
   * @param id The order ID to delete
   * @returns Promise with the operation result
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      await api.delete(`/v1/orders/${id}`);
    } catch (error) {
      console.error(`Error deleting order with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Get current user's orders
   * @returns Promise with user's orders
   */
  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/v1/orders/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error as ApiError;
    }
  }

  /**
   * Get orders with filtering options
   * @param filters Filtering options
   * @returns Promise with filtered orders
   */
  async getOrdersWithFilters(filters: {
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: Order[]; totalElements: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());

      const response = await api.get(`/v1/orders/filter?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered orders:', error);
      throw error as ApiError;
    }
  }

  /**
   * Get order statistics
   * @returns Promise with order statistics
   */
  async getOrderStatistics(): Promise<{
    total: number;
    totalRevenue: number;
    statusCounts: Record<string, number>;
    recentOrders: number;
  }> {
    try {
      const response = await api.get('/v1/orders/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error as ApiError;
    }
  }

  /**
   * Export orders to CSV
   * @param filters Export filters
   * @returns Promise with CSV data
   */
  async exportOrders(filters?: {
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await api.get(`/v1/orders/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error as ApiError;
    }
  }

  /**
   * Bulk update order statuses
   * @param updates Array of order updates
   * @returns Promise with update results
   */
  async bulkUpdateOrderStatus(updates: { id: string; status: OrderStatus }[]): Promise<Order[]> {
    try {
      const response = await api.patch('/v1/orders/bulk-status', { updates });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating order statuses:', error);
      throw error as ApiError;
    }
  }

  /**
   * Filter orders with advanced search criteria
   * @param filterParams Filter and pagination parameters
   * @returns Promise with filtered and paginated order data
   */
  async filterOrders(filterParams: {
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
  }) {
    try {
      const queryParams = {
        page: 0,
        size: 10,
        ...filterParams
      };
      
      const response = await api.post('/v1/orders/filter/search', queryParams);
      
      return response.data;
    } catch (error) {
      console.error('Error filtering orders:', error);
      throw error as ApiError;
    }
  }
}

// Create a singleton instance
export const orderService = new OrderService();
