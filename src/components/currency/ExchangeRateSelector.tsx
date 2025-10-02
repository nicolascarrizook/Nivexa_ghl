import React, { useState } from 'react';
import { ExchangeRateType } from '@/services/currency/CurrencyService';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { Badge } from '@/design-system/components/data-display/Badge/Badge';
import { ChevronDown, TrendingUp, Info } from 'lucide-react';

interface ExchangeRateSelectorProps {
  value: ExchangeRateType;
  onChange: (type: ExchangeRateType) => void;
  showRate?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ExchangeRateSelector({
  value,
  onChange,
  showRate = true,
  disabled = false,
  className = '',
}: ExchangeRateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { allRates, formatARS } = useCurrencyExchange({ includeAllRates: true });

  const rateOptions = [
    { 
      type: ExchangeRateType.OFICIAL, 
      label: 'Dólar Oficial', 
      description: 'Tipo de cambio oficial del BCRA',
      badgeVariant: 'default' as const,
    },
    { 
      type: ExchangeRateType.BLUE, 
      label: 'Dólar Blue', 
      description: 'Cotización del mercado paralelo',
      badgeVariant: 'primary' as const,
    },
    { 
      type: ExchangeRateType.MEP, 
      label: 'Dólar MEP', 
      description: 'Dólar bolsa o mercado electrónico de pagos',
      badgeVariant: 'info' as const,
    },
    { 
      type: ExchangeRateType.CCL, 
      label: 'Dólar CCL', 
      description: 'Contado con liquidación',
      badgeVariant: 'info' as const,
    },
    { 
      type: ExchangeRateType.CRIPTO, 
      label: 'Dólar Cripto', 
      description: 'Cotización en exchanges de criptomonedas',
      badgeVariant: 'warning' as const,
    },
    { 
      type: ExchangeRateType.TARJETA, 
      label: 'Dólar Tarjeta', 
      description: 'Incluye impuestos (PAIS + Ganancias)',
      badgeVariant: 'error' as const,
    },
  ];

  const selectedOption = rateOptions.find(opt => opt.type === value) || rateOptions[0];
  const currentRate = allRates?.[value as keyof typeof allRates] as any;

  const handleSelect = (type: ExchangeRateType) => {
    onChange(type);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tipo de Cambio
      </label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 border border-gray-200 rounded-lg
          bg-white text-left flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:ring-2 focus:ring-gray-900 focus:border-transparent'}
          transition-all
        `}
      >
        <div className="flex items-center space-x-3">
          <Badge variant={selectedOption.badgeVariant} size="sm">
            {selectedOption.label}
          </Badge>
          {showRate && currentRate && (
            <span className="text-sm text-gray-600">
              1 USD = {formatARS(currentRate.sell)}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {rateOptions.map((option) => {
              const rate = allRates?.[option.type as keyof typeof allRates] as any;
              const isSelected = option.type === value;
              
              return (
                <button
                  key={option.type}
                  onClick={() => handleSelect(option.type)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${isSelected ? 'bg-gray-50 border-l-2 border-gray-900' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={option.badgeVariant} size="sm">
                          {option.label}
                        </Badge>
                        {isSelected && (
                          <span className="text-xs text-gray-500">Seleccionado</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{option.description}</p>
                      {rate && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Compra:</span>
                            <span className="ml-1 font-medium text-gray-700">{formatARS(rate.buy)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Venta:</span>
                            <span className="ml-1 font-medium text-gray-700">{formatARS(rate.sell)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Spread:</span>
                            <span className="ml-1 font-medium text-gray-700">{rate.spread?.toFixed(2)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {rate?.variation !== 0 && rate?.variation && (
                      <div className={`flex items-center text-xs ${rate.variation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {Math.abs(rate.variation).toFixed(2)}%
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex items-start space-x-2">
                <Info className="w-3 h-3 text-gray-400 mt-0.5" />
                <p className="text-xs text-gray-500">
                  Las cotizaciones se actualizan automáticamente cada 30 minutos desde múltiples fuentes oficiales.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ExchangeRateSelector;