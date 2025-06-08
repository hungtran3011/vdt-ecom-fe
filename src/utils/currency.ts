/**
 * Utility functions for currency formatting in Vietnamese Dong (VND)
 * Provides consistent currency display across the application
 */

/**
 * Format number as Vietnamese Dong currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatVND = (
  amount: number,
  options?: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    locale?: string;
  }
): string => {
  const {
    showSymbol = true,
    showDecimals = false,
    locale = 'vi-VN'
  } = options || {};

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    if (!showSymbol) {
      return formatter.format(amount).replace(/[₫\s]/g, '').trim();
    }

    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting if Intl is not available
    const formatted = amount.toLocaleString('vi-VN');
    return showSymbol ? `${formatted}₫` : formatted;
  }
};

/**
 * Format number with Vietnamese number formatting
 * @param amount - The number to format
 * @param locale - Locale string (default: vi-VN)
 * @returns Formatted number string
 */
export const formatNumber = (amount: number, locale = 'vi-VN'): string => {
  try {
    return amount.toLocaleString(locale);
  } catch (error) {
    return amount.toString();
  }
};

/**
 * Parse Vietnamese formatted currency string to number
 * @param currencyString - Currency string to parse
 * @returns Parsed number
 */
export const parseVND = (currencyString: string): number => {
  // Remove currency symbols and spaces, then convert commas to dots if needed
  const cleaned = currencyString
    .replace(/[₫\s]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  
  return parseFloat(cleaned) || 0;
};

/**
 * Format currency for input fields (without symbol)
 * @param amount - The amount to format
 * @returns Formatted string for input
 */
export const formatCurrencyInput = (amount: number): string => {
  return formatVND(amount, { showSymbol: false });
};

/**
 * Format currency with short notation (K, M, B for thousands, millions, billions)
 * @param amount - The amount to format
 * @param locale - Locale string
 * @returns Formatted currency with short notation
 */
export const formatVNDShort = (amount: number, locale = 'vi-VN'): string => {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B₫`;
  } else if (absAmount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M₫`;
  } else if (absAmount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K₫`;
  }
  
  return formatVND(amount, { locale });
};

/**
 * Currency constants for Vietnamese Dong
 */
export const CURRENCY_CONFIG = {
  symbol: '₫',
  code: 'VND',
  locale: 'vi-VN',
  name: 'Đồng Việt Nam',
  minorUnit: 2, // Though VND typically doesn't use decimals
} as const;

/**
 * Common Vietnamese currency amounts
 */
export const COMMON_AMOUNTS = {
  SHIPPING_FREE_THRESHOLD: 200000, // 200k VND
  MIN_ORDER: 50000, // 50k VND
  MAX_COD: 20000000, // 20M VND
} as const;
