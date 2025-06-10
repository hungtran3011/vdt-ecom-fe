'use client';
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/providers/QueryProvider";
import { CartProvider } from "@/contexts/CartContext";

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
            <CartProvider>
              {children}
            </CartProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}