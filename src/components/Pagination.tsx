'use client';

import { useMemo } from 'react';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Select from '@/components/Select';
import { PaginationInfo, PaginationControls, PAGE_SIZE_OPTIONS } from '@/types/Pagination';

interface PaginationProps {
  paginationInfo: PaginationInfo;
  controls: PaginationControls;
  className?: string;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  disabled?: boolean;
}

export default function Pagination({
  paginationInfo,
  controls,
  className = "",
  showPageSizeSelector = true,
  showPageInfo = true,
  showFirstLast = true,
  disabled = false
}: PaginationProps) {
  const {
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    hasNext,
    hasPrevious
  } = paginationInfo;

  const {
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    setPageSize
  } = controls;

  // Generate page numbers to show
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-(--md-sys-color-surface) ${className}`}>
      {/* Page info and page size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {showPageInfo && (
          <div className="text-sm text-(--md-sys-color-on-surface-variant)">
            Showing {startItem}-{endItem} of {totalElements} items
          </div>
        )}
        
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-(--md-sys-color-on-surface-variant)">
              Items per page:
            </span>
            <Select
              label="Page size"
              value={pageSize.toString()}
              onChange={(value) => setPageSize(parseInt(value))}
              options={PAGE_SIZE_OPTIONS.map(size => ({
                value: size.toString(),
                label: size.toString()
              }))}
              disabled={disabled}
              className="w-20"
            />
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        {showFirstLast && (
          <IconButton
            icon="first_page"
            onClick={goToFirst}
            disabled={disabled || !hasPrevious}
            variant="standard"
            size="small"
            aria-label="Go to first page"
          />
        )}

        {/* Previous page button */}
        <IconButton
          icon="chevron_left"
          onClick={goToPrevious}
          disabled={disabled || !hasPrevious}
          variant="standard"
          size="small"
          aria-label="Go to previous page"
        />

        {/* Page number buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-(--md-sys-color-on-surface-variant)"
                >
                  ...
                </span>
              );
            }

            const pageIndex = typeof pageNum === 'number' ? pageNum - 1 : 0;
            const isCurrentPage = pageIndex === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "filled" : "text"}
                label={pageNum.toString()}
                onClick={() => goToPage(pageIndex)}
                disabled={disabled}
                className="min-w-10 h-10"
              />
            );
          })}
        </div>

        {/* Next page button */}
        <IconButton
          icon="chevron_right"
          onClick={goToNext}
          disabled={disabled || !hasNext}
          variant="standard"
          size="small"
          aria-label="Go to next page"
        />

        {/* Last page button */}
        {showFirstLast && (
          <IconButton
            icon="last_page"
            onClick={goToLast}
            disabled={disabled || !hasNext}
            variant="standard"
            size="small"
            aria-label="Go to last page"
          />
        )}
      </div>
    </div>
  );
}
