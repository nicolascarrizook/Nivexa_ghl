import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, RefreshCw, Info } from 'lucide-react';
import { currencyConversionService } from '@/services/CurrencyConversionService';
import { exchangeRateService } from '@/services/ExchangeRateService';
import type { Currency, ExchangeRateSource } from '@/services/MasterCashService';
import { toast } from '@/hooks/useToast';

interface CurrencyConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalanceArs: number;
  currentBalanceUsd: number;
}

export function CurrencyConversionModal({
  isOpen,
  onClose,
  onSuccess,
  currentBalanceArs,
  currentBalanceUsd,
}: CurrencyConversionModalProps) {
  const [fromCurrency, setFromCurrency] = useState<Currency>('ARS');
  const [toCurrency, setToCurrency] = useState<Currency>('USD');
  const [amount, setAmount] = useState<string>('');
  const [exchangeRateSource, setExchangeRateSource] = useState<ExchangeRateSource>('blue');
  const [preview, setPreview] = useState<{ convertedAmount: number; rate: number } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [converting, setConverting] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<ExchangeRateSource, { buy: number; sell: number }>>({
    blue: { buy: 0, sell: 0 },
    oficial: { buy: 0, sell: 0 },
    mep: { buy: 0, sell: 0 },
    ccl: { buy: 0, sell: 0 },
  });

  // Load exchange rates on mount
  useEffect(() => {
    if (isOpen) {
      loadExchangeRates();
    }
  }, [isOpen]);

  // Update preview when inputs change
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      loadPreview();
    } else {
      setPreview(null);
    }
  }, [amount, fromCurrency, toCurrency, exchangeRateSource]);

  // Swap currencies when fromCurrency changes
  useEffect(() => {
    setToCurrency(fromCurrency === 'ARS' ? 'USD' : 'ARS');
  }, [fromCurrency]);

  const loadExchangeRates = async () => {
    try {
      const rates = await exchangeRateService.getAllRates();
      const ratesMap: Record<ExchangeRateSource, { buy: number; sell: number }> = {
        blue: { buy: rates.blue?.buy || 0, sell: rates.blue?.sell || 0 },
        oficial: { buy: rates.oficial?.buy || 0, sell: rates.oficial?.sell || 0 },
        mep: { buy: rates.mep?.buy || 0, sell: rates.mep?.sell || 0 },
        ccl: { buy: rates.ccl?.buy || 0, sell: rates.ccl?.sell || 0 },
      };
      setExchangeRates(ratesMap);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
      toast.error('Error al cargar las cotizaciones');
    }
  };

  const loadPreview = async () => {
    setLoadingPreview(true);
    try {
      const previewData = await currencyConversionService.previewConversion(
        fromCurrency,
        parseFloat(amount),
        toCurrency,
        exchangeRateSource
      );
      setPreview(previewData);
    } catch (error) {
      console.error('Error loading preview:', error);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConvert = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Ingrese un monto válido');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast.error('El monto debe ser mayor a cero');
      return;
    }

    // Validate balance
    const currentBalance = fromCurrency === 'ARS' ? currentBalanceArs : currentBalanceUsd;
    if (amountNum > currentBalance) {
      toast.error(`Saldo insuficiente en ${fromCurrency}. Disponible: ${currentBalance.toFixed(2)}`);
      return;
    }

    setConverting(true);
    try {
      const result = await currencyConversionService.convertCurrency({
        from_currency: fromCurrency,
        amount: amountNum,
        to_currency: toCurrency,
        exchange_rate_source: exchangeRateSource,
        notes: `Conversión manual desde UI - Cotización ${exchangeRateSource}`,
      });

      if (result.success) {
        toast.success(`Conversión exitosa: ${amountNum} ${fromCurrency} → ${preview?.convertedAmount} ${toCurrency}`);
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Error al realizar la conversión');
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      toast.error('Error al realizar la conversión');
    } finally {
      setConverting(false);
    }
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Convertir Moneda</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* From Currency Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda de Origen
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as Currency)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares Estadounidenses (USD)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Balance disponible: {formatCurrency(fromCurrency === 'ARS' ? currentBalanceArs : currentBalanceUsd, fromCurrency)}
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a Convertir
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {fromCurrency === 'ARS' ? '$' : 'US$'}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Exchange Rate Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cotización
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['blue', 'oficial', 'mep', 'ccl'] as ExchangeRateSource[]).map((source) => {
                  const rate = exchangeRates[source];
                  const isBlueRate = rate && exchangeRates.blue &&
                    rate.buy === exchangeRates.blue.buy &&
                    rate.sell === exchangeRates.blue.sell &&
                    source !== 'blue';

                  return (
                    <button
                      key={source}
                      onClick={() => setExchangeRateSource(source)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        exchangeRateSource === source
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isBlueRate ? 'opacity-60' : ''}`}
                      title={isBlueRate ? 'Usando cotización blue como referencia' : ''}
                    >
                      <p className="text-xs font-medium text-gray-900 capitalize">{source}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ${rate?.[fromCurrency === 'USD' ? 'sell' : 'buy'].toFixed(2) || '0.00'}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tasa {fromCurrency === 'USD' ? 'de venta' : 'de compra'} actualizada automáticamente
              </p>
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-900">Vista Previa</p>
                  <button
                    onClick={loadExchangeRates}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                    title="Actualizar"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(parseFloat(amount), fromCurrency)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{fromCurrency}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{preview.rate.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 capitalize">{exchangeRateSource}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(preview.convertedAmount, toCurrency)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{toCurrency}</p>
                  </div>
                </div>
              </div>
            )}

            {loadingPreview && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">Calculando conversión...</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={converting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConvert}
              disabled={converting || !preview || !amount}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {converting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Convirtiendo...
                </>
              ) : (
                'Confirmar Conversión'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}