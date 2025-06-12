'use client';
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/providers/QueryProvider";
import EnhancedCartProvider from "@/contexts/EnhancedCartContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-(--md-sys-color-background)">
        <SessionProvider>
          <QueryProvider>
            <EnhancedCartProvider>
              {children}
            </EnhancedCartProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}