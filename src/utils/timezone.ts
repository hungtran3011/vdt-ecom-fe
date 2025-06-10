/**
 * Timezone utility functions for converting server dates to client timezone
 */

/**
 * Safely convert a date string or Date object to a Date object
 * @param date - Date string (ISO format) or Date object
 * @returns Date object or null if invalid
 */
export const parseDate = (date: string | Date | null | undefined): Date | null => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return dateObj;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Convert a date string or Date object to the client's local timezone
 * @param date - Date string (ISO format) or Date object from server
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in client's timezone
 */
export const formatToClientTimezone = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return '';
  
  try {
    // Format using client's locale and timezone
    return new Intl.DateTimeFormat('vi-VN', {
      ...options,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date to client timezone:', error);
    return 'Invalid Date';
  }
};

/**
 * Get a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string (ISO format) or Date object from server
 * @returns Relative time string in Vietnamese
 */
export const getRelativeTime = (date: string | Date): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return '';
  
  try {
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      // For older dates, show formatted date
      return formatToClientTimezone(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date for display in order lists (shorter format)
 * @param date - Date string (ISO format) or Date object from server
 * @returns Formatted date string optimized for list display
 */
export const formatOrderDate = (date: string | Date): string => {
  return formatToClientTimezone(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Format date for detailed view (full format with timezone info)
 * @param date - Date string (ISO format) or Date object from server
 * @returns Formatted date string with timezone information
 */
export const formatOrderDateDetailed = (date: string | Date): string => {
  const formatted = formatToClientTimezone(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${formatted} (${timezone})`;
};

/**
 * Check if a date is today
 * @param date - Date string (ISO format) or Date object
 * @returns true if the date is today in client's timezone
 */
export const isToday = (date: string | Date): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  try {
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};

/**
 * Check if a date is yesterday
 * @param date - Date string (ISO format) or Date object
 * @returns true if the date is yesterday in client's timezone
 */
export const isYesterday = (date: string | Date): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return dateObj.toDateString() === yesterday.toDateString();
  } catch {
    return false;
  }
};

/**
 * Get client's timezone abbreviation (e.g., "ICT", "PST")
 * @returns Timezone abbreviation or timezone identifier if abbreviation not available
 */
export const getClientTimezone = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Try to get abbreviation
    const date = new Date();
    const timeString = date.toLocaleTimeString('en-US', {
      timeZoneName: 'short',
      timeZone: timezone
    });
    
    const match = timeString.match(/\b[A-Z]{3,4}\b/);
    return match ? match[0] : timezone;
  } catch {
    return 'UTC';
  }
};
