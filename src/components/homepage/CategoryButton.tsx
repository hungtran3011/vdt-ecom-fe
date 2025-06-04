"use client";

import Button from "@/components/Button";

interface CategoryButtonProps {
  href: string;
}

export default function CategoryButton({ href }: CategoryButtonProps) {
  return (
    <Button
      className="text-2xl rounded-xs hover:rounded-full transition-all duration-300 hover:ease-[cubic-bezier(0.05,0.7,0.1,1.0)] ease-[cubic-bezier(0.3,0.0,0.8,0.15)]"
      onClick={() => (window.location.href = href)}
    >
      Nhấn để xem tất cả danh mục
    </Button>
  );
}