/**
 * Secure logging service that filters sensitive information
 * Only logs in development mode
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  filterSensitive: boolean;
}

class LoggerService {
  private config: LoggerConfig;
  private sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'credit',
    'card',
    'ssn',
    'pin'
  ];

  constructor() {
    this.config = {
      enabled: import.meta.env.DEV, // Only in development
      level: 'info',
      filterSensitive: true
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private filterSensitiveData(data: any): any {
    if (!this.config.filterSensitive) return data;
    
    if (typeof data !== 'object' || data === null) return data;
    
    const filtered = Array.isArray(data) ? [...data] : { ...data };
    
    for (const key in filtered) {
      const lowerKey = key.toLowerCase();
      
      // Check if key contains sensitive words
      if (this.sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        filtered[key] = '[REDACTED]';
      } else if (typeof filtered[key] === 'object' && filtered[key] !== null) {
        filtered[key] = this.filterSensitiveData(filtered[key]);
      }
    }
    
    return filtered;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const filteredData = data ? this.filterSensitiveData(data) : undefined;
    
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     console.log;
    
    if (filteredData) {
      logMethod(`[${timestamp}] [${level.toUpperCase()}] ${message}`, filteredData);
    } else {
      logMethod(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  debug(message: string, data?: any): void {
    this.formatMessage('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.formatMessage('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.formatMessage('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.formatMessage('error', message, data);
  }

  // Group related logs
  group(label: string): void {
    if (this.config.enabled) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }

  // Performance timing
  time(label: string): void {
    if (this.config.enabled) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.config.enabled) {
      console.timeEnd(label);
    }
  }

  // Table display for structured data
  table(data: any): void {
    if (this.config.enabled) {
      console.table(this.filterSensitiveData(data));
    }
  }
}

// Export singleton instance
export const logger = new LoggerService();