import { useState } from 'react';
import { Wallet, Plus, DollarSign, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useContractorAccountStatement } from '../hooks/useContractorAccountStatement';
import { contractorPaymentService } from '../services';
import { formatCurrency, formatCurrencyUSD } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

interface SimplePayableAccountProps {
  projectContractorId: string;
  projectId: string;
  contractorName: string;
  budgetAmount: number;
  currency: 'ARS' | 'USD';
  onPaymentRegistered?: () => void;
}

/**
 * Componente simplificado para gestionar cuentas por pagar a contractors
 *
 * Flujo simple:
 * 1. Muestra deuda total y cuánto se ha pagado
 * 2. Permite registrar pagos manuales
 * 3. Valida fondos disponibles en la caja según moneda
 * 4. Actualiza barra de progreso automáticamente
 */
export function SimplePayableAccount({
  projectContractorId,
  projectId,
  contractorName,
  budgetAmount,
  currency,
  onPaymentRegistered,
}: SimplePayableAccountProps) {
  const { data: statement, isLoading, refetch } = useContractorAccountStatement(projectContractorId);

  // Obtener el balance REAL de la caja del proyecto
  const { data: projectCashBox } = useQuery({
    queryKey: ['project-cash-box', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_cash_box')
        .select('current_balance_ars, current_balance_usd')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
    refetchInterval: 5000, // Refrescar cada 5 segundos para mostrar balance actualizado
  });

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatAmount = (amount: number) => {
    return currency === 'USD' ? formatCurrencyUSD(amount) : formatCurrency(amount);
  };

  const totalPaid = statement?.total_paid || 0;
  const debtBalance = budgetAmount - totalPaid; // Saldo de la deuda (cuánto falta pagar)
  const progressPercentage = budgetAmount > 0 ? (totalPaid / budgetAmount) * 100 : 0;

  // Balance disponible en la caja del proyecto (según moneda)
  const availableCashBalance = currency === 'USD'
    ? (projectCashBox?.current_balance_usd || 0)
    : (projectCashBox?.current_balance_ars || 0);

  const handleRegisterPayment = async () => {
    if (paymentAmount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    // Validación cliente: verificar si hay suficiente dinero en la caja
    if (paymentAmount > availableCashBalance) {
      alert(
        `❌ Fondos insuficientes en la caja del proyecto\n\n` +
        `💰 Monto a pagar: ${formatAmount(paymentAmount)}\n` +
        `📊 Fondos disponibles en caja ${currency}: ${formatAmount(availableCashBalance)}\n` +
        `❌ Déficit: ${formatAmount(paymentAmount - availableCashBalance)}\n\n` +
        `Por favor, registre un ingreso adicional al proyecto antes de realizar este pago.`
      );
      return;
    }

    if (paymentAmount > debtBalance) {
      const confirm = window.confirm(
        `El monto (${formatAmount(paymentAmount)}) excede el saldo pendiente (${formatAmount(debtBalance)}).\n\n¿Deseas continuar de todos modos?`
      );
      if (!confirm) return;
    }

    setIsProcessing(true);

    try {
      // Registrar y procesar el pago en una sola operación
      // Esto valida fondos disponibles en la caja según la moneda
      const { data, error } = await contractorPaymentService.registerAndProcessPayment({
        projectContractorId,
        amount: paymentAmount,
        currency: currency,
        notes: paymentNotes || `Pago a ${contractorName}`,
      });

      if (error) {
        throw error;
      }

      // Éxito
      alert(`✅ Pago registrado exitosamente\n\nMonto: ${formatAmount(paymentAmount)}\nLos fondos se han deducido de la caja del proyecto.`);

      setShowPaymentForm(false);
      setPaymentAmount(0);
      setPaymentNotes('');

      // Refrescar datos
      await refetch();
      onPaymentRegistered?.();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);

      let errorMessage = error.message || 'Error desconocido';

      if (errorMessage.includes('Fondos insuficientes')) {
        // Error de fondos insuficientes ya viene formateado
        alert(`❌ ${errorMessage}`);
      } else {
        alert(`❌ Error al procesar el pago:\n\n${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Verificar si hay fondos insuficientes en la caja
  const hasInsufficientFunds = availableCashBalance < debtBalance;

  return (
    <div className="space-y-6">
      {/* Alerta de fondos insuficientes */}
      {hasInsufficientFunds && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-800">Fondos insuficientes en caja</h3>
              <p className="text-sm text-orange-700 mt-1">
                La caja del proyecto tiene {formatAmount(availableCashBalance)} {currency} disponibles,
                pero la deuda pendiente es de {formatAmount(debtBalance)} {currency}.
                Registre un ingreso adicional al proyecto para poder realizar pagos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header con información del contractor */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Cuenta por Pagar</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">{contractorName}</p>
            </div>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Registrar Pago
            </button>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Deuda Total */}
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Deuda Total</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatAmount(budgetAmount)}
              </div>
            </div>

            {/* Total Pagado */}
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Total Pagado</div>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(totalPaid)}
              </div>
              <div className="text-xs text-gray-600">
                {progressPercentage.toFixed(1)}% pagado
              </div>
            </div>

            {/* Saldo Pendiente */}
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Saldo Pendiente</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatAmount(debtBalance)}
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso de Pago</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Último pago */}
          {statement?.last_payment_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Último pago:</span>
              <span className="font-medium text-gray-900">
                {new Date(statement.last_payment_date).toLocaleDateString('es-AR')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de Registro de Pago */}
      {showPaymentForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Registrar Nuevo Pago</h4>
          </div>

          <div className="space-y-4">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto a Pagar ({currency}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentAmount || ''}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-1 space-y-1">
                <p className="text-xs text-gray-600">
                  💰 Fondos disponibles en caja {currency}: {formatAmount(availableCashBalance)}
                </p>
                <p className="text-xs text-gray-500">
                  📋 Deuda pendiente: {formatAmount(debtBalance)}
                </p>
              </div>
            </div>

            {/* Concepto/Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concepto / Notas
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder={`Pago a ${contractorName}`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Info de validación */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Validación automática de fondos</p>
                  <p>
                    El sistema verificará que haya fondos suficientes en la caja del proyecto
                    en <strong>{currency}</strong> antes de procesar el pago.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentForm(false);
                  setPaymentAmount(0);
                  setPaymentNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegisterPayment}
                disabled={isProcessing || paymentAmount <= 0}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : 'Registrar y Pagar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Pagos */}
      {statement && statement.payment_history && statement.payment_history.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h4>
          <div className="space-y-3">
            {statement.payment_history.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatAmount(payment.amount)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(payment.date).toLocaleDateString('es-AR')}
                    {payment.notes && ` · ${payment.notes}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
