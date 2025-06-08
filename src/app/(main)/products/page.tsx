'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import ProductCard from '@/components/ProductCard';
import { List, ListItem } from '@/components/List';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/Product';
import { cn } from '@/utils/cn';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('category') ? parseInt(searchParams.get('category')!) : null
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('minPrice') || '', 
    max: searchParams.get('maxPrice') || '' 
  });

  // Fetch categories and products
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    categoryId: selectedCategory || undefined,
    search: searchTerm,
    minPrice: priceRange.min ? parseInt(priceRange.min) : undefined,
    maxPrice: priceRange.max ? parseInt(priceRange.max) : undefined,
  });

  const products = productsResponse?.content || [];

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    updateURL({ category: categoryId?.toString() || '' });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateURL({ search: value });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURL({ sort: value });
  };

  const handlePriceFilter = () => {
    updateURL({ 
      minPrice: priceRange.min, 
      maxPrice: priceRange.max 
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    router.push('/products');
  };

  const updateURL = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    router.push(`/products?${newSearchParams.toString()}`);
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-(--md-sys-color-background) p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-(--md-sys-color-on-surface-variant)">
              Đang tải sản phẩm...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--md-sys-color-background)">
      <div className="max-w-7xl mx-auto p-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-(--md-sys-color-on-surface-variant)">
          <Link href="/" className="hover:text-(--md-sys-color-on-surface) transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">›</span>
          <span>Sản phẩm</span>
          {selectedCategory && (
            <>
              <span className="mx-2">›</span>
              <span>{categories.find(cat => cat.id === selectedCategory)?.name}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--md-sys-color-on-surface) mb-4">
            {selectedCategory 
              ? categories.find(cat => cat.id === selectedCategory)?.name || 'Sản phẩm'
              : 'Tất cả sản phẩm'
            }
          </h1>
          
          {/* Search */}
          <div className="max-w-md mb-4">
            <TextField
              label="Tìm kiếm sản phẩm"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              leadingIcon="search"
            />
          </div>

          {/* Show All Products Button */}
          <div className="mb-4">
            <Button
              variant={selectedCategory ? "outlined" : "filled"}
              label="Xem tất cả sản phẩm"
              onClick={() => handleCategorySelect(null)}
              hasIcon
              icon="apps"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories & Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
                  Danh mục sản phẩm
                </h2>
                
                <List>
                  <ListItem
                    onClick={() => handleCategorySelect(null)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      !selectedCategory && "bg-(--md-sys-color-primary-container)"
                    )}
                    leading={
                      <div className="w-12 h-12 rounded-lg bg-(--md-sys-color-surface-container-highest) flex items-center justify-center">
                        <span className="mdi text-(--md-sys-color-on-surface-variant)">
                          apps
                        </span>
                      </div>
                    }
                  >
                    <div className={cn(
                      "font-medium",
                      !selectedCategory 
                        ? "text-(--md-sys-color-on-primary-container)" 
                        : "text-(--md-sys-color-on-surface)"
                    )}>
                      Tất cả sản phẩm
                    </div>
                  </ListItem>
                  
                  {filteredCategories.map((category) => (
                    <ListItem
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedCategory === category.id && "bg-(--md-sys-color-primary-container)"
                      )}
                      leading={
                        category.imageUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-(--md-sys-color-surface-container-highest)">
                            <Image
                              src={category.imageUrl}
                              alt={category.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-(--md-sys-color-surface-container-highest) flex items-center justify-center">
                            <span className="mdi text-(--md-sys-color-on-surface-variant)">
                              category
                            </span>
                          </div>
                        )
                      }
                      trailing={
                        <div className="text-sm text-(--md-sys-color-on-surface-variant)">
                          {category.productCount || 0}
                        </div>
                      }
                      supportingText={category.description}
                    >
                      <div className={cn(
                        "font-medium",
                        selectedCategory === category.id 
                          ? "text-(--md-sys-color-on-primary-container)" 
                          : "text-(--md-sys-color-on-surface)"
                      )}>
                        {category.name}
                      </div>
                    </ListItem>
                  ))}
                </List>
              </div>
            </Card>

            {/* Price Filter */}
            <Card className="mt-4">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
                  Lọc theo giá
                </h3>
                <div className="space-y-3">
                  <TextField
                    label="Giá từ"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="0"
                  />
                  <TextField
                    label="Giá đến"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="999,999,999"
                  />
                  <Button
                    variant="outlined"
                    label="Áp dụng"
                    onClick={handlePriceFilter}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Clear Filters */}
            {/* {/* <Card className="mt-4"> */}
              <div className="p-4">
                <Button
                  variant="outlined"
                  label="Xóa tất cả bộ lọc"
                  onClick={clearFilters}
                  className="w-full"
                  hasIcon
                  icon="clear"
                />
              </div>
            {/* </Card> */}
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="text-sm text-(--md-sys-color-on-surface-variant)">
                {products.length > 0 ? (
                  <>
                    Hiển thị {products.length} sản phẩm
                    {selectedCategory && (
                      <span className="ml-2">
                        trong danh mục &quot;{categories.find(cat => cat.id === selectedCategory)?.name}&quot;
                      </span>
                    )}
                  </>
                ) : (
                  'Không có sản phẩm'
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-(--md-sys-color-on-surface-variant)">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-(--md-sys-color-surface-container) border border-(--md-sys-color-outline-variant) rounded-lg px-3 py-2 text-sm text-(--md-sys-color-on-surface) focus:outline-none focus:ring-2 focus:ring-(--md-sys-color-primary)"
                >
                  <option value="name">Tên A-Z</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {productsLoading ? (
              <Card>
                <div className="p-8 text-center">
                  <div className="text-(--md-sys-color-on-surface-variant)">
                    Đang tải sản phẩm...
                  </div>
                </div>
              </Card>
            ) : products.length === 0 ? (
              /* Empty State */
              <Card>
                <div className="p-8 text-center">
                  <span className="mdi text-4xl text-(--md-sys-color-on-surface-variant) mb-4 block">
                    inventory_2
                  </span>
                  <h3 className="text-lg font-medium text-(--md-sys-color-on-surface) mb-2">
                    {selectedCategory 
                      ? "Không có sản phẩm trong danh mục này"
                      : "Không tìm thấy sản phẩm"
                    }
                  </h3>
                  <p className="text-(--md-sys-color-on-surface-variant) mb-4">
                    Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
                  </p>
                  <Button
                    variant="outlined"
                    label="Xóa bộ lọc"
                    onClick={clearFilters}
                    hasIcon
                    icon="clear"
                  />
                </div>
              </Card>
            ) : (
              /* Products Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    size="medium"
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
