'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Select from '@/components/Select';
import Snackbar from '@/components/Snackbar';
import Pagination from '@/components/Pagination';
import { Order, OrderStatus, OrderStatusLabels, PaymentMethod, PaymentMethodLabels, PaymentStatus } from '@/types/Order';
import { useOrders, useUpdateOrderStatus, useExportOrders, useOrderStatistics } from '@/hooks/useOrders';
import { useSnackbar } from '@/hooks/useSnackbar';
import { usePagination } from '@/hooks/usePagination';
import { formatVND } from '@/utils/currency';
import { t } from '@/utils/localization';

interface OrdersManagementProps {
  title?: string;
  className?: string;
  onOrderSelect?: (order: Order) => void;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  showActions?: boolean;
  showFilters?: boolean;
  showAnalytics?: boolean;
  fallbackOrders?: Order[];
}

interface OrderFilters {
  status: OrderStatus | '';
  paymentMethod: PaymentMethod | '';
  paymentStatus: PaymentStatus | '';
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

function OrderDetailModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  
  if (!isOpen || !order) return null;

  const handleStatusUpdate = () => {
    if (selectedStatus !== '' && selectedStatus !== order.status) {
      onStatusUpdate(order.id, selectedStatus);
      onClose();
    }
  };

  const canUpdateStatus = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.PAYMENT_FAILED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING_PAYMENT]
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const getStatusOptions = () => {
    return Object.entries(OrderStatusLabels)
      .filter(([value]) => canUpdateStatus(order.status, value as unknown as OrderStatus))
      .map(([value, label]) => ({ value, label }));
  };

  const getStatusColor = (status: OrderStatus): 'error' | 'tertiary' | 'secondary' | 'primary' => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'primary';
      case OrderStatus.SHIPPED:
      case OrderStatus.PROCESSING: return 'secondary';
      case OrderStatus.CONFIRMED:
      case OrderStatus.PAID: return 'tertiary';
      case OrderStatus.CANCELLED:
      case OrderStatus.PAYMENT_FAILED: return 'error';
      default: return 'tertiary';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold">{t('orders.details')}</h3>
              <p className="text-(--md-sys-color-on-surface-variant)">{t('orders.orderId')}: {order.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Chip
                variant="assist"
                color={getStatusColor(order.status)}
                label={OrderStatusLabels[order.status]}
                selected
              />
              <Button
                variant="text"
                hasIcon
                icon="close"
                label={t('actions.close')}
                onClick={onClose}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">{t('orders.orderInformation')}</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-(--md-sys-color-on-surface-variant)">{t('orders.created')}:</span>
                    <span className="ml-2 text-(--md-sys-color-on-surface)">{formatDate(order.createdAt)}</span>
                  </p>
                  <p>
                    <span className="text-(--md-sys-color-on-surface-variant)">{t('orders.updated')}:</span>
                    <span className="ml-2 text-(--md-sys-color-on-surface)">{formatDate(order.updatedAt)}</span>
                  </p>
                  <p>
                    <span className="text-(--md-sys-color-on-surface-variant)">{t('orders.total')}:</span>
                    <span className="ml-2 font-medium text-(--md-sys-color-on-surface)">{formatCurrency(order.totalPrice)}</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('orders.customerInformation')}</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-(--md-sys-color-on-surface-variant)">{t('orders.name')}:</span>
                    <span className="ml-2">{order.userId}</span>
                  </p>
                  <p>
                    <span className="text-(--md-sys-color-on-surface-variant)">{t('orders.payment')}:</span>
                    <span className="ml-2">{PaymentMethodLabels[order.paymentMethod]}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-2">{t('orders.orderItems')}</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-(--md-sys-color-surface-container-lowest) rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                        {t('orders.quantity')}: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-medium text-(--md-sys-color-on-surface)">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update */}
            {getStatusOptions().length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t('orders.updateStatus')}</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select
                      label={t('orders.newStatus')}
                      value={selectedStatus.toString()}
                      onChange={(value) => setSelectedStatus(value as unknown as OrderStatus)}
                      options={[
                        { value: '', label: t('orders.selectNewStatus') },
                        ...getStatusOptions()
                      ]}
                    />
                  </div>
                  <Button
                    variant="filled"
                    label={t('actions.update')}
                    onClick={handleStatusUpdate}
                    disabled={selectedStatus === '' || selectedStatus === order.status}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function OrdersManagement({ 
  title = t('admin.ordersManagement'),
  className = "",
  onOrderSelect,
  onStatusUpdate,
  showActions = true,
  showFilters = true,
  showAnalytics = false,
  fallbackOrders = []
}: OrdersManagementProps) {
  // Default fallback orders for testing
  const defaultFallbackOrders: Order[] = [
    {
      id: 'order-1',
      userId: 'John Doe',
      address: '123 Main St, City, Country',
      phone: '+1234567890',
      note: 'Test order note',
      paymentId: 'payment-1',
      items: [
        {
          id: 1,
          orderId: 'order-1',
          productId: 1,
          productName: 'Test Product 1',
          productImage: '/dummy/1.png',
          quantity: 2,
          price: 25.99,
          totalPrice: 51.98
        }
      ],
      totalPrice: 51.98,
      status: OrderStatus.PENDING_PAYMENT,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'order-2',
      userId: 'Jane Smith',
      address: '456 Oak Ave, Town, Country',
      phone: '+0987654321',
      note: 'Second test order',
      paymentId: 'payment-2',
      items: [
        {
          id: 2,
          orderId: 'order-2',
          productId: 2,
          productName: 'Test Product 2',
          productImage: '/dummy/2.png',
          quantity: 1,
          price: 49.99,
          totalPrice: 49.99
        }
      ],
      totalPrice: 49.99,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.SUCCESSFUL,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000)
    }
  ];

  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    paymentMethod: '',
    paymentStatus: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Pagination state
  const pagination = usePagination();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Snackbar for notifications
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // TanStack Query hooks
  const { 
    data: ordersData, 
    isError, 
    refetch 
  } = useOrders({
    page: pagination.paginationParams.page,
    size: pagination.paginationParams.size,
    cursor: pagination.paginationParams.cursor,
    status: filters.status ? filters.status.toString() : undefined,  
    search: filters.search || undefined,
    startDate: filters.dateFrom || undefined,
    endDate: filters.dateTo || undefined
  });

  const { data: statistics } = useOrderStatistics();

  const updateOrderStatus = useUpdateOrderStatus();
  const exportOrders = useExportOrders();

  // Use fallback data if API fails or for testing
  const orders = ordersData?.data || fallbackOrders || defaultFallbackOrders;

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    onOrderSelect?.(order);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      showSnackbar('Order status updated successfully', 'success');
      onStatusUpdate?.(orderId, newStatus);
    } catch (error) {
      showSnackbar('Failed to update order status', 'error');
      console.error('Status update error:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      await exportOrders.mutateAsync({
        status: filters.status ? filters.status.toString() : undefined,
        paymentMethod: filters.paymentMethod ? filters.paymentMethod.toString() : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined
      });
      showSnackbar(`Orders exported as ${format.toUpperCase()} successfully`, 'success');
    } catch (error) {
      showSnackbar('Failed to export orders', 'error');
      console.error('Export error:', error);
    }
  };

  const getStatusColor = (status: OrderStatus): 'error' | 'tertiary' | 'secondary' | 'primary' => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'primary';
      case OrderStatus.SHIPPED:
      case OrderStatus.PROCESSING: return 'secondary';
      case OrderStatus.CONFIRMED:
      case OrderStatus.PAID: return 'tertiary';
      case OrderStatus.CANCELLED:
      case OrderStatus.PAYMENT_FAILED: return 'error';
      default: return 'tertiary';
    }
  };

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h1>
          <p className="text-(--md-sys-color-on-surface-variant) mt-1">
            {orders.length} {t('orders.totalOrders')}
          </p>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              hasIcon
              icon="download"
              label={t('orders.exportCSV')}
              onClick={() => handleExport('csv')}
              disabled={exportOrders.isPending}
            />
            <Button
              variant="outlined"
              hasIcon
              icon="download"
              label={t('orders.exportExcel')}
              onClick={() => handleExport('xlsx')}
              disabled={exportOrders.isPending}
            />
          </div>
        )}
      </div>

      {/* Analytics */}
      {showAnalytics && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-primary)">
              {statistics?.total || 0}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">Total Orders</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-primary)">
              {formatCurrency(statistics?.totalRevenue || 0)}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">Total Revenue</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-secondary)">
              {statistics?.statusCounts?.['PENDING_PAYMENT'] || 0}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">Pending Orders</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-(--md-sys-color-primary)">
              {statistics?.statusCounts?.['DELIVERED'] || 0}
            </div>
            <div className="text-sm text-(--md-sys-color-on-surface-variant)">Completed Orders</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <TextField
                label={t('orders.searchOrders')}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder={t('orders.searchOrdersPlaceholder')}
              />
              
              <Select
                label={t('common.status')}
                value={filters.status.toString()}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value as OrderStatus | '' }))}
                options={[
                  { value: '', label: t('orders.allStatuses') },
                  ...Object.entries(OrderStatusLabels).map(([value, label]) => ({
                    value,
                    label
                  }))
                ]}
              />
              
              <Select
                label={t('orders.paymentMethod')}
                value={filters.paymentMethod.toString()}
                onChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value as PaymentMethod | '' }))}
                options={[
                  { value: '', label: t('orders.allPaymentMethods') },
                  ...Object.entries(PaymentMethodLabels).map(([value, label]) => ({
                    value,
                    label
                  }))
                ]}
              />
              
              <Select
                label={t('orders.paymentStatus')}
                value={filters.paymentStatus.toString()}
                onChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value as PaymentStatus | '' }))}
                options={[
                  { value: '', label: t('orders.allPaymentStatuses') },
                  { value: PaymentStatus.PENDING.toString(), label: 'Pending' },
                  { value: PaymentStatus.SUCCESSFUL.toString(), label: 'Successful' },
                  { value: PaymentStatus.FAILED.toString(), label: 'Failed' }
                ]}
              />
              
              <TextField
                label={t('orders.dateFrom')}
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
              
              <TextField
                label={t('orders.dateTo')}
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Orders List */}
      {isError ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl text-(--md-sys-color-error) mb-4">error</span>
            <p className="text-(--md-sys-color-error) mb-4">Failed to load orders</p>
            <Button 
              variant="filled"
              onClick={() => refetch()}
              label={t('actions.retry')}
              hasIcon
              icon="refresh"
            />
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl text-(--md-sys-color-on-surface-variant) mb-4">receipt_long</span>
            <p className="text-(--md-sys-color-on-surface-variant)">
              {filters.search || filters.status ? 'No orders found matching your filters' : 'No orders available'}
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="elevated">
          <List>
            {orders.map((order: Order) => (
              <ListItem
                key={order.id}
                leading={
                  <div className="h-12 w-12 rounded-lg bg-(--md-sys-color-primary-container) flex items-center justify-center">
                    <span className="text-(--md-sys-color-on-primary-container) text-lg mdi">receipt</span>
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-2">
                    <Chip
                      variant="assist"
                      color={getStatusColor(order.status)}
                      label={OrderStatusLabels[order.status]}
                      selected
                    />
                    {showActions && (
                      <Button
                        variant="text"
                        hasIcon
                        icon="visibility"
                        label={t('actions.view')}
                        onClick={() => handleOrderClick(order)}
                      />
                    )}
                  </div>
                }
                supportingText={`Customer: ${order.userId} • Payment: ${PaymentMethodLabels[order.paymentMethod]} • ${formatDate(order.createdAt)}`}
                onClick={() => handleOrderClick(order)}
              >
                <div className="font-medium text-(--md-sys-color-on-surface)">
                  Order #{order.id} • {formatCurrency(order.totalPrice)}
                </div>
              </ListItem>
            ))}
          </List>
          
          {/* Pagination */}
          {ordersData && (
            <div className="p-4 border-t border-(--md-sys-color-outline-variant)">
              <Pagination
                paginationInfo={pagination.paginationInfo}
                controls={pagination.controls}
              />
            </div>
          )}
        </Card>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
}
