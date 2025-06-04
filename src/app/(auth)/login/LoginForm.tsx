'use client';
import React, { useState } from 'react';
import Button from '@/components/Button';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleKeycloakLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // This will redirect to Keycloak login page
      await signIn('keycloak', { 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      setError('Đã xảy ra lỗi khi đăng nhập');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="w-full max-w-[462px] text-center text-sm text-(--md-sys-color-error) mb-4">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col justify-start items-start gap-4 w-full max-w-[462px]">
        <Button
          variant="filled"
          label={isLoading ? "Đang chuyển hướng..." : "Đăng nhập với Keycloak"}
          onClick={handleKeycloakLogin}
          disabled={isLoading}
          className="w-full bg-(--md-sys-color-primary) text-(--md-sys-color-on-primary)"
        />
        
        <div className="w-full text-center text-sm text-(--md-sys-color-on-surface-variant)">
          Bạn sẽ được chuyển hướng đến trang đăng nhập của Keycloak
        </div>
      </div>
    </>
  );
}