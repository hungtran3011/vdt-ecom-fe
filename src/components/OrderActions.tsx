'use client';

import React, { useState } from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Order, OrderStatus } from '@/types/Order';

interface OrderActionsProps {
  order: Order;
  onReorder?: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
  onTrackOrder?: (orderId: string) => void;
  compact?: boolean;
}

export default function OrderActions({
  order,
  onReorder,
  onCancelOrder,
  onTrackOrder,
  compact = false
}: OrderActionsProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canCancel = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.CONFIRMED
  ].includes(order.status);

  const canReorder = [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.PAYMENT_FAILED
  ].includes(order.status);

  const canTrack = [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED
  ].includes(order.status);

  const canPayAgain = order.status === OrderStatus.PENDING_PAYMENT && 
                      order.paymentMethod === 'VIETTEL_MONEY';

  const handleCancelOrder = async () => {
    if (!onCancelOrder) return;
    
    setIsLoading(true);
    try {
      console.log('Attempting to cancel order:', order.id);
      await onCancelOrder(order.id);
      console.log('Order cancelled successfully');
      setShowCancelModal(false);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = () => {
    if (!onReorder) return;
    onReorder(order);
  };

  const handleTrackOrder = () => {
    if (!onTrackOrder) return;
    onTrackOrder(order.id);
  };

  if (compact) {
    return (
      <div className="flex gap-1">
        {canPayAgain && (
          <Button
            variant="filled"
            label="Thanh toán"
            onClick={() => window.open(`/payment/${order.id}`, '_blank')}
            className="text-xs px-2 py-1"
            icon="payment"
            hasIcon
          />
        )}
        {canTrack && (
          <Button
            variant="tonal"
            label="Theo dõi"
            onClick={handleTrackOrder}
            className="text-xs px-2 py-1"
            icon="local_shipping"
            hasIcon
          />
        )}
        {canCancel && (
          <Button
            variant="outlined"
            label="Hủy"
            onClick={handleCancelOrder}
            className="text-xs px-2 py-1 text-[var(--md-sys-color-error)]"
            icon="cancel"
            hasIcon
            disabled={isLoading}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canPayAgain && (
          <Button
            variant="filled"
            label="Thanh toán lại"
            onClick={() => window.open(`/payment/${order.id}`, '_blank')}
            className="flex-1 min-w-[120px]"
            icon="payment"
            hasIcon
          />
        )}
        
        {canTrack && (
          <Button
            variant="tonal"
            label="Theo dõi đơn hàng"
            onClick={handleTrackOrder}
            className="flex-1 min-w-[120px]"
            icon="local_shipping"
            hasIcon
          />
        )}
        
        {canReorder && (
          <Button
            variant="outlined"
            label="Đặt lại"
            onClick={handleReorder}
            className="flex-1 min-w-[120px]"
            icon="refresh"
            hasIcon
          />
        )}
        
        {canCancel && (
          <Button
            variant="outlined"
            label="Hủy đơn hàng"
            onClick={() => setShowCancelModal(true)}
            className="flex-1 min-w-[120px] text-[var(--md-sys-color-error)] border-[var(--md-sys-color-error)]"
            icon="cancel"
            hasIcon
          />
        )}
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Hủy đơn hàng"
      >
        <div className="p-6">
          <p className="text-[var(--md-sys-color-on-surface)] mb-4">
            Bạn có chắc chắn muốn hủy đơn hàng #{order.id}?
          </p>
          <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mb-6">
            Hành động này không thể hoàn tác. Đơn hàng sẽ được hủy và bạn sẽ nhận được email xác nhận.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outlined"
              label="Không hủy"
              onClick={() => setShowCancelModal(false)}
              disabled={isLoading}
            />
            <Button
              variant="filled"
              label={isLoading ? "Đang hủy..." : "Xác nhận hủy"}
              onClick={handleCancelOrder}
              disabled={isLoading}
              className="bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)]"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
