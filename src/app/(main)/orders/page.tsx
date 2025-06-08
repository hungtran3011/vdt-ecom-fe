'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import { OrderStatus, OrderStatusLabels } from '@/types/Order';
import { useUserOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

/**
 * Orders page for user to view their order history
 * Responsive design with Material Design v3 components
 */
export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError,
    error,
    refetch
  } = useUserOrders();

  const isLoading = authLoading || ordersLoading;

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Filter orders by status
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => {
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
    return new Date(date).toLocaleDateString('vi-VN');
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
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-(--md-sys-color-on-surface)">
          Đơn hàng của tôi
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-(--md-sys-color-surface-variant) rounded"></div>
          <div className="h-32 bg-(--md-sys-color-surface-variant) rounded"></div>
          <div className="h-32 bg-(--md-sys-color-surface-variant) rounded"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-(--md-sys-color-on-surface)">
          Đơn hàng của tôi
        </h1>
        
        {/* Tab Navigation Skeleton */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 w-24 bg-(--md-sys-color-surface-variant) rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
        
        {/* Orders Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} variant="filled" className="p-6 animate-pulse">
              <div className="h-4 bg-(--md-sys-color-surface-variant) rounded mb-4 w-1/3" />
              <div className="space-y-2">
                <div className="h-3 bg-(--md-sys-color-surface-variant) rounded w-full" />
                <div className="h-3 bg-(--md-sys-color-surface-variant) rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-(--md-sys-color-on-surface)">Đơn hàng của tôi</h1>
        
        <Button
          variant="tonal"
          label="Làm mới"
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-sm px-4 py-2"
          icon="refresh"
          hasIcon
        />
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto mb-6">
        <div className="flex space-x-2 min-w-max">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ xử lý' },
            { id: 'processing', label: 'Đang giao' },
            { id: 'completed', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'filled' : 'text'}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-2 px-4 text-sm",
                activeTab === tab.id
                  ? "bg-(--md-sys-color-primary) text-(--md-sys-color-on-primary)"
                  : "text-(--md-sys-color-on-surface)"
              )}
            />
          ))}
        </div>
      </div>
      
      {isError ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="text-(--md-sys-color-error) mb-4">
            {error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng'}
          </div>
          <Button 
            variant="filled"
            onClick={() => refetch()}
            label="Thử lại"
          />
        </Card>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-(--md-sys-color-surface-container) rounded-lg">
          <span className="mdi text-6xl block mb-4 text-(--md-sys-color-on-surface-variant)">
            receipt_long
          </span>
          <p className="text-lg text-(--md-sys-color-on-surface)">Không có đơn hàng nào</p>
          <p className="text-sm mt-2 text-(--md-sys-color-on-surface-variant) mb-6">
            {activeTab === 'all' 
              ? 'Bạn chưa có đơn hàng nào' 
              : 'Không tìm thấy đơn hàng nào trong mục này'}
          </p>
          
          <Button
            variant="filled"
            label="Mua sắm ngay"
            onClick={() => router.push('/')}
            icon="shopping_bag"
            hasIcon
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              variant="elevated"
              className="overflow-hidden"
            >
              <div className="p-4 border-b border-(--md-sys-color-outline-variant)">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-(--md-sys-color-on-surface-variant)">
                    Đơn hàng #{order.id}
                  </div>
                  <Chip
                    variant="assist"
                    color={getStatusColor(order.status)}
                    label={OrderStatusLabels[order.status]}
                    selected
                    className="text-xs"
                  />
                </div>
                <div className="text-sm mt-1 text-(--md-sys-color-on-surface-variant)">
                  Ngày đặt: {formatDate(order.createdAt)}
                </div>
              </div>
              
              <List className="max-h-64 overflow-y-auto">
                {order.items.map((item) => (
                  <ListItem
                    key={item.id}
                    className="py-2"
                    leading={
                      <div className="h-12 w-12 rounded bg-(--md-sys-color-surface-container) flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="mdi text-lg">image_not_supported</span>
                        )}
                      </div>
                    }
                    trailing={
                      <div className="text-right">
                        <div className="text-sm font-medium text-(--md-sys-color-on-surface)">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="text-xs text-(--md-sys-color-on-surface-variant)">
                          x{item.quantity}
                        </div>
                      </div>
                    }
                  >
                    <div className="text-sm font-medium text-(--md-sys-color-on-surface)">
                      {item.productName}
                    </div>
                  </ListItem>
                ))}
              </List>
              
              <div className="p-4 border-t border-(--md-sys-color-outline-variant) flex justify-between items-center">
                <div>
                  <div className="text-xs text-(--md-sys-color-on-surface-variant)">Tổng tiền:</div>
                  <div className="text-base font-medium text-(--md-sys-color-primary)">
                    {formatCurrency(order.totalPrice)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="text"
                    label="Chi tiết"
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="text-xs"
                  />
                  {[OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED].includes(order.status) && (
                    <Button
                      variant="outlined"
                      label="Hủy đơn"
                      onClick={() => {/* Handle cancel order */}}
                      className="text-xs text-(--md-sys-color-error)"
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
