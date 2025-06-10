'use client';

import Carousel from "@/components/Carousel";
import Image from "next/image";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ProductGrid from "@/components/homepage/ProductGrid";
import TextField from "@/components/TextField";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/utils/localization";

/**
 * Homepage with responsive design and API integration
 * Following Material Design v3 guidelines
 */
export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note: Removed automatic admin redirect to prevent infinite loops
  // Admin users can access the homepage and navigate to admin section manually
  
  // Fetch categories and products
  const { data: categories = [] } = useCategories();
  const { data: productsResponse } = useProducts();

  // Extract products array from paginated response
  const products = productsResponse?.content || [];

  // Get featured products (first 6)
  const featuredProducts = products.slice(0, 6);

  // Get popular categories (first 8)
  const popularCategories = categories.slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Carousel */}
      <section className="relative">
        <div className="h-[200px] md:h-[400px]">
          <Carousel 
            autoPlay={true} 
            autoPlayInterval={5000}
            className="rounded-none"
          >
            <div className="w-full h-full relative">
              <Image
                src="/dummy/1.png"
                alt="Banner 1"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-2xl md:text-4xl font-bold mb-2">
                    Chào mừng đến VDT Store
                  </h1>
                  <p className="text-sm md:text-lg">
                    Mua sắm online dễ dàng, giao hàng nhanh chóng
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full h-full relative">
              <Image
                src="/dummy/2.png"
                alt="Banner 2"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    Khuyến mãi hấp dẫn
                  </h2>
                  <p className="text-sm md:text-lg">
                    Giảm giá lên đến 50% cho nhiều sản phẩm
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full h-full relative">
              <Image
                src="/dummy/3.png"
                alt="Banner 3"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    Sản phẩm chất lượng
                  </h2>
                  <p className="text-sm md:text-lg">
                    Đảm bảo nguồn gốc, chất lượng cao
                  </p>
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-(--md-sys-color-surface-container) py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-(--md-sys-color-on-surface)">
              Hôm nay bạn muốn mua gì?
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <TextField
                label={t('common.searchProducts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchProductsPlaceholder')}
                className="flex-1"
                leadingIcon="search"
              />
              <Button
                type="submit"
                variant="filled"
                label={t('common.search')}
                // className="px-6"
              />
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-(--md-sys-color-on-surface)">
              Danh mục phổ biến
            </h2>
            <Link href="/products">
              <Button
                variant="text"
                label="Xem tất cả"
                hasIcon={true}
                icon="arrow_forward"
              />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="block"
              >
                <Card variant="filled" className="p-4 text-center hover:shadow-lg transition-shadow">
                  <div className="aspect-square w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-(--md-sys-color-surface-variant)">
                    <Image
                      src={category.imageUrl || '/dummy/1.png'}
                      alt={category.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-(--md-sys-color-on-surface) line-clamp-2">
                    {category.name}
                  </h3>
                  {category.productCount !== undefined && (
                    <p className="text-xs text-(--md-sys-color-on-surface-variant) mt-1">
                      {category.productCount} SP
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 bg-(--md-sys-color-surface-container-low)">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-(--md-sys-color-on-surface)">
              Sản phẩm nổi bật
            </h2>
            <Link href="/products">
              <Button
                variant="text"
                label="Xem thêm"
                hasIcon={true}
                icon="arrow_forward"
              />
            </Link>
          </div>
          
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-(--md-sys-color-on-surface)">
            Dịch vụ của chúng tôi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card variant="filled" className="p-6 text-center">
              <span className="mdi text-4xl text-(--md-sys-color-primary) mb-4 block">
                local_shipping
              </span>
              <h3 className="text-lg font-semibold mb-2 text-(--md-sys-color-on-surface)">
                Giao hàng nhanh
              </h3>
              <p className="text-(--md-sys-color-on-surface-variant) text-sm">
                Giao hàng trong ngày, miễn phí với đơn hàng từ 200k
              </p>
            </Card>
            
            <Card variant="filled" className="p-6 text-center">
              <span className="mdi text-4xl text-(--md-sys-color-primary) mb-4 block">
                verified
              </span>
              <h3 className="text-lg font-semibold mb-2 text-(--md-sys-color-on-surface)">
                Chất lượng đảm bảo
              </h3>
              <p className="text-(--md-sys-color-on-surface-variant) text-sm">
                Sản phẩm chính hãng, có tem chứng nhận chất lượng
              </p>
            </Card>
            
            <Card variant="filled" className="p-6 text-center">
              <span className="mdi text-4xl text-(--md-sys-color-primary) mb-4 block">
                support_agent
              </span>
              <h3 className="text-lg font-semibold mb-2 text-(--md-sys-color-on-surface)">
                Hỗ trợ 24/7
              </h3>
              <p className="text-(--md-sys-color-on-surface-variant) text-sm">
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
