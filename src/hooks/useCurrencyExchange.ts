import { useState, useEffect, useCallback } from 'react';
import { 
  currencyService, 
  type ExchangeRate,
  type AllExchangeRates,
  ExchangeRateType 
} from '@/services/currency/CurrencyService';

interface UseCurrencyExchangeOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in minutes
  rateType?: ExchangeRateType; // Which rate type to use
  includeAllRates?: boolean; // Whether to fetch all rate types
}

interface UseCurrencyExchangeReturn {
  exchangeRate: ExchangeRate | null;
  allRates: AllExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  convertUSDtoARS: (amount: number, rateType?: ExchangeRateType) => number;
  convertARStoUSD: (amount: number, rateType?: ExchangeRateType) => number;
  formatARS: (amount: number) => string;
  formatUSD: (amount: number) => string;
  displayRate: string;
  getBestRate: (operation: 'buy' | 'sell') => Promise<ExchangeRate | null>;
  getSpread: (rateType?: ExchangeRateType) => number;
}

export function useCurrencyExchange(
  options: UseCurrencyExchangeOptions = {}
): UseCurrencyExchangeReturn {
  const { 
    autoRefresh = true, 
    refreshInterval = 30, // 30 minutes default
    rateType = ExchangeRateType.OFICIAL,
    includeAllRates = false
  } = options;

  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [allRates, setAllRates] = useState<AllExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Fetch exchange rates
   */
  const fetchRate = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (includeAllRates) {
        // Fetch all rates
        const rates = forceRefresh 
          ? await currencyService.forceRefresh()
          : await currencyService.getAllRates();
        
        setAllRates(rates);
        setExchangeRate(rates[rateType === ExchangeRateType.OFICIAL ? 'oficial' : rateType] || rates.oficial);
        setLastUpdate(new Date(rates.timestamp));
      } else {
        // Fetch specific rate type
        const rate = await currencyService.getRate(rateType);
        setExchangeRate(rate);
        setLastUpdate(new Date(rate.timestamp));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch exchange rate';
      setError(message);
      console.error('Exchange rate fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [includeAllRates, rateType]);

  /**
   * Refresh exchange rate (force fetch)
   */
  const refresh = useCallback(async () => {
    await fetchRate(true);
  }, [fetchRate]);

  /**
   * Convert USD to ARS with optional rate type
   */
  const convertUSDtoARS = useCallback((amount: number, customRateType?: ExchangeRateType): number => {
    if (!amount || amount <= 0) return 0;
    
    // Use custom rate if provided and available
    if (customRateType && allRates) {
      const customRate = allRates[customRateType as keyof AllExchangeRates] as ExchangeRate;
      if (customRate && customRate.sell) {
        return amount * customRate.sell;
      }
    }
    
    // Use current exchange rate
    if (!exchangeRate) return amount * 1050; // Fallback rate
    return amount * exchangeRate.sell;
  }, [exchangeRate, allRates]);

  /**
   * Convert ARS to USD with optional rate type
   */
  const convertARStoUSD = useCallback((amount: number, customRateType?: ExchangeRateType): number => {
    if (!amount || amount <= 0) return 0;
    
    // Use custom rate if provided and available
    if (customRateType && allRates) {
      const customRate = allRates[customRateType as keyof AllExchangeRates] as ExchangeRate;
      if (customRate && customRate.buy) {
        return amount / customRate.buy;
      }
    }
    
    // Use current exchange rate
    if (!exchangeRate) return amount / 1000; // Fallback rate
    return amount / exchangeRate.buy;
  }, [exchangeRate, allRates]);

  /**
   * Format ARS currency
   */
  const formatARS = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  /**
   * Format USD currency
   */
  const formatUSD = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  /**
   * Get best rate for buy or sell operations
   */
  const getBestRate = useCallback(async (operation: 'buy' | 'sell'): Promise<ExchangeRate | null> => {
    try {
      if (operation === 'buy') {
        return await currencyService.getBestBuyRate();
      } else {
        return await currencyService.getBestSellRate();
      }
    } catch (error) {
      console.error('Failed to get best rate:', error);
      return null;
    }
  }, []);

  /**
   * Get spread for a specific rate type
   */
  const getSpread = useCallback((customRateType?: ExchangeRateType): number => {
    const rate = customRateType && allRates 
      ? allRates[customRateType as keyof AllExchangeRates] as ExchangeRate
      : exchangeRate;
    
    if (!rate) return 0;
    return rate.spread || ((rate.sell - rate.buy) / rate.buy * 100);
  }, [exchangeRate, allRates]);

  /**
   * Format display rate string
   */
  const displayRate = exchangeRate 
    ? `1 USD = ${formatARS(exchangeRate.sell)}`
    : '1 USD = $ 1.050';

  // Initial fetch
  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const intervalMs = refreshInterval * 60 * 1000; // Convert minutes to milliseconds
    const interval = setInterval(() => {
      fetchRate();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchRate]);

  // Subscribe to rate updates
  useEffect(() => {
    const unsubscribe = currencyService.subscribe((rates) => {
      setAllRates(rates);
      setExchangeRate(rates[rateType === ExchangeRateType.OFICIAL ? 'oficial' : rateType] || rates.oficial);
      setLastUpdate(new Date(rates.timestamp));
    });

    return unsubscribe;
  }, [rateType]);

  return {
    exchangeRate,
    allRates,
    isLoading,
    error,
    lastUpdate,
    refresh,
    convertUSDtoARS,
    convertARStoUSD,
    formatARS,
    formatUSD,
    displayRate,
    getBestRate,
    getSpread,
  };
}

/**
 * Hook for simple currency display
 */
export function useCurrencyDisplay(rateType: ExchangeRateType = ExchangeRateType.OFICIAL) {
  const { 
    exchangeRate, 
    allRates,
    isLoading, 
    error, 
    refresh,
    formatARS,
    getSpread 
  } = useCurrencyExchange({ rateType, includeAllRates: true });

  const displayRate = exchangeRate 
    ? `1 USD = ${formatARS(exchangeRate.sell)}`
    : '1 USD = $ 1.050';

  const displaySource = exchangeRate?.source || 'Manual';
  const exchangeRateValue = exchangeRate?.sell || 1050;
  
  const displayLastUpdate = exchangeRate?.lastUpdate 
    ? new Date(exchangeRate.lastUpdate).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No disponible';

  const displaySpread = exchangeRate 
    ? `${getSpread().toFixed(2)}%`
    : '0%';

  const displayVariation = exchangeRate?.variation 
    ? `${exchangeRate.variation > 0 ? '+' : ''}${exchangeRate.variation.toFixed(2)}%`
    : '0%';

  // Get all available rates for comparison
  const rateComparison = allRates ? {
    oficial: allRates.oficial?.sell || 0,
    blue: allRates.blue?.sell || 0,
    mep: allRates.mep?.sell || 0,
    ccl: allRates.ccl?.sell || 0,
    cripto: allRates.cripto?.sell || 0,
    tarjeta: allRates.tarjeta?.sell || 0,
  } : null;

  return {
    displayRate,
    displaySource,
    displayLastUpdate,
    displaySpread,
    displayVariation,
    exchangeRateValue,
    rateComparison,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for monitoring multiple exchange rates
 */
export function useMultipleExchangeRates() {
  const { allRates, isLoading, error, refresh } = useCurrencyExchange({ 
    includeAllRates: true 
  });

  const rates = allRates ? [
    { type: 'Oficial', ...allRates.oficial },
    ...(allRates.blue ? [{ type: 'Blue', ...allRates.blue }] : []),
    ...(allRates.mep ? [{ type: 'MEP', ...allRates.mep }] : []),
    ...(allRates.ccl ? [{ type: 'CCL', ...allRates.ccl }] : []),
    ...(allRates.cripto ? [{ type: 'Cripto', ...allRates.cripto }] : []),
    ...(allRates.tarjeta ? [{ type: 'Tarjeta', ...allRates.tarjeta }] : []),
  ] : [];

  return {
    rates,
    allRates,
    isLoading,
    error,
    refresh,
  };
}