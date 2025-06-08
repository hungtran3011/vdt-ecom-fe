'use client';

import { useSession } from 'next-auth/react';
import { getUserRoles } from '@/utils/roleCheck';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import { DashboardStats } from '@/types/DashboardStats';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { t } from '@/utils/localization';
import { formatVND } from '@/utils/currency';
import TokenDebugger from './TokenDebugger';

interface AdminDashboardProps {
  title?: string;
  className?: string;
  fallbackStats?: DashboardStats;
  showUserInfo?: boolean;
  onStatsUpdate?: (stats: DashboardStats) => void;
}

export default function AdminDashboard({ 
  title = t('admin.dashboard'),
  className = "",
  fallbackStats = {
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
  },
  showUserInfo = true,
  onStatsUpdate
}: AdminDashboardProps) {
  const { data: session } = useSession();
  
  // Use TanStack Query hook with retry and debouncing
  const {
    stats,
    isLoading,
    isError,
    error,
    isRefetching,
    retryFetch,
    forceRefresh,
    failureCount,
    isStale
  } = useDashboardStats({
    fallbackStats,
    onStatsUpdate,
    retryDelay: 1000,
    debounceMs: 300
  });

  // Format error message for display
  const getErrorMessage = () => {
    if (!error) return null;
    
    const errorWithResponse = error as { response?: { status?: number } };
    const status = errorWithResponse?.response?.status;
    if (status === 401) {
      return 'Authentication failed - please check your session';
    } else if (status === 403) {
      return 'Access denied - insufficient permissions';
    } else if (status && status >= 500) {
      return 'Server error - please try again later';
    }
    return 'Failed to fetch dashboard statistics';
  };

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    bgColor, 
    textColor 
  }: {
    icon: string;
    title: string;
    value: string | number;
    bgColor: string;
    textColor: string;
  }) => (
    <Card variant="elevated" className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <span className={`${textColor} text-lg`}>{icon}</span>
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <div className="text-sm font-medium text-(--md-sys-color-on-surface-variant) truncate">{title}</div>
          <div className="text-lg font-medium text-(--md-sys-color-on-surface)">
            {isLoading || isRefetching ? (
              <div className="animate-pulse bg-(--md-sys-color-outline-variant) h-6 w-16 rounded"></div>
            ) : (
              typeof value === 'number' ? value.toLocaleString() : value
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={className}>
      {/* Header with refresh controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h2>
        
        <div className="flex gap-2">
          {/* Show retry count if there have been failures */}
          {failureCount > 0 && (
            <Chip
              variant="assist"
              color="error"
              label={`Retries: ${failureCount}`}
            />
          )}
          
          {/* Show stale indicator */}
          {isStale && (
            <Chip
              variant="assist"
              color="secondary"
              label="Stale"
            />
          )}
          
          {/* Refresh button */}
          <Button
            variant="outlined"
            onClick={forceRefresh}
            disabled={isLoading || isRefetching}
            label={isRefetching ? t('actions.processing') : t('actions.refresh')}
            icon="refresh"
          />
        </div>
      </div>
      
      {/* User Info Card */}
      {showUserInfo && (
        <Card variant="elevated" className="mb-6 p-6">
          <h3 className="text-lg leading-6 font-medium text-(--md-sys-color-on-surface) mb-4">
            {t('admin.userInformation')}
          </h3>
          <List>
            <ListItem>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">{t('form.name')}</span>
                <span className="text-sm text-(--md-sys-color-on-surface)">
                  {session?.user?.name || `${session?.user?.given_name} ${session?.user?.family_name}`}
                </span>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">{t('form.email')}</span>
                <span className="text-sm text-(--md-sys-color-on-surface)">{session?.user?.email}</span>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">{t('admin.username')}</span>
                <span className="text-sm text-(--md-sys-color-on-surface)">{session?.user?.preferred_username}</span>
              </div>
            </ListItem>
            <ListItem>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">{t('admin.roles')}</span>
                <div className="flex flex-wrap gap-2">
                  {getUserRoles(session).map((role) => (
                    <Chip
                      key={role}
                      variant="assist"
                      color="secondary"
                      label={role}
                      selected
                    />
                  ))}
                </div>
              </div>
            </ListItem>
          </List>
        </Card>
      )}

      {/* Stats Cards */}
      {isError && !isLoading ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="mb-2">
            <span className="mdi text-4xl text-(--md-sys-color-error)">error</span>
          </div>
          <div className="text-(--md-sys-color-error) mb-4">{getErrorMessage()}</div>
          {failureCount > 0 && (
            <div className="text-sm text-(--md-sys-color-on-surface-variant) mb-4">
              Failed after {failureCount} attempt{failureCount > 1 ? 's' : ''}
            </div>
          )}
          <div className="flex justify-center gap-2">
            <Button 
              variant="filled"
              onClick={retryFetch}
              disabled={isRefetching}
              label={isRefetching ? "Retrying..." : "Retry"}
              icon="refresh"
            />
            <Button 
              variant="outlined"
              onClick={forceRefresh}
              disabled={isRefetching}
              label="Force Refresh"
              icon="refresh"
            />
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="👥"
              title={t('stats.totalUsers')}
              value={stats.totalUsers}
              bgColor="bg-(--md-sys-color-primary-container)"
              textColor="text-(--md-sys-color-on-primary-container)"
            />
            
            <StatCard
              icon="📦"
              title={t('stats.totalProducts')}
              value={stats.totalProducts}
              bgColor="bg-(--md-sys-color-secondary-container)"
              textColor="text-(--md-sys-color-on-secondary-container)"
            />
            
            <StatCard
              icon="🛒"
              title={t('stats.totalOrders')}
              value={stats.totalOrders}
              bgColor="bg-(--md-sys-color-tertiary-container)"
              textColor="text-(--md-sys-color-on-tertiary-container)"
            />
            
            <StatCard
              icon="💰"
              title={t('stats.totalRevenue')}
              value={formatVND(stats.totalRevenue)}
              bgColor="bg-(--md-sys-color-error-container)"
              textColor="text-(--md-sys-color-on-error-container)"
            />
          </div>

          {/* Stock Management Metrics */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">{t('sections.stockManagement')}</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon="🏪"
                title={t('stats.totalStockValue')}
                value={formatVND(stats.totalStockValue)}
                bgColor="bg-(--md-sys-color-primary-container)"
                textColor="text-(--md-sys-color-on-primary-container)"
              />
              
              <StatCard
                icon="⚠️"
                title={t('stats.lowStockAlerts')}
                value={stats.lowStockAlerts}
                bgColor="bg-(--md-sys-color-tertiary-container)"
                textColor="text-(--md-sys-color-on-tertiary-container)"
              />
              
              <StatCard
                icon="❌"
                title={t('stats.outOfStockItems')}
                value={stats.outOfStockItems}
                bgColor="bg-(--md-sys-color-error-container)"
                textColor="text-(--md-sys-color-on-error-container)"
              />
            </div>
          </div>

          {/* Payment Management Metrics */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">{t('sections.paymentManagement')}</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon="⏳"
                title={t('stats.pendingPayments')}
                value={stats.pendingPayments}
                bgColor="bg-(--md-sys-color-tertiary-container)"
                textColor="text-(--md-sys-color-on-tertiary-container)"
              />
              
              <StatCard
                icon="✅"
                title={t('stats.completedPayments')}
                value={stats.completedPayments}
                bgColor="bg-(--md-sys-color-primary-container)"
                textColor="text-(--md-sys-color-on-primary-container)"
              />
              
              <StatCard
                icon="🔄"
                title={t('stats.refundedPayments')}
                value={stats.refundedPayments}
                bgColor="bg-(--md-sys-color-secondary-container)"
                textColor="text-(--md-sys-color-on-secondary-container)"
              />
              
              <StatCard
                icon="💸"
                title={t('stats.paymentVolume')}
                value={formatVND(stats.totalPaymentVolume)}
                bgColor="bg-(--md-sys-color-error-container)"
                textColor="text-(--md-sys-color-on-error-container)"
              />
            </div>
          </div>
        </>
      )}

      {/* Token Debugger in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6">
          <TokenDebugger />
        </div>
      )}
    </div>
  );
}
