'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import TextArea from '@/components/TextArea';
import { useRouter } from 'next/navigation';
import { useAuth, useCurrentUser, useUpdateProfile, useChangePassword } from '@/hooks/useUsers';
import Image from 'next/image';
import { cn } from '@/utils/cn';

/**
 * Profile page for user account management
 * Responsive design with Material Design v3 components
 */
export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('info');
  
  // Get user data
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
    refetch
  } = useCurrentUser();
  
  // Update profile mutation
  const updateProfileMutation = useUpdateProfile();
  
  // Change password mutation
  const changePasswordMutation = useChangePassword();
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '', // Keep this for profile image display
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatarUrl: user.image || ''
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      alert('Thông tin cá nhân đã được cập nhật!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
  };

  // Handle loading and authentication states
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-(--md-sys-color-on-surface)">
          Tài khoản của tôi
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-(--md-sys-color-surface-variant) rounded"></div>
          <div className="h-32 bg-(--md-sys-color-surface-variant) rounded"></div>
          <div className="h-32 bg-(--md-sys-color-surface-variant) rounded"></div>
        </div>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-(--md-sys-color-on-surface)">
          Tài khoản của tôi
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-(--md-sys-color-surface-variant) rounded"></div>
          <div className="h-32 bg-(--md-sys-color-surface-variant) rounded"></div>
          <div className="h-32 bg-(--md-sys-color-surface-variant) rounded"></div>
        </div>
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-(--md-sys-color-on-surface)">
          Tài khoản của tôi
        </h1>
        <Card variant="filled" className="p-6 text-center">
          <span className="mdi text-6xl text-(--md-sys-color-error) mb-4 block">error</span>
          <h3 className="text-xl font-semibold mb-2 text-(--md-sys-color-on-surface)">
            Không thể tải thông tin tài khoản
          </h3>
          <p className="text-(--md-sys-color-on-surface-variant) mb-4">
            Đã xảy ra lỗi khi tải thông tin tài khoản
          </p>
          <Button 
            variant="filled"
            label="Thử lại"
            onClick={() => refetch()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold mb-6 text-(--md-sys-color-on-surface)">Tài khoản của tôi</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile sidebar */}
        <aside className="md:w-1/3">
          <Card variant="elevated" className="p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden bg-(--md-sys-color-surface-variant) flex items-center justify-center">
                {formData.avatarUrl ? (
                  <Image 
                    src={formData.avatarUrl} 
                    alt={formData.name || 'User profile'} 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <span className="flex items-center justify-center mdi text-(--md-sys-color-on-surface-variant) text-center">
                    person
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-(--md-sys-color-on-surface)">
                {formData.name || 'Người dùng'}
              </h2>
              
              <p className="text-sm text-(--md-sys-color-on-surface-variant) mb-6">
                {formData.email}
              </p>
              
              {/* Upload avatar button */}
              <Button
                variant="outlined"
                label="Thay đổi ảnh đại diện"
                className="w-full mb-4 text-sm"
                icon="upload_file"
                hasIcon
                onClick={() => {/* Handle avatar upload */}}
              />
              
              <div className="w-full border-t border-(--md-sys-color-outline-variant) pt-4 mt-4">
                <p className="text-sm text-left mb-2 font-medium text-(--md-sys-color-on-surface)">
                  Tài khoản
                </p>
                
                <div className="space-y-2">
                  <Button
                    variant={activeTab === 'info' ? 'filled' : 'text'}
                    label="Thông tin cá nhân"
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('info')}
                    icon="person"
                    hasIcon
                  />
                  
                  <Button
                    variant={activeTab === 'security' ? 'filled' : 'text'}
                    label="Bảo mật"
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('security')}
                    icon="lock"
                    hasIcon
                  />
                  
                  <Button
                    variant={activeTab === 'addresses' ? 'filled' : 'text'}
                    label="Địa chỉ"
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab('addresses')}
                    icon="home"
                    hasIcon
                  />
                  
                  <Button
                    variant="text"
                    label="Đơn hàng của tôi"
                    className="w-full justify-start text-sm"
                    onClick={() => router.push('/orders')}
                    icon="shopping_bag"
                    hasIcon
                  />
                </div>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main content */}
        <div className="md:flex-1">
          <Card variant="elevated" className="p-6">
            {activeTab === 'info' && (
              <>
                <h3 className="text-xl font-medium mb-6 text-(--md-sys-color-on-surface)">
                  Thông tin cá nhân
                </h3>
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="space-y-4">
                    <TextField
                      label="Họ và tên"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên"
        
                    />
                    
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      disabled
                      supportingText="Email không thể thay đổi"
                    />
                    
                    <TextField
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
        
                    />
                    
                    <TextArea
                      label="Địa chỉ"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Nhập địa chỉ"
                      rows={4}
        
                    />
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="filled"
                        label="Lưu thay đổi"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                  </div>
                </form>
              </>
            )}
            
            {activeTab === 'security' && (
              <>
                <h3 className="text-xl font-medium mb-6 text-(--md-sys-color-on-surface)">
                  Thay đổi mật khẩu
                </h3>
                
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <TextField
                      label="Mật khẩu hiện tại"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu hiện tại"
        
                      required
                    />
                    
                    <TextField
                      label="Mật khẩu mới"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu mới"
        
                      required
                    />
                    
                    <TextField
                      label="Xác nhận mật khẩu mới"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Mật khẩu không khớp' : undefined}
                    />
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="filled"
                        label="Đổi mật khẩu"
                        disabled={changePasswordMutation.isPending}
                      />
                    </div>
                  </div>
                </form>
                
                <div className={cn(
                  "mt-8 p-4 rounded",
                  "bg-(--md-sys-color-error-container)",
                  "text-(--md-sys-color-on-error-container)"
                )}>
                  <h4 className="text-lg font-medium mb-2">Vô hiệu hóa tài khoản</h4>
                  <p className="text-sm mb-4">
                    Khi vô hiệu hóa tài khoản, bạn sẽ không thể đăng nhập hoặc sử dụng dịch vụ của chúng tôi.
                    Thông tin tài khoản sẽ được lưu trữ trong hệ thống.
                  </p>
                  <Button
                    variant="outlined"
                    label="Vô hiệu hóa tài khoản"
                    className="border-(--md-sys-color-error) text-(--md-sys-color-error)"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản?')) {
                        // Handle account deactivation
                      }
                    }}
                  />
                </div>
              </>
            )}
            
            {activeTab === 'addresses' && (
              <>
                <h3 className="text-xl font-medium mb-6 text-(--md-sys-color-on-surface)">
                  Quản lý địa chỉ
                </h3>
                
                <div className="space-y-4">
                  <Card variant="outlined" className="p-4 border-(--md-sys-color-outline)">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-(--md-sys-color-on-surface)">Địa chỉ nhà riêng</div>
                        <div className="text-sm text-(--md-sys-color-on-surface-variant) mt-1">
                          {formData.address || 'Chưa có địa chỉ'}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="text"
                          label="Sửa"
                          className="text-xs"
                          icon="edit"
                          hasIcon
                          onClick={() => setActiveTab('info')}
                        />
                      </div>
                    </div>
                  </Card>
                  
                  <Button
                    variant="outlined"
                    label="Thêm địa chỉ mới"
                    icon="add"
                    hasIcon
                    className="mt-4"
                    onClick={() => setActiveTab('info')}
                  />
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
