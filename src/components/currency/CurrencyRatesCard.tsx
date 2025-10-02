import React from 'react';
import { SectionCard } from '@/design-system/components/layout/SectionCard';
import { Badge } from '@/design-system/components/data-display/Badge/Badge';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { useMultipleExchangeRates, useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { ExchangeRateType } from '@/services/currency/CurrencyService';

interface CurrencyRatesCardProps {
  className?: string;
  showAllRates?: boolean;
  compactMode?: boolean;
}

export function CurrencyRatesCard({ 
  className = '', 
  showAllRates = true,
  compactMode = false 
}: CurrencyRatesCardProps) {
  const { rates, isLoading, error, refresh } = useMultipleExchangeRates();
  const { formatARS } = useCurrencyExchange();

  const handleRefresh = async () => {
    await refresh();
  };

  if (error) {
    return (
      <SectionCard
        title="Cotizaciones del Dólar"
        icon={<DollarSign className="w-5 h-5" />}
        subtitle="Error al cargar las cotizaciones"
        background="white"
        className={className}
      >
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </SectionCard>
    );
  }

  if (isLoading) {
    return (
      <SectionCard
        title="Cotizaciones del Dólar"
        icon={<DollarSign className="w-5 h-5" />}
        subtitle="Cargando cotizaciones..."
        background="white"
        className={className}
      >
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </SectionCard>
    );
  }

  const formatVariation = (variation: number) => {
    if (variation === 0) return null;
    const isPositive = variation > 0;
    return (
      <div className={`flex items-center text-xs ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(variation).toFixed(2)}%
      </div>
    );
  };

  const getRateBadge = (type: string) => {
    const badgeConfig: Record<string, { variant: 'default' | 'primary' | 'info' | 'warning', label: string }> = {
      'Oficial': { variant: 'default', label: 'Oficial' },
      'Blue': { variant: 'primary', label: 'Blue' },
      'MEP': { variant: 'info', label: 'MEP' },
      'CCL': { variant: 'info', label: 'CCL' },
      'Cripto': { variant: 'warning', label: 'Cripto' },
      'Tarjeta': { variant: 'default', label: 'Tarjeta' },
    };
    
    const config = badgeConfig[type] || { variant: 'default' as const, label: type };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const displayRates = showAllRates ? rates : rates.slice(0, 2); // Show only oficial and blue in compact mode

  return (
    <SectionCard
      title="Cotizaciones del Dólar"
      icon={<DollarSign className="w-5 h-5" />}
      subtitle={`Actualizado: ${rates[0]?.lastUpdate ? new Date(rates[0].lastUpdate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}`}
      background="white"
      className={className}
      actions={[
        {
          id: 'refresh',
          label: 'Actualizar',
          icon: <RefreshCw className="w-4 h-4" />,
          onClick: handleRefresh,
        },
      ]}
    >
      {compactMode ? (
        <div className="grid grid-cols-2 gap-4">
          {displayRates.map((rate) => (
            <div key={rate.type} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                {getRateBadge(rate.type)}
                {formatVariation(rate.variation)}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatARS(rate.sell)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Compra: {formatARS(rate.buy)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayRates.map((rate) => (
            <div key={rate.type} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getRateBadge(rate.type)}
                    {formatVariation(rate.variation)}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Compra</p>
                      <p className="text-sm font-medium text-gray-900">{formatARS(rate.buy)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Venta</p>
                      <p className="text-sm font-medium text-gray-900">{formatARS(rate.sell)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Spread</p>
                      <p className="text-sm font-medium text-gray-900">{rate.spread.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400">Fuente: {rate.source}</p>
                <p className="text-xs text-gray-400">
                  {new Date(rate.timestamp).toLocaleTimeString('es-AR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export default CurrencyRatesCard;