'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, ListItem } from '@/components/List';
import Card from '@/components/Card';
import { t } from '@/utils/localization';

const menuItems = [
  {
    href: '/admin',
    label: t('admin.dashboard'),
    icon: 'dashboard'
  },
  {
    href: '/admin/users',
    label: t('admin.users'),
    icon: 'people'
  },
  {
    href: '/admin/products',
    label: t('admin.products'),
    icon: 'inventory_2'
  },
  {
    href: '/admin/stock',
    label: t('admin.stock'),
    icon: 'warehouse'
  },
  {
    href: '/admin/orders',
    label: t('admin.orders'),
    icon: 'shopping_cart'
  },
  {
    href: '/admin/payments',
    label: t('admin.payments'),
    icon: 'payments'
  },
  {
    href: '/admin/categories',
    label: t('admin.categories'),
    icon: 'category'
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block w-64 h-screen bg-(--md-sys-color-surface-container) p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-(--md-sys-color-on-surface) mb-4">
          {t('admin.dashboard')}
        </h2>
        
        <Card className="bg-(--md-sys-color-surface-container-highest)">
          <List>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <ListItem
                    onClick={() => {}}
                    leading={
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isActive 
                          ? 'bg-(--md-sys-color-primary-container)' 
                          : 'bg-(--md-sys-color-surface-container)'
                      }`}>
                        <span className={`mdi text-lg ${
                          isActive 
                            ? 'text-(--md-sys-color-on-primary-container)' 
                            : 'text-(--md-sys-color-on-surface-variant)'
                        }`}>
                          {item.icon}
                        </span>
                      </div>
                    }
                    className={`${
                      isActive 
                        ? 'bg-(--md-sys-color-surface-container-highest)' 
                        : 'hover:bg-(--md-state-layers-on-surface-opacity-008)'
                    } transition-colors`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${
                        isActive 
                          ? 'text-(--md-sys-color-on-surface)' 
                          : 'text-(--md-sys-color-on-surface-variant)'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  </ListItem>
                </Link>
              );
            })}
          </List>
        </Card>
      </div>
    </nav>
  );
}