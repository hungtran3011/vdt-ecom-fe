'use client';

import BottomNav from '@/components/BottomNav';
import type { NavItem } from '@/components/BottomNav';
import { t } from '@/utils/localization';

const adminNavItems: NavItem[] = [
  {
    href: '/admin',
    label: t('adminNavigation.dashboard'),
    icon: 'dashboard',
    absolutePathIndicate: true
  },
  {
    href: '/admin/products',
    label: t('adminNavigation.products'),
    icon: 'inventory_2'
  },
  {
    href: '/admin/stock',
    label: t('adminNavigation.stock'),
    icon: 'warehouse'
  },
  {
    href: '/admin/orders',
    label: t('adminNavigation.orders'),
    icon: 'shopping_cart'
  },
  {
    href: '/admin/payments',
    label: t('adminNavigation.payments'),
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
