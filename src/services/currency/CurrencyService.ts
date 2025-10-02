/**
 * Enhanced Currency Exchange Service
 * Provides real-time USD to ARS exchange rates from multiple sources
 * with support for different exchange types, historical data, and real-time updates
 */

// Exchange rate types available in Argentina
export enum ExchangeRateType {
  OFICIAL = 'oficial',
  BLUE = 'blue',
  MEP = 'mep',
  CCL = 'ccl',
  CRIPTO = 'cripto',
  TARJETA = 'tarjeta',
  MAYORISTA = 'mayorista',
}

// Exchange rate data structure
export interface ExchangeRate {
  type: ExchangeRateType;
  source: string;
  buy: number;
  sell: number;
  average: number;
  spread: number; // Difference between buy and sell
  variation: number; // Daily variation percentage
  lastUpdate: string;
  timestamp: number;
}

// All available rates
export interface AllExchangeRates {
  oficial: ExchangeRate;
  blue?: ExchangeRate;
  mep?: ExchangeRate;
  ccl?: ExchangeRate;
  cripto?: ExchangeRate;
  tarjeta?: ExchangeRate;
  mayorista?: ExchangeRate;
  lastUpdate: string;
  timestamp: number;
}

// Cached rate with metadata
interface CachedRate extends AllExchangeRates {
  cachedAt: number;
  cacheExpiry: number;
  fetchCount: number;
  lastError?: string;
}

// Service configuration
interface ServiceConfig {
  cacheEnabled: boolean;
  cacheDuration: number;
  autoRefresh: boolean;
  refreshInterval: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  preferredSource: 'dolarapi' | 'bluelytics' | 'dolarsi' | 'auto';
}

// API response types
interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface BluelyticsResponse {
  oficial: {
    value_buy: number;
    value_sell: number;
    value_avg: number;
  };
  blue: {
    value_buy: number;
    value_sell: number;
    value_avg: number;
  };
  oficial_euro: any;
  blue_euro: any;
  last_update: string;
}

interface DolarSiResponse {
  casa: {
    compra: string;
    venta: string;
    nombre: string;
    variacion?: string;
  };
}

class CurrencyService {
  private static instance: CurrencyService;
  private cache: CachedRate | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private retryQueue: Map<string, number> = new Map();
  private listeners: Set<(rates: AllExchangeRates) => void> = new Set();
  
  // Configuration with defaults
  private config: ServiceConfig = {
    cacheEnabled: true,
    cacheDuration: 30 * 60 * 1000, // 30 minutes
    autoRefresh: false,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
    timeout: 5000, // 5 seconds
    preferredSource: 'auto',
  };

  private readonly STORAGE_KEY = 'nivexa_exchange_rates';
  private readonly HISTORY_KEY = 'nivexa_exchange_history';
  private readonly MAX_HISTORY_ITEMS = 100;

