'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { SystemStatsDto } from '@/types/Stats';

// Query keys
const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  systemStats: () => [...adminKeys.stats(), 'system'] as const,
  productStats: () => [...adminKeys.stats(), 'products'] as const,
  orderStats: () => [...adminKeys.stats(), 'orders'] as const,
  paymentStats: () => [...adminKeys.stats(), 'payments'] as const,
  userStats: () => [...adminKeys.stats(), 'users'] as const,
  stockStats: () => [...adminKeys.stats(), 'stock'] as const,
  cartStats: () => [...adminKeys.stats(), 'carts'] as const,
  performanceStats: () => [...adminKeys.stats(), 'performance'] as const,
  categoryStats: () => [...adminKeys.stats(), 'categories'] as const,
  summary: () => [...adminKeys.stats(), 'summary'] as const,
  health: () => [...adminKeys.all, 'health'] as const,
};

export const useSystemStats = () => {
  return useQuery({
    queryKey: adminKeys.systemStats(),
    queryFn: () => adminService.getSystemStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

export const useProductStats = () => {
  return useQuery({
    queryKey: adminKeys.productStats(),
    queryFn: () => adminService.getProductStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: adminKeys.orderStats(),
    queryFn: () => adminService.getOrderStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: adminKeys.paymentStats(),
    queryFn: () => adminService.getPaymentStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

export const useUserActivityStats = () => {
  return useQuery({
    queryKey: adminKeys.userStats(),
    queryFn: () => adminService.getUserActivityStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStockStats = () => {
  return useQuery({
    queryKey: adminKeys.stockStats(),
    queryFn: () => adminService.getStockStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes
  });
};

export const useCartStats = () => {
  return useQuery({
    queryKey: adminKeys.cartStats(),
    queryFn: () => adminService.getCartStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePerformanceStats = () => {
  return useQuery({
    queryKey: adminKeys.performanceStats(),
    queryFn: () => adminService.getPerformanceStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
};

export const useCategoryStats = () => {
  return useQuery({
    queryKey: adminKeys.categoryStats(),
    queryFn: () => adminService.getCategoryStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useStatsSummary = () => {
  return useQuery({
    queryKey: adminKeys.summary(),
    queryFn: () => adminService.getStatsSummary(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
};

export const useStatsHealth = () => {
  return useQuery({
    queryKey: adminKeys.health(),
    queryFn: () => adminService.checkStatsHealth(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 1 * 60 * 1000, // Auto-refresh every minute
  });
};

// Legacy hook for backward compatibility
export const useDashboardStats = () => {
  return useSystemStats();
};