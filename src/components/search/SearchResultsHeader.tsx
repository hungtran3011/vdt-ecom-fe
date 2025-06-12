'use client';

import React from 'react';
import Select from '@/components/Select';
import Button from '@/components/Button';
import { cn } from '@/utils/cn';
import { SearchMetadata } from '@/services/searchService';

interface SearchResultsHeaderProps {
  query?: string;
  metadata?: SearchMetadata;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  viewMode?: 'grid' | 'list';
  onSortChange: (sortBy: string, direction: 'ASC' | 'DESC') => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'relevance-DESC', label: 'Độ liên quan' },
  { value: 'name-ASC', label: 'Tên A-Z' },
  { value: 'name-DESC', label: 'Tên Z-A' },
  { value: 'basePrice-ASC', label: 'Giá thấp đến cao' },
  { value: 'basePrice-DESC', label: 'Giá cao đến thấp' },
  { value: 'averageRating-DESC', label: 'Đánh giá cao nhất' },
  { value: 'reviewCount-DESC', label: 'Nhiều đánh giá nhất' },
  { value: 'createdAt-DESC', label: 'Mới nhất' },
  { value: 'createdAt-ASC', label: 'Cũ nhất' },
  { value: 'popularityScore-DESC', label: 'Phổ biến nhất' },
  { value: 'orderCount-DESC', label: 'Bán chạy nhất' },
];

export default function SearchResultsHeader({
  query,
  metadata,
  sortBy = 'relevance',
  sortDirection = 'DESC',
  viewMode = 'grid',
  onSortChange,
  onViewModeChange,
  className
}: SearchResultsHeaderProps) {
  const currentSort = `${sortBy}-${sortDirection}`;
  
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-');
    onSortChange(field, direction as 'ASC' | 'DESC');
  };

  const formatSearchTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${timeMs}ms`;
    }
    return `${(timeMs / 1000).toFixed(2)}s`;
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Search Query and Results Count */}
      {query && (
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-(--md-sys-color-on-surface)">
            Kết quả tìm kiếm cho <span className="text-(--md-sys-color-primary)">&ldquo;{query}&rdquo;</span>
          </h1>
          
          {metadata && (
            <div className="flex items-center gap-4 text-sm text-(--md-sys-color-on-surface-variant)">
              <span>
                {metadata.totalHits.toLocaleString()} sản phẩm
              </span>
              
              {metadata.searchTime && (
                <span>
                  ({formatSearchTime(metadata.searchTime)})
                </span>
              )}
              
              {metadata.page !== undefined && metadata.totalPages > 1 && (
                <span>
                  Trang {metadata.page + 1} của {metadata.totalPages}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 py-3 border-y border-(--md-sys-color-outline-variant)">
        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <Select
            label="Sắp xếp"
            value={currentSort}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            className="min-w-[200px]"
          />
        </div>

        {/* View Mode and Actions */}
        <div className="flex items-center gap-2">
          {/* Search Quality Score */}
          {metadata?.maxScore && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-(--md-sys-color-on-surface-variant)">
              <span>Độ chính xác:</span>
              <div className="w-16 h-2 bg-(--md-sys-color-outline-variant) rounded-full overflow-hidden">
                <div 
                  className="h-full bg-(--md-sys-color-primary) transition-all duration-300"
                  style={{ width: `${Math.min((metadata.maxScore / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center bg-(--md-sys-color-surface-container) rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'filled' : 'text'}
                onClick={() => onViewModeChange('grid')}
                icon="grid_view"
                hasIcon
                className="!px-2 !py-1 !min-h-8"
                label=""
              />
              <Button
                variant={viewMode === 'list' ? 'filled' : 'text'}
                onClick={() => onViewModeChange('list')}
                icon="view_list"
                hasIcon
                className="!px-2 !py-1 !min-h-8"
                label=""
              />
            </div>
          )}

          {/* Results per page info */}
          {metadata && (
            <span className="text-xs text-(--md-sys-color-on-surface-variant) hidden sm:block">
              {((metadata.page || 0) * (metadata.size || 20) + 1)}-{Math.min(((metadata.page || 0) + 1) * (metadata.size || 20), metadata.totalHits)} 
              / {metadata.totalHits.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Quick Filters or Breadcrumbs */}
      {metadata?.totalHits === 0 && query && (
        <div className="bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="mdi">info</span>
            <span className="font-medium">Không tìm thấy kết quả</span>
          </div>
          <p className="mt-1 text-sm">
            Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
          </p>
        </div>
      )}
    </div>
  );
}
