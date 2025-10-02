import React, { useState, useEffect, useRef } from 'react'

export interface MoneyInputProps {
  value: number | null
  onChange: (value: number | null) => void
  currency?: 'MXN' | 'USD' | 'EUR'
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  min?: number
  max?: number
  allowNegative?: boolean
  percentageMode?: boolean
  decimalPlaces?: number
  showCurrencySymbol?: boolean
  name?: string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
  error?: string
  success?: string
  loading?: boolean
  onBlur?: () => void
  onFocus?: () => void
}

const currencyConfig = {
  MXN: {
    symbol: '$',
    locale: 'es-MX',
    currency: 'MXN'
  },
  USD: {
    symbol: '$',
    locale: 'en-US', 
    currency: 'USD'
  },
  EUR: {
    symbol: '€',
    locale: 'de-DE',
    currency: 'EUR'
  }
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  currency = 'MXN',
  placeholder,
  className = "",
  disabled = false,
  required = false,
  min,
  max,
  allowNegative = false,
  percentageMode = false,
  decimalPlaces = 2,
  showCurrencySymbol = true,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  error,
  success,
  loading = false,
  onBlur,
  onFocus
}) => {
  const [displayValue, setDisplayValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const config = currencyConfig[currency]

  // Format number for display
  const formatNumber = (num: number | null, forInput: boolean = false): string => {
    if (num === null || num === undefined || isNaN(num)) return ''

    if (percentageMode) {
      if (forInput) {
        return num.toString()
      }
      return `${num.toFixed(decimalPlaces)}%`
    }

    if (forInput) {
      return num.toFixed(decimalPlaces)
    }

    try {
      const formatter = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      })
      
      return showCurrencySymbol ? formatter.format(num) : num.toLocaleString(config.locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      })
    } catch (error) {
      // Fallback formatting
      const formatted = num.toFixed(decimalPlaces)
      return showCurrencySymbol ? `${config.symbol}${formatted}` : formatted
    }
  }

  // Parse input value to number
  const parseValue = (inputValue: string): number | null => {
    if (!inputValue.trim()) return null

    // Remove currency symbols and formatting
    let cleanValue = inputValue
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus
      .replace(/^-+/, allowNegative ? '-' : '') // Handle negative sign
      .replace(/\.{2,}/g, '.') // Remove multiple dots

    // Handle percentage mode
    if (percentageMode) {
      cleanValue = cleanValue.replace(/%/g, '')
    }

    const parsed = parseFloat(cleanValue)
    
    if (isNaN(parsed)) return null

    return parsed
  }

  // Validate value against constraints
  const validateValue = (num: number | null): boolean => {
    if (num === null) return !required
    
    if (!allowNegative && num < 0) return false
    if (min !== undefined && num < min) return false
    if (max !== undefined && num > max) return false
    
    return true
  }

  // Update display value when value prop changes
  useEffect(() => {
    if (focused) {
      // Show raw numeric value when focused
      setDisplayValue(value !== null ? formatNumber(value, true) : '')
    } else {
      // Show formatted value when not focused
      setDisplayValue(value !== null ? formatNumber(value, false) : '')
    }
  }, [value, focused, currency, percentageMode, decimalPlaces, showCurrencySymbol])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)

    const parsed = parseValue(inputValue)
    
    if (parsed === null || validateValue(parsed)) {
      onChange(parsed)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    setDisplayValue(value !== null ? formatNumber(value, true) : '')
    onFocus?.()
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    
    const parsed = parseValue(displayValue)
    if (parsed !== null && !validateValue(parsed)) {
      // Reset to last valid value if invalid
      setDisplayValue(value !== null ? formatNumber(value, false) : '')
    } else {
      setDisplayValue(value !== null ? formatNumber(value, false) : '')
    }
    
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
      return
    }

    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      // Allow decimal point
      if (e.keyCode === 190 || e.keyCode === 110) {
        // Only allow one decimal point
        if (displayValue.includes('.')) {
          e.preventDefault()
        }
        return
      }
      
      // Allow minus sign for negative numbers
      if ((e.keyCode === 189 || e.keyCode === 109) && allowNegative) {
        // Only allow minus at the beginning
        if (displayValue.length > 0 || displayValue.includes('-')) {
          e.preventDefault()
        }
        return
      }

      e.preventDefault()
    }
  }

  const getStatusColor = () => {
    if (error) return 'border-red-500 dark:border-red-400 focus:ring-red-500'
    if (success) return 'border-green-500 dark:border-green-400 focus:ring-green-500'
    return 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Currency Symbol */}
        {showCurrencySymbol && !percentageMode && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            {config.symbol}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (percentageMode ? '0.00%' : `${config.symbol}0.00`)}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border rounded-lg
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${showCurrencySymbol && !percentageMode ? 'pl-8' : ''}
            ${percentageMode ? 'pr-8' : ''}
            ${loading ? 'pr-10' : ''}
            ${getStatusColor()}
          `}
        />

        {/* Percentage Symbol */}
        {percentageMode && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            %
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Validation Icons */}
        {!loading && (error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error && (
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {success && (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {(error || success) && (
        <div className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {error || success}
        </div>
      )}

      {/* Min/Max Info */}
      {(min !== undefined || max !== undefined) && !error && !success && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {min !== undefined && max !== undefined && (
            <>Rango: {formatNumber(min)} - {formatNumber(max)}</>
          )}
          {min !== undefined && max === undefined && (
            <>Mínimo: {formatNumber(min)}</>
          )}
          {min === undefined && max !== undefined && (
            <>Máximo: {formatNumber(max)}</>
          )}
        </div>
      )}
    </div>
  )
}

export default MoneyInput