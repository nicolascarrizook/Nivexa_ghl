import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { currencyService } from '@/services/CurrencyService';
import type { PaymentConfirmation } from '../types/project.types';
import type { Currency } from '@/services/CurrencyService';
import { cn } from '@/lib/utils';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmation: PaymentConfirmation) => void;
  amount: number;
  currency: Currency;
  projectName: string;
  installmentNumber?: number;
  exchangeRate?: number;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  amount,
  currency,
  projectName,
  installmentNumber,
  exchangeRate = 1
}: PaymentConfirmationModalProps) {
  const [formData, setFormData] = useState<PaymentConfirmation>({
    confirmed: false,
    paymentMethod: '',
    referenceNumber: '',
    bankAccount: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentMethod) {
      return;
    }
    
    setIsSubmitting(true);
    
    const confirmation: PaymentConfirmation = {
      ...formData,
      confirmed: true,
      confirmedAt: new Date().toISOString(),
    };

    try {
      // Simply pass the confirmation data to the parent component
      // The parent component (PaymentSelectionModal) will handle the actual payment processing
      await onConfirm(confirmation);
      onClose();
      
      setFormData({
        confirmed: false,
        paymentMethod: '',
        referenceNumber: '',
        bankAccount: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error al confirmar el pago. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'check', label: 'Cheque' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'debit_card', label: 'Tarjeta de Débito' },
    { value: 'crypto', label: 'Criptomoneda' },
    { value: 'other', label: 'Otro' },
  ];

  const bankAccounts = [
    { value: 'cuenta_corriente_ars', label: 'Cuenta Corriente ARS' },
    { value: 'cuenta_corriente_usd', label: 'Cuenta Corriente USD' },
    { value: 'caja_ahorro_ars', label: 'Caja de Ahorro ARS' },
    { value: 'caja_ahorro_usd', label: 'Caja de Ahorro USD' },
    { value: 'mercado_pago', label: 'Mercado Pago' },
    { value: 'other', label: 'Otra cuenta' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with stronger blur for nested modal */}
      <div
        className="fixed inset-0 backdrop-blur-md bg-black/40 z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-[10%] z-[70] mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Confirmar Recepción de Pago
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {projectName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Warning */}
          <div className="mx-6 mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-600">
                  Sistema Doble Caja
                </p>
                <p className="text-gray-600 mt-1">
                  Al confirmar, se registrará el ingreso en la caja del proyecto y se duplicará en la Caja Financiera.
                  Esta acción no se puede deshacer automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Amount */}
            <div className="text-center py-4">
              <div className="text-3xl font-semibold text-gray-900">
                {currencyService.formatCurrency(amount, currency)}
              </div>
              {currency === 'USD' && exchangeRate > 1 && (
                <div className="text-sm text-gray-500 mt-1">
                  {currencyService.formatCurrency(amount * exchangeRate, 'ARS')}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              >
                <option value="">Seleccionar</option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Account */}
            {formData.paymentMethod === 'bank_transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuenta Bancaria
                </label>
                <select
                  value={formData.bankAccount || ''}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="">Seleccionar</option>
                  {bankAccounts.map(account => (
                    <option key={account.value} value={account.value}>
                      {account.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Referencia
              </label>
              <input
                type="text"
                value={formData.referenceNumber || ''}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Opcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.paymentMethod}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-300",
                  isSubmitting || !formData.paymentMethod
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800"
                )}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}