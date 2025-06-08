/**
 * Custom hook for pagination state management
 * Supports both offset-based and cursor-based pagination
 */

import { useState, useCallback, useMemo } from 'react';
import { PaginationParams, PaginationInfo, PaginationControls, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/types/Pagination';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number, pageSize: number, cursor?: string | number) => void;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = DEFAULT_PAGE,
    initialPageSize = DEFAULT_PAGE_SIZE,
    onPageChange
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [cursor, setCursor] = useState<string | number | undefined>();
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Calculate pagination info
  const paginationInfo = useMemo<PaginationInfo>(() => ({
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    hasNext: currentPage < totalPages - 1,
    hasPrevious: currentPage > 0,
    nextCursor: cursor,
    previousCursor: cursor
  }), [currentPage, pageSize, totalElements, totalPages, cursor]);

  // Generate pagination parameters for API calls
  const paginationParams = useMemo<PaginationParams>(() => ({
    page: currentPage,
    size: pageSize,
    cursor
  }), [currentPage, pageSize, cursor]);

  // Update pagination state from API response
  const updatePagination = useCallback((response: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    nextCursor?: string | number;
    previousCursor?: string | number;
  }) => {
    setCurrentPage(response.page);
    setPageSize(response.size);
    setTotalElements(response.totalElements);
    setTotalPages(response.totalPages);
    setCursor(response.nextCursor);
  }, []);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
    onPageChange?.(newPage, pageSize, cursor);
  }, [totalPages, pageSize, cursor, onPageChange]);

  const goToNext = useCallback(() => {
    if (paginationInfo.hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onPageChange?.(nextPage, pageSize, cursor);
    }
  }, [currentPage, pageSize, cursor, paginationInfo.hasNext, onPageChange]);

  const goToPrevious = useCallback(() => {
    if (paginationInfo.hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      onPageChange?.(prevPage, pageSize, cursor);
    }
  }, [currentPage, pageSize, cursor, paginationInfo.hasPrevious, onPageChange]);

  const goToFirst = useCallback(() => {
    setCurrentPage(0);
    setCursor(undefined);
    onPageChange?.(0, pageSize);
  }, [pageSize, onPageChange]);

  const goToLast = useCallback(() => {
    const lastPage = Math.max(0, totalPages - 1);
    setCurrentPage(lastPage);
    onPageChange?.(lastPage, pageSize, cursor);
  }, [totalPages, pageSize, cursor, onPageChange]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when changing page size
    setCursor(undefined);
    onPageChange?.(0, newSize);
  }, [onPageChange]);

  const controls: PaginationControls = {
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    setPageSize: changePageSize
  };

  return {
    paginationInfo,
    paginationParams,
    controls,
    updatePagination
  };
}
