import api from '@/lib/axios';
import { 
  User, 
  AdminUser, 
  UserRegistrationRequest, 
  UserUpdateRequest, 
  RoleAssignmentRequest, 
  PasswordResetRequest,
  SystemStatsDto 
} from '@/types/User';
import { ApiError, PaginatedResponse } from '@/types/api';
import { getSession } from 'next-auth/react';

/**
 * Service for handling user-related API requests
 * Integrates with NextAuth for authentication
 */
export class UserService {
  /**
   * Get the current session for client-side usage
   * @returns NextAuth session or null
   */
  private async getClientSession() {
    if (typeof window !== 'undefined') {
      return await getSession();
    }
    return null;
  }

  /**
   * Get user profile from NextAuth session
   * @returns Current user from session or fetches from API
   */
  async getCurrentUser(): Promise<User> {
    try {
      // First try to get user from session (client-side)
      const session = await this.getClientSession();

      if (session?.user) {
        // Convert NextAuth user to our User type
        const sessionUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name,
          image: session.user.image,
          preferred_username: session.user.preferred_username,
          given_name: session.user.given_name,
          family_name: session.user.family_name,
          roles: session.user.roles || [],
          groups: session.user.groups || [],
          accessToken: session.accessToken,
          isActive: true,
          emailVerified: true, // Assume verified if coming from Keycloak
          createdAt: new Date(), // We don't have this from session
          lastLoginAt: new Date(), // Current login time
        };
        return sessionUser;
      }

      // Fallback to API call if no session
      const response = await api.get('/v1/profiles/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error as ApiError;
    }
  }

  /**
   * Update the current user's profile
   * Note: For Keycloak users, some fields may need to be updated in Keycloak admin console
   * @param userData Partial user data to update
   * @returns Promise with the updated profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const session = await this.getClientSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Update via API (backend should handle Keycloak sync)
      const response = await api.put('/v1/profiles/me', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error as ApiError;
    }
  }

  /**
   * Change the user's password
   * Note: For Keycloak users, this will update the password in Keycloak
   * @param oldPassword The current password
   * @param newPassword The new password
   * @returns Promise with success status
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const session = await this.getClientSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      await api.post('/v1/profiles/me/password', { oldPassword, newPassword });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error as ApiError;
    }
  }

  /**
   * Upload a profile picture
   * @param file The image file to upload
   * @returns Promise with the updated user profile
   */
  async uploadProfilePicture(file: File): Promise<User> {
    try {
      const session = await this.getClientSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/v1/profiles/me/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error as ApiError;
    }
  }

  /**
   * Check if the current user has admin role
   * @returns Promise with boolean indicating admin status
   */
  async isAdmin(): Promise<boolean> {
    try {
      const session = await this.getClientSession();
      return session?.user?.roles?.includes('admin') || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * For admin: Update user
   * @param id The user ID
   * @param userData The user data to update
   * @returns Promise with updated user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      // Check admin role
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        throw new Error('Access denied: Admin role required');
      }

      const response = await api.put(`/v1/profiles/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * For admin: delete a user
   * @param id The user ID to delete
   * @returns Promise with operation result
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Check admin role
      const isAdminUser = await this.isAdmin();
      if (!isAdminUser) {
        throw new Error('Access denied: Admin role required');
      }

      await api.delete(`/v1/profiles/${id}`);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error as ApiError;
    }
  }

  // ========== ADMIN USER MANAGEMENT METHODS ==========

  /**
   * Admin: Get all users (paginated)
   * @param params Pagination and search parameters
   * @returns Promise with paginated user data
   */
  async getAllUsers(params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<PaginatedResponse<AdminUser>> {
    try {
      const queryParams = {
        page: 0,
        size: 10,
        ...params
      };
      
      const response = await api.get('/v1/profiles', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Create a new user
   * @param userData User registration data
   * @returns Promise with creation result
   */
  async createUser(userData: UserRegistrationRequest): Promise<{ message: string; userId: string }> {
    try {
      const response = await api.post('/v1/auth/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Get user by ID
   * @param userId The user ID
   * @returns Promise with user data
   */
  async getUserById(userId: string): Promise<AdminUser> {
    try {
      const response = await api.get(`/v1/auth/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Update user information
   * @param userId The user ID
   * @param userData User update data
   * @returns Promise with updated user
   */
  async updateUserById(userId: string, userData: UserUpdateRequest): Promise<AdminUser> {
    try {
      const response = await api.put(`/v1/auth/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Delete user by ID
   * @param userId The user ID
   * @returns Promise with operation result
   */
  async deleteUserById(userId: string): Promise<void> {
    try {
      await api.delete(`/v1/auth/admin/users/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Assign role to user
   * @param roleData Role assignment data
   * @returns Promise with operation result
   */
  async assignRole(roleData: RoleAssignmentRequest): Promise<void> {
    try {
      await api.post('/v1/auth/admin/users/roles', roleData);
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Remove role from user
   * @param userId The user ID
   * @param roleName The role name to remove
   * @returns Promise with operation result
   */
  async removeRole(userId: string, roleName: string): Promise<void> {
    try {
      await api.delete(`/v1/auth/admin/users/${userId}/roles/${roleName}`);
    } catch (error) {
      console.error(`Error removing role ${roleName} from user ${userId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Get user roles
   * @param userId The user ID
   * @returns Promise with user roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const response = await api.get(`/v1/auth/admin/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching roles for user ${userId}:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Reset user password
   * @param passwordData Password reset data
   * @returns Promise with operation result
   */
  async resetPassword(passwordData: PasswordResetRequest): Promise<void> {
    try {
      await api.post('/v1/auth/admin/users/reset-password', passwordData);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Enable/Disable user
   * @param userId The user ID
   * @param enabled Whether to enable or disable the user
   * @returns Promise with operation result
   */
  async setUserEnabled(userId: string, enabled: boolean): Promise<void> {
    try {
      await api.put(`/v1/auth/admin/users/${userId}/enabled`, { enabled });
    } catch (error) {
      console.error(`Error setting user ${userId} enabled status:`, error);
      throw error as ApiError;
    }
  }

  /**
   * Admin: Get system statistics
   * @returns Promise with system statistics
   */
  async getSystemStats(): Promise<SystemStatsDto> {
    try {
      const response = await api.get('/v1/stats/system');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error as ApiError;
    }
  }
}

// Create a singleton instance
export const userService = new UserService();
