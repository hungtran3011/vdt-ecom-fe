'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import { OrderStatus, OrderStatusLabels } from '@/types/Order';
import { useOrderById } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useUsers';
import { cn } from '@/utils/cn';
import { formatOrderDateDetailed, getRelativeTime } from '@/utils/timezone';

/**
 * Order detail page for users to view detailed information about a specific order
 * Includes product details, order status, payment information, and shipping details
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const {
    data: order,
    isLoading: orderLoading,
    isError,
    error,
    refetch
  } = useOrderById(orderId);

  const isLoading = authLoading || orderLoading;

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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
    return formatOrderDateDetailed(date);
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
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 bg-[var(--md-sys-color-surface-variant)] rounded animate-pulse" />
          <div className="h-8 w-48 bg-[var(--md-sys-color-surface-variant)] rounded animate-pulse" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
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

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="outlined" className="text-center py-12">
          <div className="text-[var(--md-sys-color-error)] mb-4">
            <span className="mdi text-6xl block mb-4">error_outline</span>
            {error instanceof Error ? error.message : 'Không thể tải thông tin đơn hàng'}
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outlined"
              onClick={() => router.back()}
              label="Quay lại"
            />
            <Button 
              variant="filled"
              onClick={() => refetch()}
              label="Thử lại"
            />
          </div>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="outlined" className="text-center py-12">
          <span className="mdi text-6xl block mb-4 text-[var(--md-sys-color-on-surface-variant)]">
            receipt_long
          </span>
          <p className="text-lg text-[var(--md-sys-color-on-surface)]">Không tìm thấy đơn hàng</p>
          <p className="text-sm mt-2 text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Đơn hàng #{orderId} không tồn tại hoặc bạn không có quyền truy cập
          </p>
          
          <Button
            variant="filled"
            label="Về trang đơn hàng"
            onClick={() => router.push('/orders')}
            icon="arrow_back"
            hasIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          onClick={() => router.back()}
          icon="arrow_back"
          hasIcon
          label=""
          className="!p-2"
        />
        <div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
            Đơn hàng #{order.id}
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Đặt lúc {formatDate(order.createdAt)} • {getRelativeTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Status */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
              Trạng thái đơn hàng
            </h2>
            <Chip
              variant="assist"
              color={getStatusColor(order.status)}
              label={OrderStatusLabels[order.status]}
              selected
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Ngày đặt</p>
              <p className="text-sm text-[var(--md-sys-color-on-surface)]">
                {formatDate(order.createdAt)}
              </p>
            </div>
            {order.updatedAt && (
              <div>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Cập nhật lần cuối</p>
                <p className="text-sm text-[var(--md-sys-color-on-surface)]">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Order Items */}
        <Card variant="elevated" className="overflow-hidden">
          <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)]">
            <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
              Sản phẩm ({order.items.length})
            </h2>
          </div>
          
          <List>
            {order.items.map((item) => (
              <ListItem
                key={item.id}
                className="py-4"
                leading={
                  <div className="h-16 w-16 rounded-lg bg-[var(--md-sys-color-surface-container)] flex items-center justify-center overflow-hidden">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="mdi text-2xl text-[var(--md-sys-color-on-surface-variant)]">
                        image_not_supported
                      </span>
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
                    <div className="text-sm font-medium text-[var(--md-sys-color-primary)] mt-1">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                }
              >
                <div className="flex flex-col">
                  <div className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
                    {item.productName}
                  </div>
                  {item.productId && (
                    <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      Mã SP: {item.productId}
                    </div>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
        </Card>

        {/* Order Summary */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)] mb-4">
            Tóm tắt đơn hàng
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">
                Tạm tính ({order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)
              </span>
              <span className="text-[var(--md-sys-color-on-surface)]">
                {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Phí vận chuyển</span>
              <span className="text-[var(--md-sys-color-on-surface)]">Miễn phí</span>
            </div>
            
            <hr className="border-[var(--md-sys-color-outline-variant)]" />
            
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-[var(--md-sys-color-on-surface)]">Tổng cộng</span>
              <span className="text-[var(--md-sys-color-primary)]">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>
        </Card>

        {/* Shipping Information */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)] mb-4">
            Thông tin giao hàng
          </h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Người nhận</p>
              <p className="text-sm text-[var(--md-sys-color-on-surface)]">{order.userEmail}</p>
            </div>
            
            <div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Số điện thoại</p>
              <p className="text-sm text-[var(--md-sys-color-on-surface)]">{order.phone}</p>
            </div>
            
            <div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Địa chỉ giao hàng</p>
              <p className="text-sm text-[var(--md-sys-color-on-surface)]">{order.address}</p>
            </div>
          </div>
        </Card>

        {/* Payment Information */}
        {(order.paymentMethod || order.paymentStatus) && (
          <Card variant="elevated" className="p-6">
            <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)] mb-4">
              Thông tin thanh toán
            </h2>
            
            <div className="space-y-3">
              {order.paymentMethod && (
                <div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Phương thức thanh toán</p>
                  <p className="text-sm text-[var(--md-sys-color-on-surface)]">
                    {order.paymentMethod === 'VIETTEL_MONEY' ? 'Viettel Money' : order.paymentMethod}
                  </p>
                </div>
              )}
              
              {order.paymentStatus && (
                <div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Trạng thái thanh toán</p>
                  <Chip
                    variant="assist"
                    color={order.paymentStatus === 'SUCCESSFUL' ? 'secondary' : order.paymentStatus === 'FAILED' ? 'error' : 'tertiary'}
                    label={
                      order.paymentStatus === 'SUCCESSFUL' ? 'Đã thanh toán' :
                      order.paymentStatus === 'FAILED' ? 'Thanh toán thất bại' :
                      order.paymentStatus === 'PENDING' ? 'Chờ thanh toán' :
                      order.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' :
                      order.paymentStatus
                    }
                    selected
                    className="text-xs"
                  />
                </div>
              )}
              
              {order.paymentId && (
                <div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">Mã giao dịch</p>
                  <p className="text-sm text-[var(--md-sys-color-on-surface)] font-mono">{order.paymentId}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {[OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED].includes(order.status) && (
            <Button
              variant="outlined"
              label="Hủy đơn hàng"
              onClick={() => {/* Handle cancel order */}}
              className="flex-1 text-[var(--md-sys-color-error)]"
              icon="cancel"
              hasIcon
            />
          )}
          
          {order.status === OrderStatus.PENDING_PAYMENT && order.paymentMethod === 'VIETTEL_MONEY' && (
            <Button
              variant="filled"
              label="Thanh toán lại"
              onClick={() => router.push(`/payment/${order.id}`)}
              className="flex-1"
              icon="payment"
              hasIcon
            />
          )}
          
          <Button
            variant="tonal"
            label="Mua lại"
            onClick={() => {/* Handle reorder */}}
            className="flex-1"
            icon="refresh"
            hasIcon
          />
        </div>
      </div>
    </div>
  );
}
