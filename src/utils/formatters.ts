/**
 * Format a number as currency in ARS (Argentine Pesos)
 */
export function formatCurrency(amount: number | null | undefined): string {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$ 0';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as currency in USD (US Dollars)
 */
export function formatCurrencyUSD(amount: number | null | undefined): string {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$ 0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-AR').format(amount);
}

/**
 * Format a date in Spanish (Argentina) format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format a date with month name
 */
export function formatLongDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(partial: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((partial / total) * 100);
}

/**
 * Parse a currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol and thousand separators
  const cleanValue = value.replace(/[^0-9,-]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Argentine phone number
  if (cleaned.startsWith('54')) {
    // International format
    const match = cleaned.match(/^(54)(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]}-${match[4]}`;
    }
  } else if (cleaned.length === 10) {
    // Local format without area code
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]}-${match[3]}`;
    }
  }
  
  return phone;
}

/**
 * Format project code
 */
export function formatProjectCode(year: number, number: number): string {
  return `PRY-${year}-${number.toString().padStart(3, '0')}`;
}