'use client';

import api from '@/lib/axios';
import { Order, OrderStatus, OrderDto } from '@/types/Order';
import { ApiError } from '@/types/api';

/**
 * Transform OrderDto from backend to Order for frontend
 * Converts ISO date strings to Date objects for proper timezone handling
 */
const transformOrderDto = (orderDto: OrderDto): Order => {
  return {
    ...orderDto,
    createdAt: new Date(orderDto.createdAt),
    updatedAt: new Date(orderDto.updatedAt),
  } as Order;
};

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
      
      // Transform the response data if it contains orders
      if (response.data && Array.isArray(response.data.content)) {
        return {
          ...response.data,
          content: response.data.content.map(transformOrderDto)
        };
      } else if (response.data && Array.isArray(response.data)) {
        return response.data.map(transformOrderDto);
      }
      
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
      return transformOrderDto(response.data);
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
      return transformOrderDto(response.data);
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
      const response = await api.post(`/v1/orders/${id}/status`, { status });
      return transformOrderDto(response.data);
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
   * Cancel an order
   * @param id The order ID to cancel
   * @returns Promise with the cancelled order
   */
  async cancelOrder(id: string): Promise<Order> {
    try {
      const response = await api.post(`/v1/orders/${id}/cancel`);
      return transformOrderDto(response.data);
    } catch (error) {
      console.error(`Error cancelling order with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Get order tracking information
   * @param id The order ID to track
   * @returns Promise with the order tracking details
   */
  async getOrderTracking(id: string): Promise<Order> {
    try {
      const response = await api.get(`/v1/orders/${id}/tracking`);
      return transformOrderDto(response.data);
    } catch (error) {
      console.error(`Error getting tracking info for order with id ${id}:`, error);
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
      return response.data.map(transformOrderDto);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error as ApiError;
    }
  }

  /**
   * Reorder an existing order by creating a new order with the same items
   * @param id The original order ID to reorder
   * @returns Promise with the newly created order
   */
  async reorderOrder(id: string): Promise<Order> {
    try {
      const response = await api.post(`/v1/orders/${id}/reorder`);
      return transformOrderDto(response.data);
    } catch (error) {
      console.error(`Error reordering order with id ${id}:`, error);
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
      
      return {
        ...response.data,
        content: response.data.content.map(transformOrderDto)
      };
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
      const response = await api.get('/v1/stats/orders');
      const data = response.data;
      
      // Transform backend data to match frontend expectations
      return {
        total: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        statusCounts: data.ordersByStatus || {},
        recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders.length : 0
      };
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
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

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
      return response.data.map(transformOrderDto);
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
      
      // Transform the response data if it contains orders
      if (response.data && Array.isArray(response.data.content)) {
        return {
          ...response.data,
          content: response.data.content.map(transformOrderDto)
        };
      } else if (response.data && Array.isArray(response.data)) {
        return response.data.map(transformOrderDto);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error filtering orders:', error);
      throw error as ApiError;
    }
  }
}

// Create a singleton instance
export const orderService = new OrderService();
