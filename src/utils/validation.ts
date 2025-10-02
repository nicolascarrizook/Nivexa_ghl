/**
 * Maximum value that can be stored in NUMERIC(15,2) field
 * This is $9,999,999,999,999.99 (almost 10 trillion)
 */
export const MAX_CURRENCY_VALUE = 9999999999999.99;

/**
 * Validate if a currency amount is within acceptable database limits
 */
export function isValidCurrencyAmount(amount: number): boolean {
  if (isNaN(amount)) return false;
  if (amount < 0) return false;
  if (amount > MAX_CURRENCY_VALUE) return false;
  return true;
}

/**
 * Format error message for currency overflow
 */
export function getCurrencyOverflowError(amount: number): string {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  });
  
  return `El monto ${formatter.format(amount)} excede el límite máximo permitido de ${formatter.format(MAX_CURRENCY_VALUE)}`;
}

/**
 * Safely parse currency input string to number
 */
export function parseCurrencyInput(input: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.,]/g, '');
  
  // Replace comma with dot for decimal separator
  const normalized = cleaned.replace(',', '.');
  
  // Remove thousand separators (dots that are not the last one)
  const parts = normalized.split('.');
  let finalValue = normalized;
  
  if (parts.length > 2) {
    // Multiple dots - keep only the last one as decimal separator
    const wholePart = parts.slice(0, -1).join('');
    const decimalPart = parts[parts.length - 1];
    finalValue = `${wholePart}.${decimalPart}`;
  }
  
  const parsed = parseFloat(finalValue);
  
  // Return 0 if parsing fails
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number as currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Validate and sanitize currency amount
 */
export function sanitizeCurrencyAmount(amount: number): number {
  if (!isValidCurrencyAmount(amount)) {
    if (amount > MAX_CURRENCY_VALUE) {
      console.warn(`Amount ${amount} exceeds maximum, capping at ${MAX_CURRENCY_VALUE}`);
      return MAX_CURRENCY_VALUE;
    }
    if (amount < 0) {
      console.warn(`Negative amount ${amount} provided, using 0`);
      return 0;
    }
    console.warn(`Invalid amount ${amount} provided, using 0`);
    return 0;
  }
  
  // Round to 2 decimal places
  return Math.round(amount * 100) / 100;
}