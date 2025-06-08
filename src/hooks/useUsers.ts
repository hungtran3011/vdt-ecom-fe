'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { 
  User, 
  AdminUser, 
  UserRegistrationRequest, 
  UserUpdateRequest, 
  RoleAssignmentRequest, 
  PasswordResetRequest,
  SystemStatsDto 
} from '@/types/User';
import { userService } from '@/services/userService';

/**
 * Custom hook for NextAuth session with user data
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    session,
    isAdmin: session?.user?.roles?.includes('admin') || false,
  };
};

/**
 * Custom hook for fetching the current user profile
 * Integrates with NextAuth session
 */
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery<User, Error>({
    queryKey: ['users', 'me'],
    queryFn: () => userService.getCurrentUser(),
    enabled: isAuthenticated, // Only fetch if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Custom hook for updating the current user's profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Partial<User>) => userService.updateProfile(userData),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users', 'me'], updatedUser);
    },
  });
};

/**
 * Custom hook for changing the user's password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => 
      userService.changePassword(oldPassword, newPassword),
  });
};

/**
 * Custom hook for uploading a profile picture
 */
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(file),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users', 'me'], updatedUser);
    },
  });
};

/**
 * Custom hook for fetching all users (admin only)
 */
export const useAllUsers = (params?: {
  page?: number;
  size?: number;
  search?: string;
}) => {
  const { isAdmin, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['users', 'all', params],
    queryFn: () => userService.getAllUsers(params),
    enabled: isAuthenticated && isAdmin,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Custom hook for fetching a user by ID (admin only)
 */
export const useUserById = (userId: string, enabled = true) => {
  const { isAdmin, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: enabled && !!userId && isAuthenticated && isAdmin,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Custom hook for creating a user (admin only)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: UserRegistrationRequest) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
    },
  });
};

/**
 * Custom hook for updating a user (admin only)
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: UserUpdateRequest }) => 
      userService.updateUserById(userId, userData),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
    },
  });
};

/**
 * Custom hook for deleting a user (admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userService.deleteUserById(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
    },
  });
};

/**
 * Custom hook for assigning roles (admin only)
 */
export const useAssignRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (roleData: RoleAssignmentRequest) => userService.assignRole(roleData),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
    },
  });
};

/**
 * Custom hook for removing roles (admin only)
 */
export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => 
      userService.removeRole(userId, roleName),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
    },
  });
};

/**
 * Custom hook for getting user roles (admin only)
 */
export const useUserRoles = (userId: string) => {
  const { isAdmin, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['users', userId, 'roles'],
    queryFn: () => userService.getUserRoles(userId),
    enabled: !!userId && isAuthenticated && isAdmin,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Custom hook for resetting password (admin only)
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (passwordData: PasswordResetRequest) => userService.resetPassword(passwordData),
  });
};

/**
 * Custom hook for enabling/disabling users (admin only)
 */
export const useSetUserEnabled = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) => 
      userService.setUserEnabled(userId, enabled),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
    },
  });
};

/**
 * Custom hook for getting system statistics (admin only)
 */
export const useSystemStats = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['stats', 'system'],
    queryFn: () => userService.getSystemStats(),
    enabled: isAuthenticated && isAdmin,
    staleTime: 30 * 1000, // 30 seconds
  });
};
