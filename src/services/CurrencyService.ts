import { supabase } from '@/config/supabase';

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export type Currency = 'ARS' | 'USD';

export class CurrencyService {
  /**
   * Get the latest exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: Currency, toCurrency: Currency): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}, using default rate`);
      // Default rates (should be updated regularly)
      if (fromCurrency === 'USD' && toCurrency === 'ARS') {
        return 1000; // 1 USD = 1000 ARS (example rate)
      }
      if (fromCurrency === 'ARS' && toCurrency === 'USD') {
        return 0.001; // 1 ARS = 0.001 USD (example rate)
      }
      return 1;
    }

    return (data as any).rate;
  }

  /**
   * Get current exchange rate with metadata
   */
  async getCurrentExchangeRate(fromCurrency: Currency, toCurrency: Currency): Promise<ExchangeRate | null> {
    if (fromCurrency === toCurrency) {
      return {
        id: 'same-currency',
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: 1,
        effective_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }

    return data;
  }

  /**
   * Convert amount between currencies
   */
  async convertAmount(
    amount: number, 
    fromCurrency: Currency, 
    toCurrency: Currency
  ): Promise<{ convertedAmount: number; rate: number }> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;
    
    return {
      convertedAmount,
      rate
    };
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number, currency: Currency = 'ARS'): string {
    const locale = currency === 'ARS' ? 'es-AR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: Currency): string {
    return currency === 'ARS' ? '$' : 'US$';
  }

  /**
   * Get currency name
   */
  getCurrencyName(currency: Currency): string {
    return currency === 'ARS' ? 'Pesos Argentinos' : 'Dólares Estadounidenses';
  }

  /**
   * Validate currency code
   */
  isValidCurrency(currency: string): currency is Currency {
    return currency === 'ARS' || currency === 'USD';
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return ['ARS', 'USD'];
  }

  /**
   * Get exchange rate display text
   */
  getExchangeRateText(rate: number, fromCurrency: Currency, toCurrency: Currency): string {
    if (fromCurrency === toCurrency) {
      return '';
    }

    return `1 ${fromCurrency} = ${this.formatCurrency(rate, toCurrency)}`;
  }

  /**
   * Update exchange rate (admin function)
   */
  async updateExchangeRate(
    fromCurrency: Currency, 
    toCurrency: Currency, 
    rate: number
  ): Promise<ExchangeRate | null> {
    const { data, error } = await supabase
      .from('exchange_rates')
      .insert({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: rate,
        effective_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating exchange rate:', error);
      return null;
    }

    return data;
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();