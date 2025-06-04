import React from 'react';
import Link from 'next/link';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-(--md-sys-color-surface-container) flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[954px] bg-white overflow-hidden flex flex-col justify-center items-center gap-16 py-16 px-8">
        {/* Header */}
        <header className="w-full text-center">
          <h1 className="text-(--md-sys-color-on-surface) text-2xl font-normal leading-4 tracking-[0.5px]">
            Đăng nhập
          </h1>
        </header>

        {/* Form Section - Only Keycloak login */}
        <LoginForm />

        {/* Additional info */}
        <div className="w-full max-w-[520px] text-center">
          <p className="text-black text-sm font-medium leading-5 tracking-[0.1px]">
            Sử dụng tài khoản Keycloak để đăng nhập vào hệ thống
          </p>
        </div>
      </div>
    </div>
  );
}