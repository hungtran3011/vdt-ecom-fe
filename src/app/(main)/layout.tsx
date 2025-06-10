import type { Metadata } from "next";
import "@/app/globals.css";
import MainLayout from "@/components/main/MainLayout";

export const metadata: Metadata = {
  title: "VDT E-Commerce",
  description: "Shop online for all your needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
