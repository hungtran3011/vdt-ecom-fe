'use client';

import React from 'react';
import Chip from '@/components/Chip';
import { OrderStatus } from '@/types/Order';
import { VI_TRANSLATIONS } from '@/utils/localization';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

export default function OrderStatusBadge({ 
  status, 
  className = '', 
  showIcon = false 
}: OrderStatusBadgeProps) {
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

  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return 'schedule';
      case OrderStatus.PAID:
        return 'check_circle';
      case OrderStatus.CONFIRMED:
        return 'task_alt';
      case OrderStatus.PROCESSING:
        return 'manufacturing';
      case OrderStatus.SHIPPED:
        return 'local_shipping';
      case OrderStatus.DELIVERED:
        return 'done_all';
      case OrderStatus.CANCELLED:
        return 'cancel';
      case OrderStatus.PAYMENT_FAILED:
        return 'error';
      default:
        return 'help';
    }
  };

  const statusLabel = VI_TRANSLATIONS.orders.status[status] || status;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && (
        <span className={`mdi mdi-${getStatusIcon(status)} text-sm`}></span>
      )}
      <Chip
        variant="assist"
        color={getStatusColor(status)}
        label={statusLabel}
        selected
        className="text-xs"
      />
    </div>
  );
}
