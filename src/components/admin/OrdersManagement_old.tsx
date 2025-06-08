'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Select from '@/components/Select';
import Snackbar from '@/components/Snackbar';
import { Order, OrderStatus, OrderStatusLabels, PaymentMethod, PaymentMethodLabels, PaymentStatus } from '@/types/Order';
import { useOrders, useUpdateOrderStatus, useExportOrders, useOrderStatistics } from '@/hooks/useOrders';
import { useSnackbar } from '@/hooks/useSnackbar';

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
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.PAYMENT_FAILED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED]
    };
    
    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const getStatusOptions = () => {
    return Object.entries(OrderStatusLabels).map(([status, label]) => ({
      value: status,
      label: label,
      disabled: !canUpdateStatus(order.status, parseInt(status) as OrderStatus)
    }));
  };

  const getStatusColor = (status: OrderStatus): 'error' | 'tertiary' | 'secondary' | 'primary' => {
    switch (status) {
      case OrderStatus.CANCELLED:
      case OrderStatus.PAYMENT_FAILED:
        return 'error';
      case OrderStatus.PENDING_PAYMENT:
      case OrderStatus.PAID:
      case OrderStatus.CONFIRMED:
        return 'tertiary';
      case OrderStatus.PROCESSING:
        return 'primary';
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', 
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-(--md-sys-color-on-surface)">
              Order #{order.id}
            </h3>
            <Button
              variant="text"
              onClick={onClose}
              className="text-(--md-sys-color-on-surface-variant)"
              icon="close"
              hasIcon
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Current Status</h4>
              <Chip
                variant="assist"
                color={getStatusColor(order.status)}
                label={OrderStatusLabels[order.status]}
                selected
                className="mb-4"
              />
              
              <div className="space-y-2">
                <Select
                  label="Update Status"
                  value={selectedStatus.toString()}
                  onChange={(value) => setSelectedStatus(value === '' ? '' : parseInt(value) as OrderStatus)}
                  options={getStatusOptions()}
                  className="w-full"
                />
                <Button
                  variant="filled"
                  label="Update Status"
                  onClick={handleStatusUpdate}
                  disabled={selectedStatus === '' || selectedStatus === order.status}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Created:</span>
                  <span className="ml-2 text-(--md-sys-color-on-surface)">{formatDate(order.createdAt)}</span>
                </div>
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Updated:</span>
                  <span className="ml-2 text-(--md-sys-color-on-surface)">{formatDate(order.updatedAt)}</span>
                </div>
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Payment:</span>
                  <span className="ml-2 text-(--md-sys-color-on-surface)">{PaymentMethodLabels[order.paymentMethod]}</span>
                </div>
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Total:</span>
                  <span className="ml-2 font-medium text-(--md-sys-color-on-surface)">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Customer Information</h4>
            <div className="bg-(--md-sys-color-surface-variant) rounded-lg p-4 space-y-2">
              <div>
                <span className="text-(--md-sys-color-on-surface-variant) text-sm">Address:</span>
                <p className="text-(--md-sys-color-on-surface)">{order.address}</p>
              </div>
              <div>
                <span className="text-(--md-sys-color-on-surface-variant) text-sm">Phone:</span>
                <p className="text-(--md-sys-color-on-surface)">{order.phone}</p>
              </div>
              {order.note && (
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant) text-sm">Note:</span>
                  <p className="text-(--md-sys-color-on-surface)">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-(--md-sys-color-surface-variant) rounded-lg">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-(--md-sys-color-on-surface)">{item.productName}</h5>
                    <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-(--md-sys-color-on-surface)">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function OrdersManagement({ 
  title = "Orders Management",
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
      id: '1',
      userId: '1',
      status: OrderStatus.PROCESSING,
      address: '123 Main St, City, State',
      phone: '+1234567890',
      note: 'Leave at the door',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PENDING,
      paymentId: 'pm_123456',
      totalPrice: 299.99,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      items: [
        {
          id: 1,
          orderId: '1',
          productId: 1,
          productName: 'Sample Product',
          productImage: '/dummy/1.png',
          quantity: 2,
          price: 149.99,
          totalPrice: 299.98
        }
      ]
    },
    {
      id: '2',
      userId: '2',
      status: OrderStatus.DELIVERED,
      address: '456 Oak Ave, City, State',
      phone: '+0987654321',
      note: '',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.SUCCESSFUL,
      paymentId: 'pm_789012',
      totalPrice: 149.99,
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-03T00:00:00Z'),
      items: [
        {
          id: 2,
          orderId: '2',
          productId: 2,
          productName: 'Another Product',
          productImage: '/dummy/2.png',
          quantity: 1,
          price: 149.99,
          totalPrice: 149.99
        }
      ]
    }
  ];

  // State management
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    paymentMethod: '',
    paymentStatus: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Hooks
  const { 
    data: orders = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useOrders(fallbackOrders.length > 0 ? fallbackOrders : defaultFallbackOrders);

  const updateOrderStatusMutation = useUpdateOrderStatus();
  const exportOrdersMutation = useExportOrders();
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Utility functions
  const getStatusColor = (status: OrderStatus): 'error' | 'tertiary' | 'secondary' | 'primary' => {
    switch (status) {
      case OrderStatus.CANCELLED:
      case OrderStatus.PAYMENT_FAILED:
        return 'error';
      case OrderStatus.PENDING_PAYMENT:
      case OrderStatus.PAID:
      case OrderStatus.CONFIRMED:
        return 'tertiary';
      case OrderStatus.PROCESSING:
        return 'primary';
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', 
      currency: 'USD'
    }).format(amount);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = !filters.status || order.status === filters.status;
      const matchesPaymentMethod = !filters.paymentMethod || order.paymentMethod === filters.paymentMethod;
      const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
      const matchesSearch = !filters.search || 
        order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.phone.includes(filters.search);
      
      const matchesDateRange = (!filters.dateFrom || new Date(order.createdAt) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(order.createdAt) <= new Date(filters.dateTo));

      return matchesStatus && matchesPaymentMethod && matchesPaymentStatus && matchesSearch && matchesDateRange;
    });
  }, [orders, filters]);

  // Order summary statistics
  const summary = useMemo(() => ({
    total: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0),
    pendingPayment: filteredOrders.filter(o => o.status === OrderStatus.PENDING_PAYMENT).length,
    processing: filteredOrders.filter(o => o.status === OrderStatus.PROCESSING).length,
    shipped: filteredOrders.filter(o => o.status === OrderStatus.SHIPPED).length,
    delivered: filteredOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
    cancelled: filteredOrders.filter(o => o.status === OrderStatus.CANCELLED).length
  }), [filteredOrders]);

  // Handlers
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    onOrderSelect?.(order);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      showSnackbar('Order status updated successfully', 'success');
      onStatusUpdate?.(orderId, newStatus);
    } catch (error) {
      showSnackbar('Failed to update order status', 'error');
      console.error('Failed to update order status:', error);
    }
  };

  const handleExport = async () => {
    try {
      const filters = {
        status: filters.status.toString(),
        paymentMethod: filters.paymentMethod.toString(),
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      };
      
      const blob = await exportOrdersMutation.mutateAsync(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showSnackbar('Orders exported successfully', 'success');
    } catch (error) {
      // Fallback export if API fails
      const csvContent = [
        ['Order ID', 'Status', 'Customer', 'Phone', 'Total', 'Payment Method', 'Created Date'],
        ...filteredOrders.map(order => [
          order.id,
          OrderStatusLabels[order.status],
          order.address.split(',')[0],
          order.phone,
          order.totalPrice.toString(),
          PaymentMethodLabels[order.paymentMethod],
          formatDate(order.createdAt)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showSnackbar('Orders exported successfully', 'success');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      paymentStatus: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-(--md-sys-color-on-surface) mb-6">{title}</h2>
        <Card variant="elevated" className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-3/4"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-1/2"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-5/6"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h2>
          <p className="text-(--md-sys-color-on-surface-variant) mt-1">
            {summary.total} orders • {formatCurrency(summary.totalRevenue)} total revenue
          </p>
        </div>
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="filled"
              label="Refresh"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
              icon="refresh"
              hasIcon
            />
            <Button
              variant="tonal"
              label="Export"
              className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
              icon="download"
              hasIcon
              onClick={handleExport}
              disabled={exportOrdersMutation.isPending}
            />
          </div>
        )}
      </div>

      {/* Analytics Cards */}
      {showAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-lg sm:text-xl font-bold text-(--md-sys-color-primary)">
              {summary.total}
            </div>
            <div className="text-xs sm:text-sm text-(--md-sys-color-on-surface-variant)">Total Orders</div>
          </Card>
          <Card className="p-4">
            <div className="text-lg sm:text-xl font-bold text-(--md-sys-color-tertiary)">
              {summary.pendingPayment}
            </div>
            <div className="text-xs sm:text-sm text-(--md-sys-color-on-surface-variant)">Pending Payment</div>
          </Card>
          <Card className="p-4">
            <div className="text-lg sm:text-xl font-bold text-(--md-sys-color-primary)">
              {summary.processing}
            </div>
            <div className="text-xs sm:text-sm text-(--md-sys-color-on-surface-variant)">Processing</div>
          </Card>
          <Card className="p-4">
            <div className="text-lg sm:text-xl font-bold text-(--md-sys-color-secondary)">
              {summary.shipped}
            </div>
            <div className="text-xs sm:text-sm text-(--md-sys-color-on-surface-variant)">Shipped</div>
          </Card>
          <Card className="p-4">
            <div className="text-lg sm:text-xl font-bold text-(--md-sys-color-secondary)">
              {summary.delivered}
            </div>
            <div className="text-xs sm:text-sm text-(--md-sys-color-on-surface-variant)">Delivered</div>
          </Card>
          <Card className="p-4">
            <div className="text-lg sm:text-xl font-bold text-(--md-sys-color-error)">
              {summary.cancelled}
            </div>
            <div className="text-xs sm:text-sm text-(--md-sys-color-on-surface-variant)">Cancelled</div>
          </Card>
          <Card className="p-4">
            <div className="text-lg sm:text-xl font-bold text-(--md-sys-color-primary)">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <div className="text-xs sm:text-sm text-(--md-sys-color-on-surface-variant)">Revenue</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card variant="elevated" className="p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <TextField
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Order ID, address, phone..."
              className="col-span-1 lg:col-span-2"
            />
            <Select
              label="Status"
              value={filters.status.toString()}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value === '' ? '' : parseInt(value) as OrderStatus }))}
              options={[
                { value: '', label: 'All Statuses' },
                ...Object.entries(OrderStatusLabels).map(([status, label]) => ({
                  value: status,
                  label: label
                }))
              ]}
            />
            <Select
              label="Payment Method"
              value={filters.paymentMethod.toString()}
              onChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value === '' ? '' : parseInt(value) as PaymentMethod }))}
              options={[
                { value: '', label: 'All Methods' },
                ...Object.entries(PaymentMethodLabels).map(([method, label]) => ({
                  value: method,
                  label: label
                }))
              ]}
            />
            <TextField
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
            <TextField
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-(--md-sys-color-on-surface-variant)">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <Button
              variant="text"
              label="Clear Filters"
              onClick={clearFilters}
              className="text-sm"
            />
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
              label="Retry"
              hasIcon
              icon="refresh"
            />
          </div>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="flex flex-col items-center justify-center">
            <span className="mdi text-4xl text-(--md-sys-color-on-surface-variant) mb-4">receipt_long</span>
            <p className="text-(--md-sys-color-on-surface-variant)">
              {filters.search || filters.status || filters.paymentMethod || filters.dateFrom || filters.dateTo 
                ? 'No orders found matching your filters' 
                : 'No orders available'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card variant="elevated" className="w-full min-w-[800px]">
            <List>
              {filteredOrders.map((order) => (
                <ListItem 
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  className="hover:bg-(--md-sys-color-surface-variant) cursor-pointer"
                  leading={
                    <div className="h-12 w-12 rounded-lg bg-(--md-sys-color-primary-container) flex items-center justify-center">
                      <span className="text-(--md-sys-color-on-primary-container) text-lg mdi">receipt_long</span>
                    </div>
                  }
                  trailing={
                    <div className="flex flex-col items-end gap-2">
                      <Chip
                        variant="assist"
                        color={getStatusColor(order.status)}
                        label={OrderStatusLabels[order.status]}
                        selected
                        className="text-xs sm:text-sm"
                      />
                      <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                  }
                  supportingText={`Order Date: ${formatDate(order.createdAt)} • ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'} • ${PaymentMethodLabels[order.paymentMethod]}`}
                >
                  <div className="font-medium text-(--md-sys-color-on-surface)">
                    Order #{order.id} - {order.address.split(',')[0]}
                  </div>
                </ListItem>
              ))}
            </List>
          </Card>
        </div>
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
  showFilters?: boolean;
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
    // Define allowed status transitions
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.PAYMENT_FAILED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED]
    };
    
    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const getStatusOptions = () => {
    return Object.entries(OrderStatusLabels).map(([status, label]) => ({
      value: status,
      label: label,
      disabled: !canUpdateStatus(order.status, parseInt(status) as OrderStatus)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-(--md-sys-color-on-surface)">
              Order #{order.id}
            </h3>
            <Button
              variant="text"
              onClick={onClose}
              className="text-(--md-sys-color-on-surface-variant)"
              icon="close"
              hasIcon
            />
          </div>

          {/* Order Status and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Current Status</h4>
              <Chip
                variant="assist"
                color={getStatusColor(order.status)}
                label={OrderStatusLabels[order.status]}
                selected
                className="mb-4"
              />
              
              <div className="space-y-2">
                <Select
                  label="Update Status"
                  value={selectedStatus.toString()}
                  onChange={(value) => setSelectedStatus(value === '' ? '' : parseInt(value) as OrderStatus)}
                  options={getStatusOptions()}
                  className="w-full"
                />
                <Button
                  variant="filled"
                  label="Update Status"
                  onClick={handleStatusUpdate}
                  disabled={selectedStatus === '' || selectedStatus === order.status}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Created:</span>
                  <span className="ml-2 text-(--md-sys-color-on-surface)">{formatDate(order.createdAt)}</span>
                </div>
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Updated:</span>
                  <span className="ml-2 text-(--md-sys-color-on-surface)">{formatDate(order.updatedAt)}</span>
                </div>
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Payment:</span>
                  <span className="ml-2 text-(--md-sys-color-on-surface)">{PaymentMethodLabels[order.paymentMethod]}</span>
                </div>
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant)">Total:</span>
                  <span className="ml-2 font-medium text-(--md-sys-color-on-surface)">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Customer Information</h4>
            <div className="bg-(--md-sys-color-surface-variant) rounded-lg p-4 space-y-2">
              <div>
                <span className="text-(--md-sys-color-on-surface-variant) text-sm">Address:</span>
                <p className="text-(--md-sys-color-on-surface)">{order.address}</p>
              </div>
              <div>
                <span className="text-(--md-sys-color-on-surface-variant) text-sm">Phone:</span>
                <p className="text-(--md-sys-color-on-surface)">{order.phone}</p>
              </div>
              {order.note && (
                <div>
                  <span className="text-(--md-sys-color-on-surface-variant) text-sm">Note:</span>
                  <p className="text-(--md-sys-color-on-surface)">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium text-(--md-sys-color-on-surface) mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-(--md-sys-color-surface-variant) rounded-lg">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-(--md-sys-color-on-surface)">{item.productName}</h5>
                    <p className="text-sm text-(--md-sys-color-on-surface-variant)">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-(--md-sys-color-on-surface)">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function OrdersManagement({ 
  title = "Orders Management",
  className = "",
  onOrderSelect,
  onStatusUpdate,
  showActions = true,
  showFilters = true,
  showAnalytics = false,
  fallbackOrders = []
}: OrdersManagementProps) {
  // Fallback orders for testing
  const fallbackOrders: Order[] = [
    {
      id: '1',
      userId: '1',
      status: OrderStatus.PROCESSING,
      address: '123 Main St, City, State',
      phone: '+1234567890',
      note: 'Leave at the door',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PENDING,
      paymentId: 'pm_123456',
      totalPrice: 299.99,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      items: [
        {
          id: 1,
          orderId: '1',
          productId: 1,
          productName: 'Sample Product',
          productImage: '/dummy/1.png',
          quantity: 2,
          price: 149.99,
          totalPrice: 299.98
        }
      ]
    },
    {
      id: '2',
      userId: '2',
      status: OrderStatus.DELIVERED,
      address: '456 Oak Ave, City, State',
      phone: '+0987654321',
      note: '',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.SUCCESSFUL,
      paymentId: 'pm_789012',
      totalPrice: 149.99,
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-03T00:00:00Z'),
      items: [
        {
          id: 2,
          orderId: '2',
          productId: 2,
          productName: 'Another Product',
          productImage: '/dummy/2.png',
          quantity: 1,
          price: 149.99,
          totalPrice: 149.99
        }
      ]
    }
  ];

  // State management
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    paymentMethod: '',
    paymentStatus: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Hooks
  const { 
    data: orders = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useOrders(fallbackOrders);

  const updateOrderStatusMutation = useUpdateOrderStatus();
  const { snackbar, showSnackbar } = useSnackbar();

  // Utility functions
  const getStatusColor = (status: OrderStatus): 'error' | 'tertiary' | 'secondary' | 'primary' => {
    switch (status) {
      case OrderStatus.CANCELLED:
      case OrderStatus.PAYMENT_FAILED:
        return 'error';
      case OrderStatus.PENDING_PAYMENT:
      case OrderStatus.PAID:
      case OrderStatus.CONFIRMED:
        return 'tertiary';
      case OrderStatus.PROCESSING:
        return 'primary';
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', 
      currency: 'USD'
    }).format(amount);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = !filters.status || order.status === filters.status;
      const matchesPaymentMethod = !filters.paymentMethod || order.paymentMethod === filters.paymentMethod;
      const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
      const matchesSearch = !filters.search || 
        order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.phone.includes(filters.search);
      
      const matchesDateRange = (!filters.dateFrom || new Date(order.createdAt) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(order.createdAt) <= new Date(filters.dateTo));

      return matchesStatus && matchesPaymentMethod && matchesPaymentStatus && matchesSearch && matchesDateRange;
    });
  }, [orders, filters]);

  // Handlers
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    onOrderSelect?.(order);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      showSnackbar('Order status updated successfully', 'success');
      onStatusUpdate?.(orderId, newStatus);
    } catch (error) {
      showSnackbar('Failed to update order status', 'error');
      console.error('Failed to update order status:', error);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Order ID', 'Status', 'Customer', 'Phone', 'Total', 'Payment Method', 'Created Date'],
      ...filteredOrders.map(order => [
        order.id,
        OrderStatusLabels[order.status],
        order.address.split(',')[0],
        order.phone,
        order.totalPrice.toString(),
        PaymentMethodLabels[order.paymentMethod],
        formatDate(order.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar('Orders exported successfully', 'success');
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      paymentStatus: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-(--md-sys-color-on-surface) mb-6">{title}</h2>
        <Card variant="elevated" className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-3/4"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-1/2"></div>
            <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-5/6"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-(--md-sys-color-on-surface)">{title}</h2>
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="filled"
              label="Refresh"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
              icon="refresh"
              hasIcon
            />
            <Button
              variant="tonal"
              label="Export"
              className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
              icon="download"
              hasIcon
              onClick={handleExport}
            />
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card variant="elevated" className="p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <TextField
              label="Search"
              value={filters.search}
              onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
              placeholder="Order ID, address, phone..."
              className="col-span-1 lg:col-span-2"
            />
            <Select
              label="Status"
              value={filters.status.toString()}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value === '' ? '' : parseInt(value) as OrderStatus }))}
              options={[
                { value: '', label: 'All Statuses' },
                ...Object.entries(OrderStatusLabels).map(([status, label]) => ({
                  value: status,
                  label: label
                }))
              ]}
            />
            <Select
              label="Payment Method"
              value={filters.paymentMethod.toString()}
              onChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value === '' ? '' : parseInt(value) as PaymentMethod }))}
              options={[
                { value: '', label: 'All Methods' },
                ...Object.entries(PaymentMethodLabels).map(([method, label]) => ({
                  value: method,
                  label: label
                }))
              ]}
            />
            <TextField
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(value) => setFilters(prev => ({ ...prev, dateFrom: value }))}
            />
            <TextField
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={(value) => setFilters(prev => ({ ...prev, dateTo: value }))}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-(--md-sys-color-on-surface-variant)">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <Button
              variant="text"
              label="Clear Filters"
              onClick={clearFilters}
              className="text-sm"
            />
          </div>
        </Card>
      )}
      
      {isError ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="text-(--md-sys-color-error) mb-4">
            {error instanceof Error ? error.message : 'Failed to fetch orders'}
          </div>
          <Button 
            variant="filled"
            onClick={() => refetch()}
            label="Retry"
            disabled={isLoading}
          />
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card variant="elevated" className="w-full min-w-[800px]">
            <List>
              {filteredOrders.map((order) => (
                <ListItem 
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  className="hover:bg-(--md-sys-color-surface-variant) cursor-pointer"
                  leading={
                    <div className="h-12 w-12 rounded-lg bg-(--md-sys-color-primary-container) flex items-center justify-center">
                      <span className="text-(--md-sys-color-on-primary-container) text-lg mdi">receipt_long</span>
                    </div>
                  }
                  trailing={
                    <div className="flex flex-col items-end gap-2">
                      <Chip
                        variant="assist"
                        color={getStatusColor(order.status)}
                        label={OrderStatusLabels[order.status]}
                        selected
                        className="text-xs sm:text-sm"
                      />
                      <span className="text-sm font-medium text-(--md-sys-color-on-surface-variant)">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                  }
                  supportingText={`Order Date: ${formatDate(order.createdAt)} • ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'} • ${PaymentMethodLabels[order.paymentMethod]}`}
                >
                  <div className="font-medium text-(--md-sys-color-on-surface)">
                    Order #{order.id} - {order.address.split(',')[0]}
                  </div>
                </ListItem>
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-(--md-sys-color-on-surface-variant)">No orders found matching your filters</p>
                </div>
              )}
            </List>
          </Card>
        </div>
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
      <Snackbar {...snackbar} />
    </div>
  );
}
