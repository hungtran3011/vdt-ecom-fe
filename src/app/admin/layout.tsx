import '@/app/globals.css'; // Ensure global styles are imported
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import '@/app/globals.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-100">
        <AdminHeader />
        
        <div className="flex">
          <AdminSidebar />
          
          {/* Main Content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  );
}