'use client';

import BottomNav from '@/components/BottomNav';
import type { NavItem } from '@/components/BottomNav';
import { t } from '@/utils/localization';

const adminNavItems: NavItem[] = [
  {
    href: '/admin',
    label: t('admin.dashboard'),
    icon: 'dashboard'
  },
  {
    href: '/admin/products',
    label: t('product.name'),
    icon: 'inventory_2'
  },
  {
    href: '/admin/stock',
    label: t('stock.warehouse'),
    icon: 'warehouse'
  },
  {
    href: '/admin/orders',
    label: t('order.orders'),
    icon: 'shopping_cart'
  },
  {
    href: '/admin/payments',
    label: t('payment.method'),
    icon: 'payments'
  }
];

export default function AdminBottomNav() {
  return (
    <BottomNav 
      items={adminNavItems} 
      className="md:hidden" 
    />
  );
}
