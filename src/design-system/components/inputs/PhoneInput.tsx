import React, { useState, useEffect, useRef } from 'react'

export interface CountryOption {
  code: string
  name: string
  flag: string
  dialCode: string
  mask?: string
}

export interface PhoneInputProps {
  value: string
  onChange: (value: string, formattedValue: string, country: CountryOption) => void
  defaultCountry?: string
  countries?: CountryOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
  error?: string
  success?: string
  loading?: boolean
  showWhatsAppIcon?: boolean
  onBlur?: () => void
  onFocus?: () => void
}

// Common countries for Mexico CRM
const defaultCountries: CountryOption[] = [
  {
    code: 'MX',
    name: 'México',
    flag: '🇲🇽',
    dialCode: '+52',
    mask: '(XX) XXXX-XXXX'
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    dialCode: '+1',
    mask: '(XXX) XXX-XXXX'
  },
  {
    code: 'CA',
    name: 'Canadá',
    flag: '🇨🇦',
    dialCode: '+1',
    mask: '(XXX) XXX-XXXX'
  },
  {
    code: 'ES',
    name: 'España',
    flag: '🇪🇸',
    dialCode: '+34',
    mask: 'XXX XXX XXX'
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    dialCode: '+54',
    mask: '(XX) XXXX-XXXX'
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    dialCode: '+57',
    mask: '(XXX) XXX-XXXX'
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    dialCode: '+56',
    mask: 'X XXXX XXXX'
  },
  {
    code: 'PE',
    name: 'Perú',
    flag: '🇵🇪',
    dialCode: '+51',
    mask: 'XXX XXX XXX'
  }
]

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  defaultCountry = 'MX',
  countries = defaultCountries,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  error,
  success,
  loading = false,
  showWhatsAppIcon = true,
  onBlur,
  onFocus
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  )
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Format phone number according to country mask
  const formatPhoneNumber = (number: string, mask?: string): string => {
    if (!mask) return number
    
    const digits = number.replace(/\D/g, '')
    let formatted = ''
    let digitIndex = 0
    
    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
      if (mask[i] === 'X') {
        formatted += digits[digitIndex]
        digitIndex++
      } else {
        formatted += mask[i]
      }
    }
    
    return formatted
  }

  // Parse international phone number
  const parsePhoneNumber = (fullNumber: string): { country: CountryOption; number: string } => {
    const cleanNumber = fullNumber.replace(/\D/g, '')
    
    // Find matching country by dial code
    const matchingCountry = countries.find(country => {
      const dialCode = country.dialCode.replace('+', '')
      return cleanNumber.startsWith(dialCode)
    })
    
    if (matchingCountry) {
      const dialCode = matchingCountry.dialCode.replace('+', '')
      const localNumber = cleanNumber.substring(dialCode.length)
      return { country: matchingCountry, number: localNumber }
    }
    
    return { country: selectedCountry, number: cleanNumber }
  }

  // Validate phone number
  const validatePhoneNumber = (number: string, country: CountryOption): boolean => {
    const digits = number.replace(/\D/g, '')
    
    // Basic validation - at least 7 digits, max 15
    if (digits.length < 7 || digits.length > 15) return false
    
    // Country-specific validation
    switch (country.code) {
      case 'MX':
        return digits.length === 10 // Mexican mobile numbers
      case 'US':
      case 'CA':
        return digits.length === 10 // North American numbers
      case 'ES':
        return digits.length === 9 // Spanish numbers
      default:
        return digits.length >= 7 && digits.length <= 15
    }
  }

  // Check if number supports WhatsApp (simple heuristic)
  const supportsWhatsApp = (number: string, country: CountryOption): boolean => {
    const digits = number.replace(/\D/g, '')
    
    // Most mobile numbers support WhatsApp
    if (country.code === 'MX') {
      // Mexican mobile numbers start with 1, 2, 6, 7, or 8
      return /^[12678]/.test(digits)
    }
    
    return digits.length >= 8 // General rule
  }

  // Update phone number when value prop changes
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value)
      setSelectedCountry(parsed.country)
      setPhoneNumber(parsed.number)
    } else {
      setPhoneNumber('')
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country)
    setIsDropdownOpen(false)
    
    // Update the full phone number
    const fullNumber = phoneNumber ? `${country.dialCode}${phoneNumber}` : ''
    const formattedNumber = phoneNumber ? formatPhoneNumber(phoneNumber, country.mask) : ''
    onChange(fullNumber, formattedNumber, country)
    
    // Focus back to input
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const digits = inputValue.replace(/\D/g, '')
    
    setPhoneNumber(digits)
    
    const fullNumber = digits ? `${selectedCountry.dialCode}${digits}` : ''
    const formattedNumber = formatPhoneNumber(digits, selectedCountry.mask)
    onChange(fullNumber, formattedNumber, selectedCountry)
  }

  const handleFocus = () => {
    setFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setFocused(false)
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
      e.preventDefault()
    }
  }

  const getStatusColor = () => {
    if (error) return 'border-red-500 dark:border-red-400 focus:ring-red-500'
    if (success) return 'border-green-500 dark:border-green-400 focus:ring-green-500'
    return 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
  }

  const isValid = phoneNumber ? validatePhoneNumber(phoneNumber, selectedCountry) : true
  const hasWhatsApp = phoneNumber ? supportsWhatsApp(phoneNumber, selectedCountry) : false
  const formattedDisplay = phoneNumber ? formatPhoneNumber(phoneNumber, selectedCountry.mask) : ''

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex">
        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              px-3 py-2 bg-white dark:bg-gray-900 border border-r-0 rounded-l-lg
              flex items-center gap-2 min-w-[100px] text-sm
              focus:outline-none focus:ring-2 focus:border-transparent focus:z-10
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-50 dark:hover:bg-gray-800
              ${getStatusColor()}
            `}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-gray-600 dark:text-gray-300">{selectedCountry.dialCode}</span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Country Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 z-50 w-72 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3 text-sm"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="tel"
            id={id}
            name={name}
            value={formattedDisplay}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || selectedCountry.mask?.replace(/X/g, '0') || 'Número de teléfono'}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            className={`
              w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border rounded-r-lg
              focus:outline-none focus:ring-2 focus:border-transparent focus:z-10
              disabled:opacity-50 disabled:cursor-not-allowed
              ${(loading || hasWhatsApp) ? 'pr-20' : 'pr-10'}
              ${getStatusColor()}
            `}
          />

          {/* WhatsApp Icon */}
          {showWhatsAppIcon && hasWhatsApp && !loading && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center">
              <div 
                className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" 
                title="WhatsApp disponible"
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
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
      </div>

      {/* Helper Text */}
      {(error || success) && (
        <div className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {error || success}
        </div>
      )}

      {/* Validation Info */}
      {phoneNumber && !isValid && !error && (
        <div className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
          Formato de número no válido para {selectedCountry.name}
        </div>
      )}

      {/* WhatsApp Info */}
      {phoneNumber && isValid && hasWhatsApp && showWhatsAppIcon && !error && !success && (
        <div className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          WhatsApp disponible
        </div>
      )}
    </div>
  )
}

export default PhoneInput