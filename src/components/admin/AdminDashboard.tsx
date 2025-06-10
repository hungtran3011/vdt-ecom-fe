'use client';

import { useState } from 'react';
import { 
  useSystemStats, 
  useOrderStats, 
  useProductStats, 
  useStockStats, 
  useUserActivityStats, 
  usePaymentStats,
  useCartStats,
  usePerformanceStats
} from '@/hooks/useAdmin';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { formatVietnameseCurrency, formatVietnameseDateTime, formatVietnameseNumber } from '@/utils/format';
import { t } from '@/utils/localization';

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'performance'>('overview');
  
  const { data: systemStats, isLoading: systemLoading, refetch: refetchSystem } = useSystemStats();
  const { data: orderStats, isLoading: orderLoading } = useOrderStats();
  const { data: productStats, isLoading: productLoading } = useProductStats();
  const { data: stockStats, isLoading: stockLoading } = useStockStats();
  const { data: userStats, isLoading: userLoading } = useUserActivityStats();
  const { data: paymentStats, isLoading: paymentLoading } = usePaymentStats();
  const { data: cartStats, isLoading: cartLoading } = useCartStats();
  const { data: performanceStats, isLoading: performanceLoading } = usePerformanceStats();

  const isLoading = systemLoading || orderLoading || productLoading || stockLoading || 
                   userLoading || paymentLoading || cartLoading || performanceLoading;

  const getSystemStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-(--md-sys-color-on-surface-variant)';
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    trend, 
    trendValue,
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }) => (
    <Card variant="elevated" className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              color === 'primary' ? 'bg-(--md-sys-color-primary-container)' :
              color === 'secondary' ? 'bg-(--md-sys-color-secondary-container)' :
              color === 'success' ? 'bg-green-100' :
              color === 'warning' ? 'bg-yellow-100' :
              color === 'error' ? 'bg-red-100' : 'bg-(--md-sys-color-surface-container)'
            }`}>
              <span className={`mdi text-xl ${
                color === 'primary' ? 'text-(--md-sys-color-on-primary-container)' :
                color === 'secondary' ? 'text-(--md-sys-color-on-secondary-container)' :
                color === 'success' ? 'text-green-700' :
                color === 'warning' ? 'text-yellow-700' :
                color === 'error' ? 'text-red-700' : 'text-(--md-sys-color-on-surface)'
              }`}>
                {icon}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-(--md-sys-color-on-surface-variant) mb-1">
                {title}
              </h3>
              <div className="text-2xl font-bold text-(--md-sys-color-on-surface)">
                {typeof value === 'number' ? formatVietnameseNumber(value) : value}
              </div>
            </div>
          </div>
          
          {subtitle && (
            <p className="text-sm text-(--md-sys-color-on-surface-variant) mb-2">
              {subtitle}
            </p>
          )}
          
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              <span className={`mdi text-sm ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-(--md-sys-color-on-surface-variant)'
              }`}>
                {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
              </span>
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-(--md-sys-color-on-surface-variant)'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Status */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface)">
            {t('admin.dashboard.systemStatus')}
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              systemStats?.systemStatus === 'HEALTHY' ? 'bg-green-500' : 
              systemStats?.systemStatus === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className={getSystemStatusColor(systemStats?.systemStatus || '')}>
              {systemStats?.systemStatus || t('common.unknown')}
            </span>
          </div>
        </div>
        
        {systemStats?.generatedAt && (
          <p className="text-sm text-(--md-sys-color-on-surface-variant)">
            {t('admin.dashboard.lastUpdated')}: {formatVietnameseDateTime(new Date(systemStats.generatedAt))}
          </p>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.totalProducts')}
          value={productStats?.totalProducts || 0}
          subtitle={`${t('admin.dashboard.activeProducts')}: ${formatVietnameseNumber(productStats?.activeProducts || 0)}`}
          icon="inventory_2"
          color="primary"
          trend={productStats?.productsAddedToday ? 'up' : 'neutral'}
          trendValue={productStats?.productsAddedToday ? `+${productStats.productsAddedToday} ${t('common.today')}` : undefined}
        />
        
        <StatCard
          title={t('admin.dashboard.totalOrders')}
          value={orderStats?.totalOrders || 0}
          subtitle={`${t('admin.dashboard.pendingOrders')}: ${formatVietnameseNumber(orderStats?.pendingOrders || 0)}`}
          icon="shopping_bag"
          color="secondary"
          trend={orderStats?.ordersToday ? 'up' : 'neutral'}
          trendValue={orderStats?.ordersToday ? `+${orderStats.ordersToday} ${t('common.today')}` : undefined}
        />
        
        <StatCard
          title={t('admin.dashboard.totalRevenue')}
          value={formatVietnameseCurrency(orderStats?.totalRevenue || 0)}
          subtitle={`${t('admin.dashboard.averageOrderValue')}: ${formatVietnameseCurrency(orderStats?.averageOrderValue || 0)}`}
          icon="payments"
          color="success"
          trend={orderStats?.revenueToday ? 'up' : 'neutral'}
          trendValue={orderStats?.revenueToday ? formatVietnameseCurrency(orderStats.revenueToday) : undefined}
        />
        
        <StatCard
          title={t('admin.dashboard.totalUsers')}
          value={userStats?.totalUsers || 0}
          subtitle={`${t('admin.dashboard.activeUsers')}: ${formatVietnameseNumber(userStats?.activeUsers || 0)}`}
          icon="people"
          color="primary"
          trend={userStats?.newUsersToday ? 'up' : 'neutral'}
          trendValue={userStats?.newUsersToday ? `+${userStats.newUsersToday} ${t('common.today')}` : undefined}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.dashboard.stockValue')}
          value={formatVietnameseCurrency(stockStats?.totalStockValue || 0)}
          subtitle={`${t('admin.dashboard.stockItems')}: ${formatVietnameseNumber(stockStats?.totalStockItems || 0)}`}
          icon="warehouse"
          color="secondary"
        />
        
        <StatCard
          title={t('admin.dashboard.lowStockItems')}
          value={stockStats?.lowStockItems || 0}
          subtitle={`${t('admin.dashboard.criticalAlerts')}: ${formatVietnameseNumber(stockStats?.criticalStockAlerts || 0)}`}
          icon="warning"
          color={stockStats?.lowStockItems ? 'warning' : 'success'}
        />
        
        <StatCard
          title={t('admin.dashboard.paymentSuccess')}
          value={`${paymentStats?.successRate?.toFixed(1) || 0}%`}
          subtitle={`${t('admin.dashboard.totalPayments')}: ${formatVietnameseNumber(paymentStats?.totalPayments || 0)}`}
          icon="check_circle"
          color="success"
        />
      </div>

      {/* Cart & Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title={t('admin.dashboard.activeCarts')}
          value={cartStats?.activeCarts || 0}
          subtitle={`${t('admin.dashboard.abandonmentRate')}: ${cartStats?.cartAbandonmentRate?.toFixed(1) || 0}%`}
          icon="shopping_cart"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.conversionRate')}
          value={`${cartStats?.conversionRate?.toFixed(1) || 0}%`}
          subtitle={`${t('admin.dashboard.averageCartValue')}: ${formatVietnameseCurrency(cartStats?.averageCartValue || 0)}`}
          icon="trending_up"
          color="success"
        />
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.totalProducts')}
          value={productStats?.totalProducts || 0}
          icon="inventory_2"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.activeProducts')}
          value={productStats?.activeProducts || 0}
          icon="check_circle"
          color="success"
        />
        
        <StatCard
          title={t('admin.dashboard.categories')}
          value={productStats?.totalCategories || 0}
          icon="category"
          color="secondary"
        />
        
        <StatCard
          title={t('admin.dashboard.averagePrice')}
          value={formatVietnameseCurrency(productStats?.averageProductPrice || 0)}
          icon="attach_money"
          color="primary"
        />
      </div>

      {/* Product Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.dashboard.addedToday')}
          value={productStats?.productsAddedToday || 0}
          icon="today"
          color="success"
        />
        
        <StatCard
          title={t('admin.dashboard.addedThisWeek')}
          value={productStats?.productsAddedThisWeek || 0}
          icon="date_range"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.addedThisMonth')}
          value={productStats?.productsAddedThisMonth || 0}
          icon="calendar_month"
          color="secondary"
        />
      </div>

      {/* Top Selling Products */}
      {productStats?.topSellingProducts && productStats.topSellingProducts.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
            {t('admin.dashboard.topSellingProducts')}
          </h3>
          <div className="space-y-3">
            {productStats.topSellingProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-(--md-sys-color-surface-container) rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-(--md-sys-color-primary-container) flex items-center justify-center">
                    <span className="text-sm font-bold text-(--md-sys-color-on-primary-container)">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-(--md-sys-color-on-surface)">{product.productName}</p>
                    <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                      {t('admin.dashboard.soldCount')}: {formatVietnameseNumber(product.totalSold)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-(--md-sys-color-primary)">
                    {formatVietnameseCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* Order Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.totalOrders')}
          value={orderStats?.totalOrders || 0}
          icon="shopping_bag"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.pendingOrders')}
          value={orderStats?.pendingOrders || 0}
          icon="schedule"
          color="warning"
        />
        
        <StatCard
          title={t('admin.dashboard.completedOrders')}
          value={orderStats?.completedOrders || 0}
          icon="check_circle"
          color="success"
        />
        
        <StatCard
          title={t('admin.dashboard.cancelledOrders')}
          value={orderStats?.cancelledOrders || 0}
          icon="cancel"
          color="error"
        />
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.dashboard.totalRevenue')}
          value={formatVietnameseCurrency(orderStats?.totalRevenue || 0)}
          icon="payments"
          color="success"
        />
        
        <StatCard
          title={t('admin.dashboard.averageOrderValue')}
          value={formatVietnameseCurrency(orderStats?.averageOrderValue || 0)}
          icon="trending_up"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.revenueToday')}
          value={formatVietnameseCurrency(orderStats?.revenueToday || 0)}
          icon="today"
          color="secondary"
        />
      </div>

      {/* Time-based Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.dashboard.ordersToday')}
          value={orderStats?.ordersToday || 0}
          icon="today"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.ordersThisWeek')}
          value={orderStats?.ordersThisWeek || 0}
          icon="date_range"
          color="secondary"
        />
        
        <StatCard
          title={t('admin.dashboard.ordersThisMonth')}
          value={orderStats?.ordersThisMonth || 0}
          icon="calendar_month"
          color="success"
        />
      </div>

      {/* Top Customers */}
      {orderStats?.topCustomers && orderStats.topCustomers.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
            {t('admin.dashboard.topCustomers')}
          </h3>
          <div className="space-y-3">
            {orderStats.topCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer.userId} className="flex items-center justify-between p-3 bg-(--md-sys-color-surface-container) rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-(--md-sys-color-primary-container) flex items-center justify-center">
                    <span className="text-sm font-bold text-(--md-sys-color-on-primary-container)">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-(--md-sys-color-on-surface)">{customer.userName}</p>
                    <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                      {t('admin.dashboard.orderCount')}: {formatVietnameseNumber(customer.totalOrders)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-(--md-sys-color-primary)">
                    {formatVietnameseCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.totalUsers')}
          value={userStats?.totalUsers || 0}
          icon="people"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.activeUsers')}
          value={userStats?.activeUsers || 0}
          icon="person"
          color="success"
        />
        
        <StatCard
          title={t('admin.dashboard.newUsersToday')}
          value={userStats?.newUsersToday || 0}
          icon="person_add"
          color="secondary"
        />
        
        <StatCard
          title={t('admin.dashboard.profileCompletion')}
          value={`${userStats?.profileCompletionRate?.toFixed(1) || 0}%`}
          icon="account_circle"
          color="primary"
        />
      </div>

      {/* User Growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.dashboard.newUsersWeek')}
          value={userStats?.newUsersThisWeek || 0}
          icon="date_range"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.newUsersMonth')}
          value={userStats?.newUsersThisMonth || 0}
          icon="calendar_month"
          color="secondary"
        />
        
        <StatCard
          title={t('admin.dashboard.averageOrdersPerUser')}
          value={userStats?.averageOrdersPerUser?.toFixed(1) || 0}
          icon="shopping_cart"
          color="success"
        />
      </div>

      {/* User Roles Distribution */}
      {userStats?.usersByRole && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
            {t('admin.dashboard.usersByRole')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(userStats.usersByRole).map(([role, count]) => (
              <div key={role} className="p-4 bg-(--md-sys-color-surface-container) rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-(--md-sys-color-on-surface)">
                    {role.replace('ROLE_', '')}
                  </span>
                  <span className="text-lg font-bold text-(--md-sys-color-primary)">
                    {formatVietnameseNumber(count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* System Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.systemUptime')}
          value={performanceStats?.systemUptime || '0%'}
          icon="monitor"
          color="success"
        />
        
        <StatCard
          title={t('admin.dashboard.avgResponseTime')}
          value={`${performanceStats?.averageResponseTime || 0}ms`}
          icon="speed"
          color="primary"
        />
        
        <StatCard
          title={t('admin.dashboard.totalApiCalls')}
          value={formatVietnameseNumber(performanceStats?.totalApiCalls || 0)}
          icon="api"
          color="secondary"
        />
        
        <StatCard
          title={t('admin.dashboard.errorRate')}
          value={`${performanceStats?.errorRate?.toFixed(2) || 0}%`}
          icon="error"
          color={performanceStats?.errorRate && performanceStats.errorRate > 5 ? 'error' : 'success'}
        />
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.dashboard.memoryUsage')}
          value={`${performanceStats?.memoryUsage?.toFixed(1) || 0}%`}
          icon="memory"
          color={performanceStats?.memoryUsage && performanceStats.memoryUsage > 80 ? 'warning' : 'primary'}
        />
        
        <StatCard
          title={t('admin.dashboard.cpuUsage')}
          value={`${performanceStats?.cpuUsage?.toFixed(1) || 0}%`}
          icon="developer_board"
          color={performanceStats?.cpuUsage && performanceStats.cpuUsage > 80 ? 'warning' : 'primary'}
        />
        
        <StatCard
          title={t('admin.dashboard.diskUsage')}
          value={`${performanceStats?.diskUsage?.toFixed(1) || 0}%`}
          icon="storage"
          color={performanceStats?.diskUsage && performanceStats.diskUsage > 85 ? 'error' : 'primary'}
        />
      </div>

      {/* Network & Database */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title={t('admin.dashboard.networkLatency')}
          value={`${performanceStats?.networkLatency || 0}ms`}
          icon="network_check"
          color="secondary"
        />
        
        <StatCard
          title={t('admin.dashboard.dbConnections')}
          value={performanceStats?.databaseConnections || 0}
          icon="storage"
          color="primary"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-(--md-sys-color-on-surface-variant)">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-(--md-sys-color-on-surface)">
          {t('admin.dashboard.title')}
        </h1>
        
        <div className="flex gap-2">
          <Button onClick={() => refetchSystem()} variant="outlined">
            <span className="mdi mr-2">refresh</span>
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card variant="elevated" className="p-1 mb-6">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'overview', label: t('admin.dashboard.overview'), icon: 'dashboard' },
            { key: 'products', label: t('admin.dashboard.products'), icon: 'inventory_2' },
            { key: 'orders', label: t('admin.dashboard.orders'), icon: 'shopping_bag' },
            { key: 'users', label: t('admin.dashboard.users'), icon: 'people' },
            { key: 'performance', label: t('admin.dashboard.performance'), icon: 'speed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedTab === tab.key
                  ? 'bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container)'
                  : 'hover:bg-(--md-sys-color-surface-container-highest) text-(--md-sys-color-on-surface)'
              }`}
            >
              <span className="mdi text-sm">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'products' && renderProductsTab()}
      {selectedTab === 'orders' && renderOrdersTab()}
      {selectedTab === 'users' && renderUsersTab()}
      {selectedTab === 'performance' && renderPerformanceTab()}
    </div>
  );
}
