'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ProductGrid from '@/components/homepage/ProductGrid';
import EnhancedSearchBox from '@/components/EnhancedSearchBox';
import FacetedSearchSidebar from '@/components/search/FacetedSearchSidebar';
import SearchResultsHeader from '@/components/search/SearchResultsHeader';
import { cn } from '@/utils/cn';
import { 
  useComprehensiveSearch, 
  useSearchState, 
  usePopularQueries 
} from '@/hooks/useSearch';
import { ProductSearchDocument } from '@/services/searchService';
import { Product } from '@/types/Product';

// Helper function to convert search documents to products
const convertSearchDocumentToProduct = (doc: ProductSearchDocument): Product => ({
  id: parseInt(doc.id),
  name: doc.name,
  description: doc.description,
  basePrice: doc.basePrice,
  images: doc.imageUrls,
  categoryId: doc.categoryId,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Enhanced search state management
  const {
    searchRequest,
    updateQuery,
    updateFilters,
    updateSort,
    resetFilters,
  } = useSearchState();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Get initial query from URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== searchRequest.query) {
      updateQuery(urlQuery);
    }
  }, [searchParams, updateQuery, searchRequest.query]);

  // Use comprehensive search with all features
  const {
    products: searchProducts,
    metadata,
    facets,
    isLoading,
    isError,
    error,
    trackProductClick,
  } = useComprehensiveSearch(
    searchRequest, 
    !!searchRequest.query || Object.keys(searchRequest.filters || {}).length > 0
  );

  // Get popular queries for quick access
  const { data: popularQueries = [] } = usePopularQueries(8);

  // Convert search documents to products
  const products = searchProducts?.map(convertSearchDocumentToProduct) || [];
  const isSearching = !!searchRequest.query;

  const handleSearch = useCallback((query: string) => {
    updateQuery(query);
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', query);
    router.push(`/search?${newParams.toString()}`);
  }, [updateQuery, router, searchParams]);

  const handleSortChange = useCallback((sortBy: string, sortDirection: 'ASC' | 'DESC') => {
    updateSort(sortBy, sortDirection);
  }, [updateSort]);

  const handleFilterChange = useCallback((filterKey: string, value: unknown) => {
    updateFilters({ [filterKey]: value });
  }, [updateFilters]);

  const handleProductClick = useCallback((productId: number, position: number) => {
    if (searchRequest.query) {
      trackProductClick(productId.toString(), position);
    }
  }, [searchRequest.query, trackProductClick]);

  const clearAllFilters = () => {
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-(--md-sys-color-background)">
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Search Box */}
        <div className="mb-6">
          <EnhancedSearchBox
            placeholder="Tìm kiếm sản phẩm..."
            onSearch={handleSearch}
            autoFocus={!isSearching}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Search Results Layout */}
        {isSearching && (
          <div className="flex gap-6">
            {/* Sidebar with Faceted Search */}
            <div className={cn(
              "w-80 flex-shrink-0 transition-all duration-300",
              showSidebar ? "block" : "hidden lg:block"
            )}>
              <FacetedSearchSidebar
                facets={facets || {}}
                selectedFilters={searchRequest.filters || {}}
                onFilterChange={handleFilterChange}
                onClearFilters={clearAllFilters}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <SearchResultsHeader
                query={searchRequest.query}
                metadata={metadata}
                sortBy={searchRequest.sortBy}
                sortDirection={searchRequest.sortDirection}
                viewMode={viewMode}
                onSortChange={handleSortChange}
                onViewModeChange={setViewMode}
                className="mb-6"
              />

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outlined"
                  label="Bộ lọc"
                  onClick={() => setShowSidebar(!showSidebar)}
                  icon="tune"
                  hasIcon
                />
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
                /* Error State */
                <Card variant="outlined" className="text-center py-12">
                  <div className="text-(--md-sys-color-error) mb-4">
                    <span className="mdi text-4xl block mb-2">error_outline</span>
                    {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tìm kiếm'}
                  </div>
                  <Button 
                    variant="filled"
                    onClick={() => window.location.reload()}
                    label="Thử lại"
                    icon="refresh"
                    hasIcon
                  />
                </Card>
              ) : products.length > 0 ? (
                /* Products Grid */
                <>
                  <ProductGrid products={products} onProductClick={handleProductClick} />
                  
                  {/* Pagination Info */}
                  {metadata && metadata.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outlined"
                          label="Trước"
                          disabled={metadata.page === 0}
                          icon="chevron_left"
                          hasIcon
                        />
                        <span className="px-4 py-2 text-(--md-sys-color-on-surface)">
                          Trang {metadata.page + 1} / {metadata.totalPages}
                        </span>
                        <Button
                          variant="outlined"
                          label="Sau"
                          disabled={metadata.page >= metadata.totalPages - 1}
                          icon="chevron_right"
                          hasIcon
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* No Results State */
                <div className={cn(
                  "text-center py-16",
                  "bg-(--md-sys-color-surface-container) rounded-lg",
                  "text-(--md-sys-color-on-surface-variant)"
                )}>
                  <span className="mdi text-6xl block mb-4">search_off</span>
                  <h3 className="text-xl font-medium mb-2">Không tìm thấy sản phẩm phù hợp</h3>
                  <p className="text-sm mb-4">
                    Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc
                  </p>
                  <Button
                    variant="outlined"
                    label="Xóa bộ lọc"
                    onClick={clearAllFilters}
                    icon="clear"
                    hasIcon
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial State - No Search Query */}
        {!isSearching && (
          <div className={cn(
            "text-center py-16",
            "bg-(--md-sys-color-surface-container) rounded-lg",
            "text-(--md-sys-color-on-surface-variant)"
          )}>
            <span className="mdi text-6xl block mb-4">search</span>
            <h3 className="text-xl font-medium mb-2">Khám phá sản phẩm</h3>
            <p className="text-sm mb-6">
              Nhập từ khóa để bắt đầu tìm kiếm hoặc chọn từ các gợi ý phổ biến
            </p>
            
            {/* Popular Searches */}
            {popularQueries.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <p className="text-sm font-medium mb-4">Tìm kiếm phổ biến:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularQueries.map((query) => (
                    <Button
                      key={query}
                      variant="outlined"
                      label={query}
                      className="text-sm"
                      onClick={() => handleSearch(query)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
