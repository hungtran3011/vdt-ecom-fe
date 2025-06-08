'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { useSearchProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/homepage/ProductGrid';
import { cn } from '@/utils/cn';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Only trigger the search when the user submits
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useSearchProducts(submittedQuery, isSearching);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    setIsSearching(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-(--md-sys-color-on-surface)">Tìm kiếm sản phẩm</h1>
      
      <Card variant="filled" className="mb-8">
        <form onSubmit={handleSearch} className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <TextField
              label="Nhập từ khóa tìm kiếm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              required
              placeholder="Ví dụ: áo thun, quần jean, giày..."
              className="flex-grow"
            />
            <Button
              type="submit"
              variant="filled"
              label="Tìm kiếm"
              className="sm:self-end"
              disabled={isLoading || !searchQuery.trim()}
              icon="search"
              hasIcon
            />
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {['Điện thoại', 'Laptop', 'Thời trang', 'Mỹ phẩm', 'Gia dụng'].map((tag) => (
              <Button
                key={tag}
                variant="text"
                label={tag}
                className="text-xs py-1 px-2"
                onClick={() => {
                  setSearchQuery(tag);
                }}
              />
            ))}
          </div>
        </form>
      </Card>

      {isSearching && (
        <div className="mb-4">
          <div className="text-lg font-medium text-(--md-sys-color-on-surface)">
            {isLoading ? (
              'Đang tìm kiếm...'
            ) : (
              <>
                Kết quả tìm kiếm cho <span className="font-bold">{submittedQuery}</span>
                {!isError && ` (${products.length} sản phẩm)`}
              </>
            )}
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="elevated" className="h-64 animate-pulse">
              <div className="h-full flex flex-col">
                <div className="h-40 bg-(--md-sys-color-surface-variant)"></div>
                <div className="p-3 flex-grow">
                  <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-(--md-sys-color-outline-variant) rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card variant="outlined" className="text-center py-12">
          <div className="text-(--md-sys-color-error) mb-4">
            {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tìm kiếm'}
          </div>
          <Button 
            variant="filled"
            onClick={handleSearch}
            label="Thử lại"
          />
        </Card>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : isSearching ? (
        <div className={cn(
          "text-center py-16",
          "bg-(--md-sys-color-surface-container) rounded-lg",
          "text-(--md-sys-color-on-surface-variant)"
        )}>
          <span className="mdi text-6xl block mb-4">search_off</span>
          <p className="text-lg">Không tìm thấy sản phẩm phù hợp</p>
          <p className="text-sm mt-2">Vui lòng thử lại với từ khóa khác</p>
        </div>
      ) : null}
    </div>
  );
}
