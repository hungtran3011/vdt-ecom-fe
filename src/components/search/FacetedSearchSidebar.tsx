'use client';

import React from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { cn } from '@/utils/cn';
import { FacetResult, SearchFilters } from '@/services/searchService';

interface FacetedSearchSidebarProps {
  facets: Record<string, FacetResult[]>;
  selectedFilters: SearchFilters;
  onFilterChange: (filterKey: string, value: unknown) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FacetSectionProps {
  title: string;
  facets: FacetResult[];
  selectedValues: (string | number)[];
  onSelectionChange: (values: (string | number)[]) => void;
  type?: 'checkbox' | 'radio';
  showCount?: boolean;
  maxVisible?: number;
}

function FacetSection({ 
  title, 
  facets, 
  selectedValues = [], 
  onSelectionChange,
  type = 'checkbox',
  showCount = true,
  maxVisible = 5
}: FacetSectionProps) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleFacets = showAll ? facets : facets.slice(0, maxVisible);
  const hasMore = facets.length > maxVisible;

  const handleSelection = (facetKey: string) => {
    if (type === 'radio') {
      onSelectionChange([facetKey]);
    } else {
      const newSelection = selectedValues.includes(facetKey)
        ? selectedValues.filter(v => v !== facetKey)
        : [...selectedValues, facetKey];
      onSelectionChange(newSelection);
    }
  };

  if (facets.length === 0) return null;

  return (
    <div className="border-b border-(--md-sys-color-outline-variant) pb-4 mb-4 last:border-b-0 last:mb-0">
      <h3 className="font-medium text-(--md-sys-color-on-surface) mb-3">{title}</h3>
      
      <div className="space-y-2">
        {visibleFacets.map((facet) => {
          const isSelected = selectedValues.includes(facet.key);
          
          return (
            <label
              key={facet.key}
              className={cn(
                "flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors",
                "hover:bg-(--md-sys-color-on-surface) hover:bg-opacity-4",
                isSelected && "bg-(--md-sys-color-primary) bg-opacity-8"
              )}
            >
              <input
                type={type}
                checked={isSelected}
                onChange={() => handleSelection(facet.key)}
                className="sr-only"
              />
              
              {/* Custom checkbox/radio */}
              <div className={cn(
                "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                type === 'radio' && "rounded-full",
                isSelected 
                  ? "border-(--md-sys-color-primary) bg-(--md-sys-color-primary)" 
                  : "border-(--md-sys-color-outline)"
              )}>
                {isSelected && (
                  <span className={cn(
                    "text-white text-xs",
                    type === 'radio' ? "w-2 h-2 bg-white rounded-full" : "mdi"
                  )}>
                    {type === 'checkbox' ? 'check' : ''}
                  </span>
                )}
              </div>
              
              <span className="flex-1 text-(--md-sys-color-on-surface) text-sm">
                {facet.key}
              </span>
              
              {showCount && (
                <span className="text-(--md-sys-color-on-surface-variant) text-xs">
                  ({facet.count})
                </span>
              )}
            </label>
          );
        })}
      </div>

      {hasMore && (
        <Button
          variant="text"
          label={showAll ? "Ẩn bớt" : `Xem thêm (${facets.length - maxVisible})`}
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-sm"
        />
      )}
    </div>
  );
}

export default function FacetedSearchSidebar({
  facets,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  className
}: FacetedSearchSidebarProps) {
  const hasActiveFilters = Object.values(selectedFilters).some(
    value => Array.isArray(value) ? value.length > 0 : value !== undefined
  );

  return (
    <Card variant="outlined" className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-(--md-sys-color-on-surface)">
          Bộ lọc
        </h2>
        {hasActiveFilters && (
          <Button
            variant="text"
            label="Xóa tất cả"
            onClick={onClearFilters}
            className="text-sm"
            icon="close"
            hasIcon
          />
        )}
      </div>

      <div className="space-y-0">
        {/* Categories */}
        {facets.categories && (
          <FacetSection
            title="Danh mục"
            facets={facets.categories}
            selectedValues={selectedFilters.categoryIds || []}
            onSelectionChange={(values) => onFilterChange('categoryIds', values)}
            type="checkbox"
          />
        )}

        {/* Brands */}
        {facets.brands && (
          <FacetSection
            title="Thương hiệu"
            facets={facets.brands}
            selectedValues={selectedFilters.brands || []}
            onSelectionChange={(values) => onFilterChange('brands', values)}
            type="checkbox"
          />
        )}

        {/* Price Ranges */}
        {facets.priceRanges && (
          <FacetSection
            title="Khoảng giá"
            facets={facets.priceRanges}
            selectedValues={selectedFilters.priceRanges || []}
            onSelectionChange={(values) => onFilterChange('priceRanges', values)}
            type="radio"
          />
        )}

        {/* Ratings */}
        {facets.ratings && (
          <FacetSection
            title="Đánh giá"
            facets={facets.ratings}
            selectedValues={selectedFilters.ratings || []}
            onSelectionChange={(values) => onFilterChange('ratings', values)}
            type="checkbox"
          />
        )}

        {/* In Stock */}
        {facets.availability && (
          <FacetSection
            title="Tình trạng"
            facets={facets.availability}
            selectedValues={selectedFilters.inStock ? ['inStock'] : []}
            onSelectionChange={(values) => onFilterChange('inStock', values.includes('inStock'))}
            type="checkbox"
            showCount={false}
          />
        )}

        {/* Tags */}
        {facets.tags && (
          <FacetSection
            title="Nhãn"
            facets={facets.tags}
            selectedValues={selectedFilters.tags || []}
            onSelectionChange={(values) => onFilterChange('tags', values)}
            type="checkbox"
            maxVisible={8}
          />
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-(--md-sys-color-outline-variant)">
          <h4 className="text-sm font-medium text-(--md-sys-color-on-surface) mb-2">
            Bộ lọc đang áp dụng:
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const displayValue = Array.isArray(value) ? value.join(', ') : value;
              
              return (
                <span
                  key={key}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                    "bg-(--md-sys-color-primary) bg-opacity-12",
                    "text-(--md-sys-color-primary)"
                  )}
                >
                  {displayValue}
                  <button
                    onClick={() => onFilterChange(key, Array.isArray(value) ? [] : undefined)}
                    className="hover:bg-(--md-sys-color-primary) hover:bg-opacity-20 rounded-full p-0.5"
                  >
                    <span className="mdi text-xs">close</span>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
