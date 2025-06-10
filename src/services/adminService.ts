import { createApiClient } from '@/utils/apiClient';
import { DashboardStats } from '@/types/DashboardStats';
import { getServerSession } from 'next-auth';
import { SystemStatsDto } from '@/types/Stats';

const apiClient = createApiClient();

export const adminService = {
  /**
   * Fetch dashboard statistics for admin panel
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const session = await getServerSession();
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await apiClient.get(
        '/v1/stats',
        {
          headers: {
            'Authorization': `Bearer ${session?.accessToken || ''}`,
          }
        }
      );
      console.log('✅ Dashboard stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error);
      
      // Provide fallback data to prevent UI breaks
      if (error instanceof Error && error.message.includes('iss claim')) {
        console.warn('⚠️ Token issuer validation failed - check your Keycloak configuration');
      }
      
      throw error;
    }
  },

  // Get comprehensive system statistics
  async getSystemStats(): Promise<SystemStatsDto> {
    try {
      const response = await apiClient.get('/v1/stats/system');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },

  // Get product statistics
  async getProductStats(): Promise<SystemStatsDto['productStats']> {
    try {
      const response = await apiClient.get('/v1/stats/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  },

  // Get order statistics
  async getOrderStats(): Promise<SystemStatsDto['orderStats']> {
    try {
      const response = await apiClient.get('/v1/stats/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },

  // Get payment statistics
  async getPaymentStats(): Promise<SystemStatsDto['paymentStats']> {
    try {
      const response = await apiClient.get('/v1/stats/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  // Get user activity statistics
  async getUserActivityStats(): Promise<SystemStatsDto['userActivityStats']> {
    try {
      const response = await apiClient.get('/v1/stats/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity stats:', error);
      throw error;
    }
  },

  // Get stock statistics
  async getStockStats(): Promise<SystemStatsDto['stockStats']> {
    try {
      const response = await apiClient.get('/v1/stats/stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching stock stats:', error);
      throw error;
    }
  },

  // Get cart statistics
  async getCartStats(): Promise<SystemStatsDto['cartStats']> {
    try {
      const response = await apiClient.get('/v1/stats/carts');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart stats:', error);
      throw error;
    }
  },

  // Get performance statistics
  async getPerformanceStats(): Promise<SystemStatsDto['performanceStats']> {
    try {
      const response = await apiClient.get('/v1/stats/performance');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance stats:', error);
      throw error;
    }
  },

  // Get category statistics
  async getCategoryStats(): Promise<SystemStatsDto['categoryStats']> {
    try {
      const response = await apiClient.get('/v1/stats/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  },

  // Get statistics summary
  async getStatsSummary(): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.get('/v1/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats summary:', error);
      throw error;
    }
  },

  // Health check
  async checkStatsHealth(): Promise<Record<string, string>> {
    try {
      const response = await apiClient.get('/v1/stats/health');
      return response.data;
    } catch (error) {
      console.error('Error checking stats health:', error);
      throw error;
    }
  }
};
