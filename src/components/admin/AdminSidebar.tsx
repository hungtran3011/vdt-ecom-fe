import Link from 'next/link';

const menuItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: '📊'
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: '👥'
  },
  {
    href: '/admin/products',
    label: 'Products',
    icon: '📦'
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: '🛒'
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: '📂'
  }
];

export default function AdminSidebar() {
  return (
    <nav className="w-64 bg-white shadow-md h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}