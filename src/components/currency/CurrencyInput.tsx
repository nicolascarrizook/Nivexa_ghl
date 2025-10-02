import { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
  currency?: string;
  locale?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  required = false,
  min = 0,
  max = 9999999999.99,
  disabled = false,
  currency = 'ARS',
  locale = 'es-AR',
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    if (isNaN(num)) return '';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Parse formatted string to number
  const parseNumber = (str: string): number => {
    // Remove all non-numeric characters except decimal separators
    const cleaned = str.replace(/[^\d,.-]/g, '');
    // Replace comma with dot for parsing
    const normalized = cleaned.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatNumber(value) : '');
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    setDisplayValue(value > 0 ? value.toString().replace('.', ',') : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseNumber(displayValue);

    // Apply min/max constraints
    const constrainedValue = Math.min(Math.max(numValue, min), max);

    onChange(constrainedValue);
    setDisplayValue(constrainedValue > 0 ? formatNumber(constrainedValue) : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow only numbers, comma, dot, and minus
    const cleaned = input.replace(/[^\d,.-]/g, '');
    setDisplayValue(cleaned);

    // Update value immediately for validation
    const numValue = parseNumber(cleaned);
    if (!isNaN(numValue)) {
      onChange(Math.min(Math.max(numValue, min), max));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }

    // Ensure that it's a number, comma, or dot
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105) &&
        e.keyCode !== 188 && e.keyCode !== 190 && e.keyCode !== 110) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full pl-8 ${className}`}
        required={required}
        disabled={disabled}
        aria-label={`Monto en ${currency}`}
      />
      {max < 9999999999.99 && (
        <p className="mt-1 text-xs text-gray-500">
          Máximo: ${formatNumber(max)}
        </p>
      )}
    </div>
  );
}