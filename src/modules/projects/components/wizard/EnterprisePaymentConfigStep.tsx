import React, { useEffect, useState } from 'react';
import { useProjectWizard } from '../../hooks/useProjectWizard';
import { currencyService } from '@/services/CurrencyService';
import { PaymentConfirmationModal } from '../PaymentConfirmationModal';
import type { Currency } from '@/services/CurrencyService';
import type { PaymentConfirmation } from '../../types/project.types';
import { useCurrencyDisplay } from '@/hooks/useCurrencyExchange';
import { RefreshCw } from 'lucide-react';
import { InstallmentBreakdown } from '../InstallmentBreakdown';
import { calculateInstallmentPlan, generateMilestonePaymentPlan } from '../../utils/installmentCalculator';

export function EnterprisePaymentConfigStep() {
  const { formData, updateFormData } = useProjectWizard();
  const [calculatedValues, setCalculatedValues] = useState({
    installmentAmount: 0,
    downPaymentPercentage: 0,
    financedAmount: 0,
  });
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Use the currency display hook for real-time exchange rates
  const { 
    displayRate, 
    displaySource, 
    displayLastUpdate,
    exchangeRateValue, 
    isLoading: isLoadingRate, 
    error: rateError, 
    refresh: refreshRate 
  } = useCurrencyDisplay();

  // Calculate installment plan
  const installmentPlan = React.useMemo(() => {
    const totalAmount = formData.totalAmount || formData.estimatedValue || 0;
    const downPaymentAmount = formData.downPaymentAmount || 0;
    const installmentCount = formData.installmentCount || 0;
    const currency = (formData.currency as 'USD' | 'ARS') || 'ARS';
    const frequency = (formData.paymentFrequency as 'monthly' | 'biweekly' | 'weekly' | 'quarterly') || 'monthly';

    if (totalAmount <= 0) return [];

    // For architectural projects, use milestone-based plan if no specific installment count
    if (installmentCount <= 0 || installmentCount === 1) {
      return generateMilestonePaymentPlan(totalAmount, currency);
    }

    // Otherwise use regular installment plan with the selected frequency
    return calculateInstallmentPlan({
      totalAmount,
      downPaymentAmount,
      installmentCount,
      currency,
      startDate: new Date(),
      frequency,
    });
  }, [
    formData.totalAmount,
    formData.estimatedValue,
    formData.downPaymentAmount,
    formData.installmentCount,
    formData.currency,
    formData.paymentFrequency,
  ]);

  // Load exchange rate when currency changes or when exchangeRateValue updates
  useEffect(() => {
    if (formData.currency === 'USD' && exchangeRateValue) {
      setExchangeRate(exchangeRateValue);
      updateFormData({ exchangeRate: exchangeRateValue });
    } else if (formData.currency === 'ARS') {
      setExchangeRate(1);
      updateFormData({ exchangeRate: 1 });
    }
  }, [formData.currency, exchangeRateValue, updateFormData]);

  // Calculate values when relevant fields change
  useEffect(() => {
    const totalAmount = formData.totalAmount || formData.estimatedValue || 0;
    const downPaymentAmount = formData.downPaymentAmount || 0;
    const installmentCount = formData.installmentCount || 1;
    
    const financedAmount = totalAmount - downPaymentAmount;
    const installmentAmount = financedAmount > 0 && installmentCount > 0 ? financedAmount / installmentCount : 0;
    const downPaymentPercentage = totalAmount > 0 ? (downPaymentAmount / totalAmount) * 100 : 0;

    setCalculatedValues({
      installmentAmount,
      downPaymentPercentage,
      financedAmount,
    });

    // Update form data with calculated values
    updateFormData({
      installmentAmount: installmentAmount > 0 ? installmentAmount : undefined,
      downPaymentPercentage: downPaymentPercentage > 0 ? downPaymentPercentage : undefined,
    });
  }, [formData.totalAmount, formData.estimatedValue, formData.downPaymentAmount, formData.installmentCount, updateFormData]);

  const handleTotalAmountChange = (value: number | undefined) => {
    updateFormData({ totalAmount: value });
  };

  const handleDownPaymentAmountChange = (value: number | undefined) => {
    updateFormData({ downPaymentAmount: value });
  };

  const handleDownPaymentPercentageChange = (percentage: number) => {
    const totalAmount = formData.totalAmount || formData.estimatedValue || 0;
    const downPaymentAmount = totalAmount > 0 ? (totalAmount * percentage) / 100 : 0;
    updateFormData({ downPaymentAmount });
  };

  const handleCurrencyChange = (currency: Currency) => {
    updateFormData({ currency });
  };

  const handlePaymentConfirmation = (confirmation: PaymentConfirmation) => {
    updateFormData({ 
      paymentConfirmation: confirmation,
      exchangeRate: exchangeRate // Store the exchange rate for later use
    });
    setShowPaymentModal(false);
  };

  const formatCurrency = (amount: number) => {
    const currency = (formData.currency as Currency) || 'ARS';
    return currencyService.formatCurrency(amount, currency);
  };

  // Constants for payment methods and bank accounts
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

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-xl text-gray-900 mb-2">Configuración Financiera</h2>
        <p className="text-sm text-gray-600">
          Configure la estructura de pagos y términos financieros para este proyecto
        </p>
      </div>

      <div className="space-y-8">
        {/* Currency Selection */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Moneda del Proyecto</h3>
            <p className="text-xs text-gray-600">Seleccione la moneda en la cual se facturará y cobrará el proyecto</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Currency Selection */}
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm text-gray-700">
                Moneda <span className="text-gray-600">*</span>
              </label>
              <select
                id="currency"
                value={formData.currency || 'ARS'}
                onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares Estadounidenses (USD)</option>
              </select>
            </div>

            {/* Exchange Rate - only show for USD */}
            {formData.currency === 'USD' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Cotización Actual</label>
                  <button
                    type="button"
                    onClick={refreshRate}
                    disabled={isLoadingRate}
                    className="text-xs text-gray-600 hover:text-gray-600 flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
                    {isLoadingRate ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
                <div className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-900">
                  {isLoadingRate ? (
                    <span className="text-gray-500">Obteniendo cotización...</span>
                  ) : rateError ? (
                    <span className="text-gray-600">Error al obtener cotización. Usando valor por defecto.</span>
                  ) : (
                    displayRate
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {!isLoadingRate && !rateError && displaySource ? `Fuente: ${displaySource}` : 'Cotización actualizada automáticamente'}
                  </p>
                  {!isLoadingRate && !rateError && displayLastUpdate && (
                    <p className="text-xs text-gray-500">
                      Actualizado: {displayLastUpdate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Financial Summary */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Valor del Proyecto</h3>
            <p className="text-xs text-gray-600">Establezca el valor total del proyecto y la estructura de pagos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Amount */}
            <div className="space-y-2">
              <label htmlFor="totalAmount" className="text-sm text-gray-700">
                Monto Total del Proyecto <span className="text-gray-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">
                  {currencyService.getCurrencySymbol((formData.currency as Currency) || 'ARS')}
                </span>
                <input
                  type="number"
                  id="totalAmount"
                  value={formData.totalAmount || ''}
                  onChange={(e) => handleTotalAmountChange(parseFloat(e.target.value) || undefined)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                />
              </div>
              <p className="text-xs text-gray-500">
                {formData.estimatedValue && formData.totalAmount !== formData.estimatedValue && (
                  `Valor estimado: ${formatCurrency(formData.estimatedValue)}`
                )}
              </p>
            </div>

            {/* Payment Frequency */}
            <div className="space-y-2">
              <label htmlFor="paymentFrequency" className="text-sm text-gray-700">
                Frecuencia de Pago
              </label>
              <select
                id="paymentFrequency"
                value={formData.paymentFrequency || 'monthly'}
                onChange={(e) => updateFormData({ paymentFrequency: e.target.value as 'monthly' | 'biweekly' | 'weekly' | 'quarterly' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              >
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="biweekly">Quincenal</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Down Payment Configuration */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Anticipo</h3>
            <p className="text-xs text-gray-600">Monto de pago inicial requerido para comenzar el proyecto</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Down Payment Amount */}
            <div className="space-y-2">
              <label htmlFor="downPaymentAmount" className="text-sm text-gray-700">
                Monto del Anticipo <span className="text-gray-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">
                  {currencyService.getCurrencySymbol((formData.currency as Currency) || 'ARS')}
                </span>
                <input
                  type="number"
                  id="downPaymentAmount"
                  value={formData.downPaymentAmount || ''}
                  onChange={(e) => handleDownPaymentAmountChange(parseFloat(e.target.value) || undefined)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                />
              </div>
            </div>

            {/* Down Payment Percentage */}
            <div className="space-y-2">
              <label htmlFor="downPaymentPercentage" className="text-sm text-gray-700">
                Porcentaje
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="downPaymentPercentage"
                  value={calculatedValues.downPaymentPercentage.toFixed(1)}
                  onChange={(e) => handleDownPaymentPercentageChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Down Payment Date */}
            <div className="space-y-2">
              <label htmlFor="downPaymentDate" className="text-sm text-gray-700">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                id="downPaymentDate"
                value={formData.downPaymentDate || ''}
                onChange={(e) => updateFormData({ downPaymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Installment Configuration */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Plan de Cuotas</h3>
            <p className="text-xs text-gray-600">Cronograma de pagos para el monto restante después del anticipo</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Number of Installments */}
            <div className="space-y-2">
              <label htmlFor="installmentCount" className="text-sm text-gray-700">
                Número de Cuotas <span className="text-gray-600">*</span>
              </label>
              <input
                type="number"
                id="installmentCount"
                value={formData.installmentCount || ''}
                onChange={(e) => updateFormData({ installmentCount: parseInt(e.target.value) || undefined })}
                placeholder="1"
                min="1"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              />
              <p className="text-xs text-gray-500">Máximo 120 cuotas (10 años)</p>
            </div>

            {/* Calculated Installment Amount */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Monto de Cuota</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-700">
                {calculatedValues.installmentAmount > 0 
                  ? formatCurrency(calculatedValues.installmentAmount)
                  : 'Calculado automáticamente'
                }
              </div>
              <p className="text-xs text-gray-500">Calculado basado en el monto financiado</p>
            </div>

            {/* First Payment Date */}
            <div className="space-y-2">
              <label htmlFor="firstPaymentDate" className="text-sm text-gray-700">
                Fecha de Primera Cuota
              </label>
              <input
                type="date"
                id="firstPaymentDate"
                value={formData.firstPaymentDate || ''}
                onChange={(e) => updateFormData({ firstPaymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Late Fee Configuration */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Política de Recargos</h3>
            <p className="text-xs text-gray-600">Penalizaciones por pagos tardíos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Late Fee Type */}
            <div className="space-y-2">
              <label htmlFor="lateFeeType" className="text-sm text-gray-700">
                Tipo de Recargo
              </label>
              <select
                id="lateFeeType"
                value={formData.lateFeeType || 'percentage'}
                onChange={(e) => updateFormData({ lateFeeType: e.target.value as 'fixed' | 'percentage' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              >
                <option value="percentage">Porcentaje del Pago</option>
                <option value="fixed">Monto Fijo</option>
              </select>
            </div>

            {/* Late Fee Amount/Percentage */}
            <div className="space-y-2">
              <label htmlFor="lateFeeAmount" className="text-sm text-gray-700">
                Recargo {formData.lateFeeType === 'fixed' ? 'Monto' : 'Porcentaje'}
              </label>
              <div className="relative">
                {formData.lateFeeType === 'fixed' && (
                  <span className="absolute left-3 top-2 text-sm text-gray-500">$</span>
                )}
                <input
                  type="number"
                  id="lateFeeAmount"
                  value={
                    formData.lateFeeType === 'fixed' 
                      ? (formData.lateFeeAmount || '') 
                      : (formData.lateFeePercentage || '')
                  }
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (formData.lateFeeType === 'fixed') {
                      updateFormData({ lateFeeAmount: value });
                    } else {
                      updateFormData({ lateFeePercentage: value });
                    }
                  }}
                  placeholder="0"
                  min="0"
                  step={formData.lateFeeType === 'fixed' ? '0.01' : '0.1'}
                  max={formData.lateFeeType === 'percentage' ? '100' : undefined}
                  className={`w-full ${formData.lateFeeType === 'fixed' ? 'pl-8 pr-3' : 'pl-3 pr-8'} py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white`}
                />
                {formData.lateFeeType === 'percentage' && (
                  <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
                )}
              </div>
            </div>

            {/* Grace Period */}
            <div className="space-y-2">
              <label htmlFor="gracePeriodDays" className="text-sm text-gray-700">
                Período de Gracia (Días)
              </label>
              <input
                type="number"
                id="gracePeriodDays"
                value={formData.gracePeriodDays || ''}
                onChange={(e) => updateFormData({ gracePeriodDays: parseInt(e.target.value) || undefined })}
                placeholder="0"
                min="0"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              />
              <p className="text-xs text-gray-500">Días después del vencimiento antes de que aplique el recargo</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {calculatedValues.financedAmount > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Resumen de Pagos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Valor Total del Proyecto</div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(formData.totalAmount || formData.estimatedValue || 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Anticipo</div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(formData.downPaymentAmount || 0)}
                  {calculatedValues.downPaymentPercentage > 0 && (
                    <span className="text-xs ml-1 text-gray-600">({calculatedValues.downPaymentPercentage.toFixed(1)}%)</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Monto Financiado</div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(calculatedValues.financedAmount)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">
                  Pago {formData.paymentFrequency === 'monthly' ? 'Mensual' : 
                   formData.paymentFrequency === 'quarterly' ? 'Trimestral' :
                   formData.paymentFrequency === 'biweekly' ? 'Quincenal' : 'Semanal'}
                </div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(calculatedValues.installmentAmount)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation */}
        {formData.downPaymentAmount && formData.downPaymentAmount > 0 && (
          <div className="space-y-6">
            <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Confirmación de Pago</h3>
              <p className="text-xs text-gray-600">
                El anticipo debe ser confirmado antes de crear el proyecto
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {!formData.paymentConfirmation?.confirmed ? (
                <div className="text-center space-y-4">
                  <div className="text-lg font-semibold text-gray-900">
                    Anticipo: {formatCurrency(formData.downPaymentAmount)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Para crear el proyecto, primero debe confirmar que ha recibido el anticipo del cliente.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirmar Recepción del Anticipo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-600">
                        Pago Confirmado
                      </h4>
                      <p className="text-sm text-gray-600">
                        Anticipo de {formatCurrency(formData.downPaymentAmount)} confirmado
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Método de Pago:</div>
                      <div className="font-medium text-gray-900">
                        {paymentMethods.find(m => m.value === formData.paymentConfirmation.paymentMethod)?.label || formData.paymentConfirmation.paymentMethod}
                      </div>
                    </div>
                    {formData.paymentConfirmation.referenceNumber && (
                      <div>
                        <div className="text-gray-600">Referencia:</div>
                        <div className="font-medium text-gray-900">{formData.paymentConfirmation.referenceNumber}</div>
                      </div>
                    )}
                    {formData.paymentConfirmation.bankAccount && (
                      <div>
                        <div className="text-gray-600">Cuenta:</div>
                        <div className="font-medium text-gray-900">
                          {bankAccounts.find(a => a.value === formData.paymentConfirmation.bankAccount)?.label || formData.paymentConfirmation.bankAccount}
                        </div>
                      </div>
                    )}
                    {formData.paymentConfirmation.notes && (
                      <div className="md:col-span-2">
                        <div className="text-gray-600">Notas:</div>
                        <div className="font-medium text-gray-900">{formData.paymentConfirmation.notes}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => updateFormData({ paymentConfirmation: undefined })}
                      className="text-sm text-gray-600 hover:text-gray-600"
                    >
                      Cancelar confirmación
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Installment Breakdown */}
        {installmentPlan.length > 0 && (
          <div className="space-y-6">
            <InstallmentBreakdown
              installments={installmentPlan}
              totalAmount={formData.totalAmount || formData.estimatedValue || 0}
              currency={(formData.currency as 'USD' | 'ARS') || 'ARS'}
              exchangeRate={exchangeRate}
            />
          </div>
        )}

        {/* Administrative Fees Configuration */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Honorarios Administrativos</h3>
            <p className="text-xs text-gray-600">Configure los honorarios que se cobrarán por la administración del proyecto</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin Fee Type */}
            <div className="space-y-2">
              <label htmlFor="adminFeeType" className="text-sm text-gray-700">
                Tipo de Honorario <span className="text-gray-600">*</span>
              </label>
              <select
                id="adminFeeType"
                value={formData.adminFeeType || 'percentage'}
                onChange={(e) => updateFormData({ adminFeeType: e.target.value as 'percentage' | 'fixed' | 'manual' | 'none' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              >
                <option value="percentage">Porcentaje del Valor</option>
                <option value="fixed">Monto Fijo</option>
                <option value="none">Sin Honorarios</option>
              </select>
            </div>

            {/* Admin Fee Percentage - only show for percentage type */}
            {formData.adminFeeType !== 'none' && formData.adminFeeType !== 'fixed' && (
              <div className="space-y-2">
                <label htmlFor="adminFeePercentage" className="text-sm text-gray-700">
                  Porcentaje <span className="text-gray-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="adminFeePercentage"
                    value={formData.adminFeePercentage || ''}
                    onChange={(e) => updateFormData({ adminFeePercentage: parseFloat(e.target.value) || undefined })}
                    placeholder="15.0"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500">Porcentaje del valor total del proyecto</p>
              </div>
            )}

            {/* Admin Fee Fixed Amount - only show for fixed type */}
            {formData.adminFeeType === 'fixed' && (
              <div className="space-y-2">
                <label htmlFor="adminFeeAmount" className="text-sm text-gray-700">
                  Monto Fijo <span className="text-gray-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-500">
                    {currencyService.getCurrencySymbol((formData.currency as Currency) || 'ARS')}
                  </span>
                  <input
                    type="number"
                    id="adminFeeAmount"
                    value={formData.adminFeeAmount || ''}
                    onChange={(e) => updateFormData({ adminFeeAmount: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
                <p className="text-xs text-gray-500">Monto fijo independiente del valor del proyecto</p>
              </div>
            )}

            {/* Calculated Admin Fee Display */}
            {formData.adminFeeType !== 'none' && (
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Honorario Calculado</label>
                <div className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-700">
                  {(() => {
                    const totalAmount = formData.totalAmount || formData.estimatedValue || 0;
                    if (formData.adminFeeType === 'fixed') {
                      return formData.adminFeeAmount ? formatCurrency(formData.adminFeeAmount) : 'Ingrese el monto';
                    } else if (formData.adminFeeType === 'percentage') {
                      const percentage = formData.adminFeePercentage || 0;
                      const calculatedAmount = totalAmount * (percentage / 100);
                      return calculatedAmount > 0 ? formatCurrency(calculatedAmount) : 'Calculado automáticamente';
                    }
                    return 'Sin honorarios';
                  })()}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.adminFeeType === 'percentage' ? 
                    'Se cobrará sobre el valor total del proyecto' : 
                    'Monto que se reservará para honorarios administrativos'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contract Notes */}
        <div className="space-y-4">
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Notas del Contrato</h3>
            <p className="text-xs text-gray-600">Términos financieros adicionales o condiciones especiales</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contractNotes" className="text-sm text-gray-700">
              Términos Financieros Adicionales
            </label>
            <textarea
              id="contractNotes"
              value={formData.contractNotes || ''}
              onChange={(e) => updateFormData({ contractNotes: e.target.value })}
              placeholder="Cualquier condición especial de pago, descuentos o términos financieros adicionales..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white resize-none"
            />
            <p className="text-xs text-gray-500">Estas notas serán incluidas en el contrato del proyecto</p>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirmation}
          amount={formData.downPaymentAmount || 0}
          currency={(formData.currency as Currency) || 'ARS'}
          projectName={formData.projectName || 'Proyecto sin nombre'}
          projectId={formData.projectId}
          organizationId={formData.organizationId}
          clientId={formData.clientId}
          installmentNumber={0}
          exchangeRate={exchangeRate}
        />
      )}
    </div>
  );
}