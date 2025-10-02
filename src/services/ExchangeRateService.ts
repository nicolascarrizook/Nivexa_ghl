import { ExchangeRateSource } from './MasterCashService';

// Dolar API response interface
interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

// Exchange rate with metadata
export interface ExchangeRate {
  source: ExchangeRateSource;
  buy: number; // Compra
  sell: number; // Venta
  lastUpdate: Date;
}

// Cache entry
interface CacheEntry {
  rate: ExchangeRate;
  timestamp: number;
}

class ExchangeRateService {
  private readonly DOLAR_API_BASE = 'https://dolarapi.com/v1/dolares';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos de cache
  private cache: Map<ExchangeRateSource, CacheEntry> = new Map();

  /**
   * Get exchange rate from specified source
   * Uses cache when available and not expired
   */
  async getExchangeRate(source: ExchangeRateSource = 'blue'): Promise<ExchangeRate> {
    // Check cache first
    const cached = this.getCachedRate(source);
    if (cached) {
      console.log(`📊 Using cached ${source} rate: $${cached.sell}`);
      return cached;
    }

    // Fetch from API
    console.log(`🌐 Fetching ${source} rate from Dolar API...`);
    try {
      const rate = await this.fetchFromApi(source);
      this.setCachedRate(source, rate);
      return rate;
    } catch (error) {
      // Only log warning for non-404 errors (404 means endpoint not available)
      if (error instanceof Error && !error.message.includes('404')) {
        console.warn(`⚠️ Error fetching ${source} rate:`, error.message);
      }

      // Try to return stale cache if available
      const staleCache = this.cache.get(source);
      if (staleCache) {
        console.log(`📊 Using stale cache for ${source} rate`);
        return staleCache.rate;
      }

      throw new Error(`No se pudo obtener la cotización del dólar ${source}`);
    }
  }

  /**
   * Get all available exchange rates
   * Returns default values for unavailable sources
   */
  async getAllRates(): Promise<Record<ExchangeRateSource, ExchangeRate>> {
    const sources: ExchangeRateSource[] = ['blue', 'oficial', 'mep', 'ccl'];
    const rates: Partial<Record<ExchangeRateSource, ExchangeRate>> = {};

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const rate = await this.getExchangeRate(source);
          return { source, rate, success: true };
        } catch (error) {
          console.warn(`⚠️ ${source} rate not available, using blue rate as fallback`);
          return { source, rate: null, success: false };
        }
      })
    );

    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { source, rate, success } = result.value;
        if (success && rate) {
          rates[source] = rate;
        }
      }
    });

    // Use blue rate as fallback for unavailable sources
    const blueRate = rates.blue;
    if (blueRate) {
      sources.forEach((source) => {
        if (!rates[source]) {
          rates[source] = { ...blueRate, source };
        }
      });
    } else {
      // If even blue rate is not available, provide default values
      const defaultRate: ExchangeRate = {
        source: 'blue',
        buy: 1000,
        sell: 1020,
        lastUpdate: new Date(),
      };
      sources.forEach((source) => {
        if (!rates[source]) {
          rates[source] = { ...defaultRate, source };
        }
      });
    }

    return rates as Record<ExchangeRateSource, ExchangeRate>;
  }

  /**
   * Convert USD to ARS using specified source rate
   * Uses 'sell' rate (venta) for USD -> ARS conversions
   */
  async convertUsdToArs(
    usdAmount: number,
    source: ExchangeRateSource = 'blue'
  ): Promise<{ arsAmount: number; rate: ExchangeRate }> {
    const rate = await this.getExchangeRate(source);
    const arsAmount = usdAmount * rate.sell; // Use sell rate for USD -> ARS

    return {
      arsAmount: Math.round(arsAmount * 100) / 100, // Round to 2 decimals
      rate,
    };
  }

  /**
   * Convert ARS to USD using specified source rate
   * Uses 'buy' rate (compra) for ARS -> USD conversions
   */
  async convertArsToUsd(
    arsAmount: number,
    source: ExchangeRateSource = 'blue'
  ): Promise<{ usdAmount: number; rate: ExchangeRate }> {
    const rate = await this.getExchangeRate(source);
    const usdAmount = arsAmount / rate.buy; // Use buy rate for ARS -> USD

    return {
      usdAmount: Math.round(usdAmount * 100) / 100, // Round to 2 decimals
      rate,
    };
  }

  /**
   * Get cached rate if available and not expired
   */
  private getCachedRate(source: ExchangeRateSource): ExchangeRate | null {
    const cached = this.cache.get(source);
    if (!cached) return null;

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > this.CACHE_TTL) {
      // Cache expired
      this.cache.delete(source);
      return null;
    }

    return cached.rate;
  }

  /**
   * Store rate in cache
   */
  private setCachedRate(source: ExchangeRateSource, rate: ExchangeRate): void {
    this.cache.set(source, {
      rate,
      timestamp: Date.now(),
    });
  }

  /**
   * Fetch exchange rate from Dolar API
   */
  private async fetchFromApi(source: ExchangeRateSource): Promise<ExchangeRate> {
    const url = `${this.DOLAR_API_BASE}/${source}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Dolar API error: ${response.status} ${response.statusText}`);
    }

    const data: DolarApiResponse = await response.json();

    return {
      source,
      buy: data.compra,
      sell: data.venta,
      lastUpdate: new Date(data.fechaActualizacion),
    };
  }

  /**
   * Clear all cached rates (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Exchange rate cache cleared');
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { source: ExchangeRateSource; age: number; rate: ExchangeRate }[] {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([source, entry]) => ({
      source,
      age: now - entry.timestamp,
      rate: entry.rate,
    }));
  }
}

// Export singleton instance
export const exchangeRateService = new ExchangeRateService();