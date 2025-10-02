import { useState, useEffect } from 'react';
import { X, DollarSign, Percent, Calculator } from 'lucide-react';
import { currencyService } from '@/services/CurrencyService';
import type { Currency } from '@/services/CurrencyService';

interface AdminFeeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feePercentage?: number, feeAmount?: number) => void;
  installmentAmount: number;
  installmentNumber: number;
  currency: Currency;
  defaultPercentage: number;
  isDownPayment?: boolean;
}

export function AdminFeeConfigModal({
  isOpen,
  onClose,
  onConfirm,
  installmentAmount,
  installmentNumber,
  currency,
  defaultPercentage,
  isDownPayment = false
}: AdminFeeConfigModalProps) {
  const [feeType, setFeeType] = useState<'percentage' | 'fixed' | 'none'>('percentage');
  const [feePercentage, setFeePercentage] = useState<number>(defaultPercentage);
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [calculatedFee, setCalculatedFee] = useState<number>(0);

  useEffect(() => {
    if (feeType === 'percentage') {
      setCalculatedFee((installmentAmount * feePercentage) / 100);
    } else if (feeType === 'fixed') {
      setCalculatedFee(feeAmount);
    } else {
      setCalculatedFee(0);
    }
  }, [feeType, feePercentage, feeAmount, installmentAmount]);

  const handleConfirm = () => {
    if (feeType === 'none') {
      onConfirm(0, 0);
    } else if (feeType === 'percentage') {
      onConfirm(feePercentage, undefined);
    } else {
      onConfirm(undefined, feeAmount);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[60] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Configurar Honorarios Administrativos
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isDownPayment ? 'Anticipo' : `Cuota #${installmentNumber}`} - {currencyService.formatCurrency(installmentAmount, currency)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Fee Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Honorarios
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFeeType('percentage')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  feeType === 'percentage'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Percent className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                <div className="text-sm font-medium">Porcentaje</div>
              </button>

              <button
                type="button"
                onClick={() => setFeeType('fixed')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  feeType === 'fixed'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                <div className="text-sm font-medium">Monto Fijo</div>
              </button>

              <button
                type="button"
                onClick={() => setFeeType('none')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  feeType === 'none'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <X className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                <div className="text-sm font-medium">Sin Honorarios</div>
              </button>
            </div>
          </div>

          {/* Configuration based on type */}
          {feeType === 'percentage' && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de Honorarios
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <span className="text-gray-600">%</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Sugerido: {isDownPayment ? '20%' : '15%'} para {isDownPayment ? 'anticipo' : 'cuotas'}
              </div>
            </div>
          )}

          {feeType === 'fixed' && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto de Honorarios
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">{currency === 'USD' ? 'US$' : '$'}</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Fee Summary */}
          {feeType !== 'none' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Honorarios Calculados:
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {currencyService.formatCurrency(calculatedFee, currency)}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Sobre pago de {currencyService.formatCurrency(installmentAmount, currency)}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Confirmar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}