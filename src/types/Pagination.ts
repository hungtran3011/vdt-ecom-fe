/**
 * Pagination types for API responses
 * Based on the cursor-based pagination documented in pagination-api-demo.md
 */

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string | number;
  previousCursor?: string | number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  cursor?: string | number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string | number;
  previousCursor?: string | number;
}

export interface PaginationControls {
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  setPageSize: (size: number) => void;
}

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 0;

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;
