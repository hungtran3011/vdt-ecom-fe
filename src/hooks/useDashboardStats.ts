import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { adminService } from '@/services/adminService';
import { DashboardStats } from '@/types/DashboardStats';

// Fallback data for when API fails
const FALLBACK_STATS: DashboardStats = {
  totalUsers: 1234,
  totalProducts: 567,
  totalOrders: 89,
  totalRevenue: 12345,
  // Stock metrics
  totalStockValue: 50000,
  lowStockAlerts: 15,
  outOfStockItems: 3,
  // Payment metrics
  pendingPayments: 8,
  completedPayments: 156,
  refundedPayments: 12,
  totalPaymentVolume: 25000,
};

export const DASHBOARD_STATS_QUERY_KEY = ['admin', 'dashboard', 'stats'] as const;

interface UseDashboardStatsOptions {
  fallbackStats?: DashboardStats;
  onStatsUpdate?: (stats: DashboardStats) => void;
  retryDelay?: number;
  debounceMs?: number;
}

export function useDashboardStats(options: UseDashboardStatsOptions = {}) {
  const {
    fallbackStats = FALLBACK_STATS,
    onStatsUpdate,
    retryDelay = 1000,
    debounceMs = 300
  } = options;

  const queryClient = useQueryClient();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const query = useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: adminService.getDashboardStats,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3) {
        const errorWithResponse = error as { response?: { status?: number } };
        const status = errorWithResponse?.response?.status;
        // Don't retry for auth errors (401, 403)
        if (status === 401 || status === 403) {
          console.log('🚫 Not retrying auth error:', status);
          return false;
        }
        console.log(`🔄 Retrying dashboard stats fetch (attempt ${failureCount + 1}/3)`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(retryDelay * Math.pow(2, attemptIndex), 10000);
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    meta: {
      errorBoundary: false, // Handle errors gracefully instead of throwing
    }
  });

  // Use successful data or fallback
  const stats = query.data || fallbackStats;

  // Notify parent component of stats updates (debounced)
  const debouncedStatsUpdate = useCallback(
    (newStats: DashboardStats) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        onStatsUpdate?.(newStats);
      }, debounceMs);
    },
    [onStatsUpdate, debounceMs]
  );

  // Call onStatsUpdate when stats change
  if (query.data && onStatsUpdate) {
    debouncedStatsUpdate(query.data);
  }

  // Debounced retry function
  const retryFetch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Manual retry triggered');
      query.refetch();
    }, debounceMs);
  }, [query, debounceMs]);

  // Force refresh function (bypasses cache)
  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refresh triggered');
    queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
  }, [queryClient]);

  return {
    stats,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefetching: query.isRefetching,
    retryFetch,
    forceRefresh,
    // Expose some query state for advanced usage
    failureCount: query.failureCount,
    isStale: query.isStale,
  };
}
