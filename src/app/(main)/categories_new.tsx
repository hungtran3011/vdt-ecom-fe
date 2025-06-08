'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card from '@/components/Card';
import { List, ListItem } from '@/components/List';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { t } from '@/utils/localization';
import { cn } from '@/utils/cn';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch categories and products
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    categoryId: selectedCategory || undefined,
    search: searchTerm
  });

  const products = productsResponse?.content || [];

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleViewAllProducts = () => {
    setSelectedCategory(null);
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-(--md-sys-color-background) p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-(--md-sys-color-on-surface-variant)">
              Đang tải danh mục...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--md-sys-color-background)">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--md-sys-color-on-surface) mb-4">
            Danh mục sản phẩm
          </h1>
          
          {/* Search */}
          <TextField
            label="Tìm kiếm danh mục"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nhập tên danh mục..."
            leadingIcon="search"
            className="max-w-md"
          />

          {/* View All Products Button */}
          <div className="mt-4">
            <Button
              variant={selectedCategory ? "outlined" : "filled"}
              label="Xem tất cả sản phẩm"
              onClick={handleViewAllProducts}
              hasIcon
              icon="apps"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
                  Tất cả danh mục
                </h2>
                
                <List>
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
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {selectedCategory && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-(--md-sys-color-on-surface-variant)">
                  <span className="mdi">category</span>
                  <span>
                    {categories.find(cat => cat.id === selectedCategory)?.name}
                  </span>
                  <span className="mdi">chevron_right</span>
                  <span>{products.length} sản phẩm</span>
                </div>
              </div>
            )}

            {productsLoading ? (
              <Card>
                <div className="p-8 text-center">
                  <div className="text-(--md-sys-color-on-surface-variant)">
                    Đang tải sản phẩm...
                  </div>
                </div>
              </Card>
            ) : products.length === 0 ? (
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
                  <p className="text-(--md-sys-color-on-surface-variant)">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      {/* Product Image */}
                      <div className="aspect-square bg-(--md-sys-color-surface-container-highest) relative overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="mdi text-4xl text-(--md-sys-color-on-surface-variant)">
                              image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-(--md-sys-color-on-surface) mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {product.description && (
                          <p className="text-sm text-(--md-sys-color-on-surface-variant) mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-(--md-sys-color-primary)">
                            {product.basePrice.toLocaleString('vi-VN')}₫
                          </div>
                          
                          {product.category && (
                            <div className="text-xs text-(--md-sys-color-on-surface-variant) bg-(--md-sys-color-surface-container-high) px-2 py-1 rounded">
                              {product.category.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
