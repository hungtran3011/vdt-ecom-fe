'use client';

import BottomNav, { NavItem } from '@/components/BottomNav';
import { useCartContext } from '@/contexts/CartContext';

/**
 * Bottom navigation for the main user pages
 * Following Material Design v3 navigation bar guidelines
 */
export default function MainBottomNav() {
  const { cart } = useCartContext();
  
  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Trang chủ',
      icon: 'home',
    },
    {
      href: '/products',
      label: 'Sản phẩm',
      icon: 'inventory_2',
    },
    {
      href: '/cart',
      label: 'Giỏ hàng',
      icon: 'shopping_cart',
      badge: cart ? cart.totalItems > 0 : false,
      badgeContent: cart?.totalItems?.toString(),
    },
    {
      href: '/orders',
      label: 'Đơn hàng',
      icon: 'receipt_long',
    },
    {
      href: '/profile',
      label: 'Tài khoản',
      icon: 'person',
    },
  ];

  return (
    <BottomNav 
      items={navItems}
      className="md:hidden" // Only show on mobile devices
    />
  );
}
