import '@/app/globals.css'; // Ensure global styles are imported
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBottomNav from '@/components/admin/AdminBottomNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-(--md-sys-color-surface-container-low)">
        <AdminHeader />
        
        <div className="flex">
          {/* Sidebar - Hidden on mobile */}
          <AdminSidebar />
          
          {/* Main Content with bottom padding on mobile for navigation bar */}
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 bg-(--md-sys-color-surface)">
            {children}
          </main>
        </div>
        
        {/* Bottom Navigation - Visible only on mobile */}
        <AdminBottomNav />
      </div>
    </AdminAuthWrapper>
  );
}