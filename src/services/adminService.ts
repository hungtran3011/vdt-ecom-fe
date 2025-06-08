import { createApiClient } from '@/utils/apiClient';
import { DashboardStats } from '@/types/DashboardStats';
import { getServerSession } from 'next-auth';

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
  }
};