  private constructor(config?: Partial<ServiceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromLocalStorage();
    this.setupAutoRefresh();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  /**
   * Get all exchange rates with intelligent caching
   */
  public async getAllRates(): Promise<AllExchangeRates> {
    // Check cache validity
    if (this.config.cacheEnabled && this.cache && this.isCacheValid()) {
      console.log('[CurrencyService] Returning cached rates');
      return this.cache;
    }

    try {
      // Fetch from sources with retry logic
      const rates = await this.fetchWithRetry();
      
      // Update cache
      this.updateCache(rates);
      
      // Save to localStorage
      this.saveToLocalStorage();
      
      // Save to history
      this.saveToHistory(rates);
      
      // Notify listeners
      this.notifyListeners(rates);
      
      return rates;
    } catch (error) {
      console.error('[CurrencyService] Failed to fetch rates:', error);
      
      // Try to return cached value
      if (this.cache) {
        console.warn('[CurrencyService] Using cached rates (possibly expired)');
        return this.cache;
      }
      
      // Return fallback as last resort
      return this.getFallbackRates();
    }
  }

  /**
   * Get specific exchange rate type
   */
  public async getRate(type: ExchangeRateType = ExchangeRateType.OFICIAL): Promise<ExchangeRate> {
    const rates = await this.getAllRates();
    
    switch (type) {
      case ExchangeRateType.OFICIAL:
        return rates.oficial;
      case ExchangeRateType.BLUE:
        return rates.blue || rates.oficial;
      case ExchangeRateType.MEP:
        return rates.mep || rates.oficial;
      case ExchangeRateType.CCL:
        return rates.ccl || rates.oficial;
      case ExchangeRateType.CRIPTO:
        return rates.cripto || rates.blue || rates.oficial;
      case ExchangeRateType.TARJETA:
        return rates.tarjeta || this.calculateCardRate(rates.oficial);
      case ExchangeRateType.MAYORISTA:
        return rates.mayorista || rates.oficial;
      default:
        return rates.oficial;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  public async getUSDtoARS(): Promise<ExchangeRate> {
    return this.getRate(ExchangeRateType.OFICIAL);
  }

  /**
   * Fetch rates with retry logic
   */
  private async fetchWithRetry(attempt = 1): Promise<AllExchangeRates> {
    try {
      return await this.fetchFromSources();
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.log(`[CurrencyService] Retry attempt ${attempt} of ${this.config.retryAttempts}`);
        await this.delay(this.config.retryDelay * attempt);
        return this.fetchWithRetry(attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Try multiple API sources for exchange rates
   */
  private async fetchFromSources(): Promise<AllExchangeRates> {
    const sources = this.getSourcesPriority();
    let lastError: Error | null = null;

    for (const source of sources) {
      try {
        console.log(`[CurrencyService] Trying ${source.name}...`);
        const rates = await source.fetch();
        
        if (this.validateRates(rates)) {
          console.log(`[CurrencyService] Success with ${source.name}`);
          return rates;
        }
      } catch (error) {
        console.warn(`[CurrencyService] ${source.name} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    throw lastError || new Error('All exchange rate sources failed');
  }

  /**
   * Get sources in priority order based on configuration
   */
  private getSourcesPriority() {
    const sources = [
      { name: 'DolarAPI', fetch: () => this.fetchFromDolarApiEnhanced() },
      { name: 'Bluelytics', fetch: () => this.fetchFromBluelyticsEnhanced() },
      { name: 'DolarSi', fetch: () => this.fetchFromDolarSiEnhanced() },
    ];

    // Reorder based on preferred source
    if (this.config.preferredSource !== 'auto') {
      const preferred = sources.find(s => 
        s.name.toLowerCase().includes(this.config.preferredSource)
      );
      if (preferred) {
        sources.unshift(...sources.splice(sources.indexOf(preferred), 1));
      }
    }

    return sources;
  }

  /**
   * Enhanced fetch from DolarAPI with multiple exchange types
   */
  private async fetchFromDolarApiEnhanced(): Promise<AllExchangeRates> {
    const types = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'cripto', 'tarjeta', 'mayorista'];
    const rates: Partial<AllExchangeRates> = {
      timestamp: Date.now(),
      lastUpdate: new Date().toISOString(),
    };

    // Fetch all types in parallel
    const promises = types.map(async (type) => {
      try {
        const response = await fetch(`https://dolarapi.com/v1/dolares/${type}`, {
          signal: AbortSignal.timeout(this.config.timeout),
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const data: DolarApiResponse = await response.json();
          return { type, data };
        }
      } catch (error) {
        console.warn(`[CurrencyService] Failed to fetch ${type} from DolarAPI`);
      }
      return null;
    });

    const results = await Promise.all(promises);
    
    // Process results
    for (const result of results) {
      if (!result) continue;
      
      const { type, data } = result;
      const rate: ExchangeRate = {
        type: this.mapToExchangeRateType(type),
        source: 'DolarAPI',
        buy: data.compra,
        sell: data.venta,
        average: (data.compra + data.venta) / 2,
        spread: ((data.venta - data.compra) / data.compra) * 100,
        variation: 0, // DolarAPI doesn't provide this
        lastUpdate: data.fechaActualizacion,
        timestamp: Date.now(),
      };

      switch (type) {
        case 'oficial':
          rates.oficial = rate;
          break;
        case 'blue':
          rates.blue = rate;
          break;
        case 'bolsa':
          rates.mep = rate;
          break;
        case 'contadoconliqui':
          rates.ccl = rate;
          break;
        case 'cripto':
          rates.cripto = rate;
          break;
        case 'tarjeta':
          rates.tarjeta = rate;
          break;
        case 'mayorista':
          rates.mayorista = rate;
          break;
      }
    }

    if (!rates.oficial) {
      throw new Error('Failed to fetch official rate from DolarAPI');
    }

    return rates as AllExchangeRates;
  }

  /**
   * Enhanced fetch from Bluelytics with multiple rates
   */
  private async fetchFromBluelyticsEnhanced(): Promise<AllExchangeRates> {
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest', {
      signal: AbortSignal.timeout(this.config.timeout),
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) throw new Error('Bluelytics request failed');
    
    const data: BluelyticsResponse = await response.json();
    
    const rates: AllExchangeRates = {
      oficial: {
        type: ExchangeRateType.OFICIAL,
        source: 'Bluelytics',
        buy: data.oficial.value_buy,
        sell: data.oficial.value_sell,
        average: data.oficial.value_avg,
        spread: ((data.oficial.value_sell - data.oficial.value_buy) / data.oficial.value_buy) * 100,
        variation: 0,
        lastUpdate: data.last_update,
        timestamp: Date.now(),
      },
      lastUpdate: data.last_update,
      timestamp: Date.now(),
    };

    // Add blue rate if available
    if (data.blue) {
      rates.blue = {
        type: ExchangeRateType.BLUE,
        source: 'Bluelytics',
        buy: data.blue.value_buy,
        sell: data.blue.value_sell,
        average: data.blue.value_avg,
        spread: ((data.blue.value_sell - data.blue.value_buy) / data.blue.value_buy) * 100,
        variation: 0,
        lastUpdate: data.last_update,
        timestamp: Date.now(),
      };
    }

    return rates;
  }

  /**
   * Enhanced fetch from DolarSi with multiple rates
   */
  private async fetchFromDolarSiEnhanced(): Promise<AllExchangeRates> {
    const response = await fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales', {
      signal: AbortSignal.timeout(this.config.timeout),
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) throw new Error('DolarSi request failed');
    
    const data: DolarSiResponse[] = await response.json();
    const rates: Partial<AllExchangeRates> = {
      timestamp: Date.now(),
      lastUpdate: new Date().toISOString(),
    };
    
    // Map DolarSi names to our types
    const mappings = [
      { names: ['Dolar Oficial', 'Oficial'], key: 'oficial', type: ExchangeRateType.OFICIAL },
      { names: ['Dolar Blue', 'Blue'], key: 'blue', type: ExchangeRateType.BLUE },
      { names: ['Dolar Bolsa', 'Dolar MEP'], key: 'mep', type: ExchangeRateType.MEP },
      { names: ['Dolar Contado con Liqui', 'Dolar CCL'], key: 'ccl', type: ExchangeRateType.CCL },
      { names: ['Dolar turista'], key: 'tarjeta', type: ExchangeRateType.TARJETA },
    ];
    
    for (const mapping of mappings) {
      const item = data.find((item: any) => 
        mapping.names.some(name => item.casa?.nombre?.includes(name))
      );
      
      if (item && item.casa) {
        const buy = this.parseNumber(item.casa.compra);
        const sell = this.parseNumber(item.casa.venta);
        const variation = this.parseNumber(item.casa.variacion || '0');
        
        if (buy > 0 && sell > 0) {
          const rate: ExchangeRate = {
            type: mapping.type,
            source: 'DolarSi',
            buy,
            sell,
            average: (buy + sell) / 2,
            spread: ((sell - buy) / buy) * 100,
            variation,
            lastUpdate: new Date().toISOString(),
            timestamp: Date.now(),
          };
          
          (rates as any)[mapping.key] = rate;
        }
      }
    }
    
    if (!rates.oficial) {
      throw new Error('Official rate not found in DolarSi response');
    }
    
    return rates as AllExchangeRates;
  }

  /**
   * Validate rates data
   */
  private validateRates(rates: AllExchangeRates): boolean {
    if (!rates || !rates.oficial) return false;
    
    const oficial = rates.oficial;
    return oficial.buy > 0 && 
           oficial.sell > 0 && 
           oficial.buy < oficial.sell && 
           oficial.buy < 10000 && // Sanity check
           oficial.sell < 10000;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false;
    
    const now = Date.now();
    return now < this.cache.cacheExpiry;
  }

  /**
   * Update cache with new rates
   */
  private updateCache(rates: AllExchangeRates): void {
    this.cache = {
      ...rates,
      cachedAt: Date.now(),
      cacheExpiry: Date.now() + this.config.cacheDuration,
      fetchCount: (this.cache?.fetchCount || 0) + 1,
    };
  }

  /**
   * Load cached rate from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load exchange rate from localStorage:', error);
    }
  }

  /**
   * Save cached rate to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      if (this.cache) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cache));
      }
    } catch (error) {
      console.error('Failed to save exchange rate to localStorage:', error);
    }
  }

  /**
   * Calculate card rate (tourist rate) from official
   */
  private calculateCardRate(oficial: ExchangeRate): ExchangeRate {
    // In Argentina, card rate is typically oficial + 75% (30% PAIS + 45% ganancias)
    const multiplier = 1.75;
    return {
      ...oficial,
      type: ExchangeRateType.TARJETA,
      buy: oficial.buy * multiplier,
      sell: oficial.sell * multiplier,
      average: oficial.average * multiplier,
      source: `${oficial.source} (calculated)`,
    };
  }

  /**
   * Get fallback rates when all sources fail
   */
  private getFallbackRates(): AllExchangeRates {
    const baseRate: ExchangeRate = {
      type: ExchangeRateType.OFICIAL,
      source: 'Fallback (cached or estimated)',
      buy: 1000,
      sell: 1050,
      average: 1025,
      spread: 5,
      variation: 0,
      lastUpdate: new Date().toISOString(),
      timestamp: Date.now(),
    };

    return {
      oficial: baseRate,
      blue: { ...baseRate, type: ExchangeRateType.BLUE, buy: 1200, sell: 1250, average: 1225 },
      lastUpdate: new Date().toISOString(),
      timestamp: Date.now(),
    };
  }

  /**
   * Helper to parse number from string
   */
  private parseNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value || value === 'No Cotiza') return 0;
    return parseFloat(value.replace(/[^0-9,.-]/g, '').replace(',', '.'));
  }

  /**
   * Map API type strings to our enum
   */
  private mapToExchangeRateType(type: string): ExchangeRateType {
    const mapping: Record<string, ExchangeRateType> = {
      'oficial': ExchangeRateType.OFICIAL,
      'blue': ExchangeRateType.BLUE,
      'bolsa': ExchangeRateType.MEP,
      'mep': ExchangeRateType.MEP,
      'contadoconliqui': ExchangeRateType.CCL,
      'ccl': ExchangeRateType.CCL,
      'cripto': ExchangeRateType.CRIPTO,
      'tarjeta': ExchangeRateType.TARJETA,
      'mayorista': ExchangeRateType.MAYORISTA,
    };
    return mapping[type.toLowerCase()] || ExchangeRateType.OFICIAL;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Setup auto-refresh if enabled
   */
  private setupAutoRefresh(): void {
    if (this.config.autoRefresh) {
      this.refreshTimer = setInterval(() => {
        this.getAllRates().catch(console.error);
      }, this.config.refreshInterval);
    }
  }

  /**
   * Save rates to history for tracking
   */
  private saveToHistory(rates: AllExchangeRates): void {
    try {
      const historyStr = localStorage.getItem(this.HISTORY_KEY);
      const history: AllExchangeRates[] = historyStr ? JSON.parse(historyStr) : [];
      
      history.unshift(rates);
      
      // Keep only last N items
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('[CurrencyService] Failed to save history:', error);
    }
  }

  /**
   * Get historical rates
   */
  public getHistory(): AllExchangeRates[] {
    try {
      const historyStr = localStorage.getItem(this.HISTORY_KEY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
      console.error('[CurrencyService] Failed to load history:', error);
      return [];
    }
  }

  /**
   * Subscribe to rate updates
   */
  public subscribe(callback: (rates: AllExchangeRates) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of rate updates
   */
  private notifyListeners(rates: AllExchangeRates): void {
    this.listeners.forEach(callback => {
      try {
        callback(rates);
      } catch (error) {
        console.error('[CurrencyService] Listener error:', error);
      }
    });
  }

  /**
   * Force refresh the exchange rates (bypasses cache)
   */
  public async forceRefresh(): Promise<AllExchangeRates> {
    this.cache = null;
    localStorage.removeItem(this.STORAGE_KEY);
    return this.getAllRates();
  }

  /**
   * Convert USD to ARS using specific rate type
   */
  public async convertUSDtoARS(
    usdAmount: number, 
    rateType: ExchangeRateType = ExchangeRateType.OFICIAL
  ): Promise<number> {
    const rate = await this.getRate(rateType);
    return usdAmount * rate.sell; // Use sell rate for conversion
  }

  /**
   * Convert ARS to USD using specific rate type
   */
  public async convertARStoUSD(
    arsAmount: number,
    rateType: ExchangeRateType = ExchangeRateType.OFICIAL
  ): Promise<number> {
    const rate = await this.getRate(rateType);
    return arsAmount / rate.buy; // Use buy rate for conversion
  }

  /**
   * Get spread percentage between buy and sell
   */
  public async getSpread(rateType: ExchangeRateType = ExchangeRateType.OFICIAL): Promise<number> {
    const rate = await this.getRate(rateType);
    return rate.spread;
  }

  /**
   * Get best rate for buying USD
   */
  public async getBestBuyRate(): Promise<ExchangeRate> {
    const rates = await this.getAllRates();
    const availableRates = [
      rates.oficial,
      rates.blue,
      rates.mep,
      rates.ccl,
      rates.cripto,
    ].filter(Boolean) as ExchangeRate[];
    
    return availableRates.reduce((best, current) => 
      current.buy < best.buy ? current : best
    );
  }

  /**
   * Get best rate for selling USD
   */
  public async getBestSellRate(): Promise<ExchangeRate> {
    const rates = await this.getAllRates();
    const availableRates = [
      rates.oficial,
      rates.blue,
      rates.mep,
      rates.ccl,
      rates.cripto,
    ].filter(Boolean) as ExchangeRate[];
    
    return availableRates.reduce((best, current) => 
      current.sell > best.sell ? current : best
    );
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart auto-refresh if needed
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.setupAutoRefresh();
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.listeners.clear();
    this.retryQueue.clear();
  }
}

export const currencyService = CurrencyService.getInstance();
export type { ExchangeRate };