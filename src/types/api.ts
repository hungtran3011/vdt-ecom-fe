/**
 * Common API types for the VDT E-Commerce API responses
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

/**
 * Paginated response format from the API
 */
export interface PaginatedResponse<T> {
  content: T[];
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Standard API error response
 */
export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
  path: string;
  details?: string;
}

/**
 * Field types for dynamic fields
 */
export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  COLOR_HASH = 'COLOR_HASH',
  ENUM = 'ENUM',
  SELECT = 'SELECT'
}

/**
 * Property target for dynamic fields
 */
export enum AppliesTo {
  PRODUCT = 'PRODUCT',
  VARIATION = 'VARIATION',
  BOTH = 'BOTH'
}
