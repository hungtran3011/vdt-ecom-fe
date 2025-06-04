'use client';
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-(--md-sys-color-background)">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}