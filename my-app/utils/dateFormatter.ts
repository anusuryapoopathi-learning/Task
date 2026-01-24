/**
 * Format date to UK locale format (DD/MM/YYYY)
 */
export function formatDateToUK(value: Date | string | null | undefined): string {
  if (!value) return '';
  
  const date = value instanceof Date ? value : new Date(value);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date to US locale format (MMM DD, YYYY)
 */
export function formatDateToUS(value: Date | string | null | undefined): string {
  if (!value) return 'Not set';
  
  const date = value instanceof Date ? value : new Date(value);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Not set';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get today's date with time set to 00:00:00
 */
export function getTodayStartOfDay(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Normalize date value to Date object
 */
export function normalizeDate(value: Date | string | null | undefined): Date {
  if (!value) return new Date();
  
  if (value instanceof Date) {
    return value;
  }
  
  if (typeof value === 'string') {
    return new Date(value);
  }
  
  return new Date();
}
