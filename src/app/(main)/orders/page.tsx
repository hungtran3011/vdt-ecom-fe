'use client';

import React, { useState, useMemo } from 'react';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Button from '@/components/Button';
import OrderActions from '@/components/OrderActions';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Order, OrderStatus, OrderStatusLabels, PaymentMethodLabels } from '@/types/Order';
import { useUserOrders, useReorderOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { VI_TRANSLATIONS } from '@/utils/localization';
import { formatOrderDate, getRelativeTime, isToday } from '@/utils/timezone';
import { orderService } from '@/services/orderService';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useExportOrders } from '@/hooks/useOrders';

/**
 * Orders page for user to view their order history
 * Responsive design with Material Design v3 components
 */
export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showSearchTips, setShowSearchTips] = useState(false);
  
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError,
    error,
    refetch
  } = useUserOrders();
  
  const reorderMutation = useReorderOrder();
  const exportMutation = useExportOrders();
  const { showSnackbar } = useSnackbar();

  const isLoading = authLoading || ordersLoading;

  // Order action handlers
  const handleReorder = async (order: Order) => {
    try {
      console.log('Reordering:', order.id);
      const newOrder = await reorderMutation.mutateAsync(order.id);
      console.log('Reorder created successfully:', newOrder);
      
      showSnackbar('Đơn hàng đã được tạo lại thành công!', 'success');
      
      // Redirect to checkout page with the new order
      router.push(`/checkout?reorderId=${newOrder.id}`);
    } catch (error) {
      console.error('Error reordering:', error);
      showSnackbar('Không thể tạo lại đơn hàng. Vui lòng thử lại.', 'error');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      console.log('Cancelling order:', orderId);
      await orderService.cancelOrder(orderId);
      // Refetch orders to show updated status
      await refetch();
    } catch (error) {
      console.error('Error cancelling order:', error);
      // TODO: Show error message to user
    }
  };

  const handleTrackOrder = (orderId: string) => {
    console.log('Tracking order:', orderId);
    // Redirect to order details page which will show tracking info
    router.push(`/orders/${orderId}`);
  };

  const handleExportOrders = async () => {
    try {
      const exportFilters: { status?: string; startDate?: string; endDate?: string } = {};
      
      // Apply current filters to export
      if (activeTab !== 'all') {
        exportFilters.status = activeTab.toUpperCase();
      }
      
      // Apply date range filter
      if (selectedDateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (selectedDateRange) {
          case 'today':
            exportFilters.startDate = today.toISOString();
            exportFilters.endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            exportFilters.startDate = weekAgo.toISOString();
            exportFilters.endDate = new Date().toISOString();
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            exportFilters.startDate = monthAgo.toISOString();
            exportFilters.endDate = new Date().toISOString();
            break;
        }
      }

      await exportMutation.mutateAsync(exportFilters);
      showSnackbar('Đơn hàng đã được xuất thành công!', 'success');
    } catch (error) {
      console.error('Error exporting orders:', error);
      showSnackbar('Không thể xuất dữ liệu đơn hàng', 'error');
    }
  };

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Enhanced filtering and sorting logic
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => {
        switch (activeTab) {
          case 'pending':
            return [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED].includes(order.status);
          case 'processing':
            return [OrderStatus.PROCESSING, OrderStatus.SHIPPED].includes(order.status);
          case 'completed':
            return order.status === OrderStatus.DELIVERED;
          case 'cancelled':
            return [OrderStatus.CANCELLED, OrderStatus.PAYMENT_FAILED].includes(order.status);
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(query)
        ) ||
        order.address.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query) ||
        order.userEmail?.toLowerCase().includes(query) ||
        order.note?.toLowerCase().includes(query) ||
        // Search by order status in Vietnamese
        OrderStatusLabels[order.status]?.toLowerCase().includes(query) ||
        // Search by payment method in Vietnamese
        PaymentMethodLabels[order.paymentMethod]?.toLowerCase().includes(query) ||
        // Search by total amount (convert to string for partial matching)
        order.totalPrice.toString().includes(query.replace(/[^\d]/g, ''))
      );
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (selectedDateRange) {
          case 'today':
            return isToday(orderDate);
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort orders
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.totalPrice - b.totalPrice;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [orders, activeTab, searchQuery, selectedDateRange, sortBy, sortOrder]);

  const formatDate = (date: Date) => {
    return formatOrderDate(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Handle loading state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--md-sys-color-on-surface)]">
          {VI_TRANSLATIONS.orders.myOrders}
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-[var(--md-sys-color-surface-variant)] rounded"></div>
          <div className="h-32 bg-[var(--md-sys-color-surface-variant)] rounded"></div>
          <div className="h-32 bg-[var(--md-sys-color-surface-variant)] rounded"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--md-sys-color-on-surface)]">
          {VI_TRANSLATIONS.orders.myOrders}
        </h1>
        
        {/* Tab Navigation Skeleton */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 w-24 bg-[var(--md-sys-color-surface-variant)] rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
        
        {/* Orders Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} variant="filled" className="p-6 animate-pulse">
              <div className="h-4 bg-[var(--md-sys-color-surface-variant)] rounded mb-4 w-1/3" />
              <div className="space-y-2">
                <div className="h-3 bg-[var(--md-sys-color-surface-variant)] rounded w-full" />
                <div className="h-3 bg-[var(--md-sys-color-surface-variant)] rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header with Search and Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">{VI_TRANSLATIONS.orders.myOrders}</h1>
          
          <div className="flex gap-2">
            <Button
              variant="outlined"
              label="Filters"
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm px-4 py-2"
              icon="tune"
              hasIcon
            />
            <Button
              variant="outlined"
              label="Export CSV"
              onClick={handleExportOrders}
              disabled={isLoading || exportMutation.isPending}
              className="text-sm px-4 py-2"
              icon="download"
              hasIcon
            />
            <Button
              variant="tonal"
              label={VI_TRANSLATIONS.actions.refresh}
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-sm px-4 py-2"
              icon="refresh"
              hasIcon
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng, sản phẩm, địa chỉ, SĐT, email, ghi chú, trạng thái..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchTips(true)}
            onBlur={() => setTimeout(() => setShowSearchTips(false), 200)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
          />
          <span className="mdi mdi-magnify absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]"></span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
            >
              <span className="mdi mdi-close"></span>
            </button>
          )}
          
          {/* Search Tips Dropdown */}
          {showSearchTips && !searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] rounded-lg shadow-lg z-10 p-4">
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-2 font-medium">
                💡 Mẹo tìm kiếm:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-identifier text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Mã đơn hàng (vd: ORD123)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-shopping text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Tên sản phẩm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-map-marker text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Địa chỉ giao hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-phone text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Số điện thoại</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-email text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Email khách hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-information text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Trạng thái (vd: đã giao)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-cash text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Số tiền (vd: 50000)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mdi mdi-note-text text-[var(--md-sys-color-primary)]"></span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Ghi chú đơn hàng</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card variant="outlined" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
                  Thời gian
                </label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value as 'all' | 'today' | 'week' | 'month')}
                  className="w-full px-3 py-2 rounded border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
                >
                  <option value="all">Tất cả</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                  className="w-full px-3 py-2 rounded border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
                >
                  <option value="date">Ngày đặt</option>
                  <option value="amount">Số tiền</option>
                  <option value="status">Trạng thái</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
                  Thứ tự
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 rounded border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
                >
                  <option value="desc">Mới nhất</option>
                  <option value="asc">Cũ nhất</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Tìm thấy {filteredAndSortedOrders.length} đơn hàng
              </div>
              <Button
                variant="text"
                label="Xóa bộ lọc"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDateRange('all');
                  setSortBy('date');
                  setSortOrder('desc');
                }}
                className="text-sm"
              />
            </div>
          </Card>
        )}
      </div>

      {/* Search Results Summary */}
      {(searchQuery || selectedDateRange !== 'all' || activeTab !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-lowest)] rounded-lg p-3 mb-4">
          <span className="mdi mdi-filter-variant mr-1"></span>
          <span>
            Hiển thị <span className="font-semibold text-[var(--md-sys-color-primary)]">{filteredAndSortedOrders.length}</span> đơn hàng
            {searchQuery && <span> phù hợp với tìm kiếm &ldquo;{searchQuery}&rdquo;</span>}
            {activeTab !== 'all' && (
              <span> trong mục &ldquo;{
                activeTab === 'pending' ? 'Đang xử lý' :
                activeTab === 'processing' ? 'Đang giao' :
                activeTab === 'completed' ? 'Hoàn thành' :
                activeTab === 'cancelled' ? 'Đã hủy' : activeTab
              }&rdquo;</span>
            )}
            {selectedDateRange !== 'all' && (
              <span> trong khoảng thời gian &ldquo;{
                selectedDateRange === 'today' ? 'hôm nay' :
                selectedDateRange === 'week' ? '7 ngày qua' :
                selectedDateRange === 'month' ? '30 ngày qua' : selectedDateRange
              }&rdquo;</span>
            )}
          </span>
          <Button
            variant="text"
            label="Xóa bộ lọc"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setSelectedDateRange('all');
              setSortBy('date');
              setSortOrder('desc');
            }}
            className="text-xs ml-auto"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="overflow-x-auto mb-6">
        <div className="flex space-x-2 min-w-max">
          {[
            { id: 'all', label: VI_TRANSLATIONS.orders.all },
            { id: 'pending', label: VI_TRANSLATIONS.orders.pending },
            { id: 'processing', label: VI_TRANSLATIONS.orders.processing },
            { id: 'completed', label: VI_TRANSLATIONS.orders.completed },
            { id: 'cancelled', label: VI_TRANSLATIONS.orders.cancelled }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'filled' : 'text'}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-2 px-4 text-sm",
                activeTab === tab.id
                  ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                  : "text-[var(--md-sys-color-on-surface)]"
              )}
            />
          ))}
        </div>
      </div>
      
      {isError ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="text-[var(--md-sys-color-error)] mb-4">
            {error instanceof Error ? error.message : VI_TRANSLATIONS.orders.failedToLoadOrders}
          </div>
          <Button 
            variant="filled"
            onClick={() => refetch()}
            label={VI_TRANSLATIONS.actions.retry}
          />
        </Card>
      ) : filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-16 bg-[var(--md-sys-color-surface-container)] rounded-lg">
          <span className="mdi text-6xl block mb-4 text-[var(--md-sys-color-on-surface-variant)]">
            receipt_long
          </span>
          <p className="text-lg text-[var(--md-sys-color-on-surface)]">{VI_TRANSLATIONS.orders.noOrdersFound}</p>
          <p className="text-sm mt-2 text-[var(--md-sys-color-on-surface-variant)] mb-6">
            {searchQuery ? 'Không tìm thấy đơn hàng nào phù hợp với tìm kiếm' : 
             activeTab === 'all' 
              ? VI_TRANSLATIONS.orders.noOrdersAvailable
              : 'Không tìm thấy đơn hàng nào trong mục này'}
          </p>
          
          <div className="flex gap-2 justify-center">
            {searchQuery && (
              <Button
                variant="outlined"
                label="Xóa tìm kiếm"
                onClick={() => setSearchQuery('')}
                icon="close"
                hasIcon
              />
            )}
            <Button
              variant="filled"
              label="Mua sắm ngay"
              onClick={() => router.push('/')}
              icon="shopping_bag"
              hasIcon
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <Card
              key={order.id}
              variant="elevated"
              className="overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)]">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Đơn hàng #{order.id}
                  </div>
                  <OrderStatusBadge 
                    status={order.status} 
                    showIcon={true}
                    className="text-xs"
                  />
                </div>
                <div className="text-sm mt-1 text-[var(--md-sys-color-on-surface-variant)]">
                  Ngày đặt: {formatDate(order.createdAt)} • {getRelativeTime(order.createdAt)}
                </div>
              </div>
              
              <List className="max-h-64 overflow-y-auto">
                {order.items.map((item) => (
                  <ListItem
                    key={item.id}
                    className="py-2"
                    leading={
                      <div className="h-12 w-12 rounded bg-[var(--md-sys-color-surface-container)] flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="mdi text-lg text-[var(--md-sys-color-on-surface-variant)]">image_not_supported</span>
                        )}
                      </div>
                    }
                    trailing={
                      <div className="text-right">
                        <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          x{item.quantity}
                        </div>
                      </div>
                    }
                  >
                    <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                      {item.productName}
                    </div>
                  </ListItem>
                ))}
              </List>
              
              <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)] flex justify-between items-center">
                <div>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Tổng tiền:</div>
                  <div className="text-base font-medium text-[var(--md-sys-color-primary)]">
                    {formatCurrency(order.totalPrice)}
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <Button
                    variant="text"
                    label={VI_TRANSLATIONS.actions.viewDetails}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="text-xs"
                  />
                  <OrderActions
                    order={order}
                    onReorder={handleReorder}
                    onCancelOrder={handleCancelOrder}
                    onTrackOrder={handleTrackOrder}
                    compact={true}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
