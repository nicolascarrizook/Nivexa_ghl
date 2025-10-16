import { useState, useEffect } from 'react';
import { X, ArrowRight, DollarSign, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { exchangeRateService } from '@/services/ExchangeRateService';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';
import { currencyService } from '@/services/CurrencyService';

interface MasterCurrencyConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableBalanceARS: number;
  availableBalanceUSD: number;
}

export function MasterCurrencyConversionModal({
  isOpen,
  onClose,
  onSuccess,
  availableBalanceARS,
  availableBalanceUSD,
}: MasterCurrencyConversionModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);
  const [direction, setDirection] = useState<'ARS_TO_USD' | 'USD_TO_ARS'>('ARS_TO_USD');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<{
    buy: number;
    sell: number;
    lastUpdate: Date;
  } | null>(null);

  // Load exchange rate on mount
  useEffect(() => {
    if (isOpen) {
      loadExchangeRate();
    }
  }, [isOpen]);

  const loadExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const rate = await exchangeRateService.getExchangeRate('blue');
      setExchangeRate(rate);
    } catch (error: any) {
      console.error('Error loading exchange rate:', error);
      toast.error('Error al cargar la cotización');
    } finally {
      setLoadingRate(false);
    }
  };

  const getRateToUse = () => {
    if (!exchangeRate) return 0;
    // ARS → USD: usar precio de compra (lo que te dan por tus pesos)
    // USD → ARS: usar precio de venta (lo que te dan por tus dólares)
    return direction === 'ARS_TO_USD' ? exchangeRate.buy : exchangeRate.sell;
  };

  const calculateConvertedAmount = () => {
    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount) || inputAmount <= 0 || !exchangeRate) return 0;

    const rate = getRateToUse();
    if (direction === 'ARS_TO_USD') {
      return inputAmount / rate;
    } else {
      return inputAmount * rate;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const inputAmount = parseFloat(amount);

      if (isNaN(inputAmount) || inputAmount <= 0) {
        toast.error('Ingrese un monto válido');
        return;
      }

      if (!exchangeRate) {
        toast.error('No se pudo obtener la cotización');
        return;
      }

      // Validate sufficient funds
      const availableBalance = direction === 'ARS_TO_USD' ? availableBalanceARS : availableBalanceUSD;
      if (inputAmount > availableBalance) {
        toast.error(`Fondos insuficientes. Disponible: ${currencyService.formatCurrency(availableBalance, direction === 'ARS_TO_USD' ? 'ARS' : 'USD')}`);
        return;
      }

      const rate = getRateToUse();
      const fromCurrency = direction === 'ARS_TO_USD' ? 'ARS' : 'USD';
      const toCurrency = direction === 'ARS_TO_USD' ? 'USD' : 'ARS';

      await newCashBoxService.convertMasterCurrency({
        fromCurrency,
        toCurrency,
        amount: inputAmount,
        exchangeRate: rate,
        description: `Conversión ${fromCurrency} → ${toCurrency} (Dólar Blue: $${rate.toFixed(2)})`,
      });

      toast.success('Conversión realizada exitosamente');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error converting currency:', error);
      toast.error(error.message || 'Error al realizar la conversión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDirection('ARS_TO_USD');
    onClose();
  };

  if (!isOpen) return null;

  const convertedAmount = calculateConvertedAmount();
  const fromCurrency = direction === 'ARS_TO_USD' ? 'ARS' : 'USD';
  const toCurrency = direction === 'ARS_TO_USD' ? 'USD' : 'ARS';
  const availableBalance = direction === 'ARS_TO_USD' ? availableBalanceARS : availableBalanceUSD;
  const rate = getRateToUse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Conversión de Divisas - Caja Master</h2>
              <p className="text-sm text-gray-500">Dólar Blue - Cotización en tiempo real</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Exchange Rate Display */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">Dólar Blue</div>
              {loadingRate ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Cargando...</span>
                </div>
              ) : exchangeRate ? (
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-xs text-gray-500">Compra</div>
                    <div className="text-lg font-bold text-green-600">
                      ${exchangeRate.buy.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Venta</div>
                    <div className="text-lg font-bold text-blue-600">
                      ${exchangeRate.sell.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-600">Error al cargar cotización</div>
              )}
            </div>
            <button
              onClick={loadExchangeRate}
              disabled={loadingRate}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
              title="Actualizar cotización"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${loadingRate ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {exchangeRate && (
            <div className="text-xs text-gray-500 mt-2">
              Última actualización: {new Date(exchangeRate.lastUpdate).toLocaleString('es-AR')}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Direction Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dirección de Conversión
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDirection('ARS_TO_USD')}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${direction === 'ARS_TO_USD'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">💵 → 💵</div>
                  <div className="text-sm font-medium text-gray-900">Pesos a Dólares</div>
                  <div className="text-xs text-gray-500 mt-1">ARS → USD</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDirection('USD_TO_ARS')}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${direction === 'USD_TO_ARS'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">💵 → 💵</div>
                  <div className="text-sm font-medium text-gray-900">Dólares a Pesos</div>
                  <div className="text-xs text-gray-500 mt-1">USD → ARS</div>
                </div>
              </button>
            </div>
          </div>

          {/* Available Balance */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Saldo Disponible</div>
            <div className="text-lg font-bold text-gray-900">
              {currencyService.formatCurrency(availableBalance, fromCurrency)}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a Convertir ({fromCurrency})
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Conversion Result */}
          {amount && parseFloat(amount) > 0 && exchangeRate && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Recibirás</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currencyService.formatCurrency(convertedAmount, toCurrency)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Tasa: {fromCurrency} 1 = {toCurrency} {rate.toFixed(2)}
                  </div>
                </div>
                <ArrowRight className="h-8 w-8 text-green-600" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !exchangeRate || !amount || parseFloat(amount) <= 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Convirtiendo...' : 'Confirmar Conversión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
