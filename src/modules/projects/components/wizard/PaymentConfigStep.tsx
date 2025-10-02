import { useEffect, useState } from 'react';
import { useProjectWizard } from '../../hooks/useProjectWizard';
import { formatCurrency, parseCurrency, formatDate } from '@/utils/formatters';
import { PaymentTimeline } from '../PaymentTimeline';
import { PaymentSummaryCard } from '../PaymentSummaryCard';

const PAYMENT_FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Mensual', description: '1 pago por mes' },
  { value: 'biweekly', label: 'Quincenal', description: '2 pagos por mes' },
  { value: 'weekly', label: 'Semanal', description: '4 pagos por mes' },
  { value: 'quarterly', label: 'Trimestral', description: '1 pago cada 3 meses' },
];

export function PaymentConfigStep() {
  const { formData, updateFormData } = useProjectWizard();
  const [downPaymentType, setDownPaymentType] = useState<'percentage' | 'amount'>('percentage');

  // Calculate payment details
  useEffect(() => {
    const totalAmount = formData.totalAmount || formData.estimatedValue || 0;
    const downPaymentAmount = formData.downPaymentAmount || 0;
    const remainingAmount = totalAmount - downPaymentAmount;
    const installmentCount = formData.installmentCount || 12;
    const installmentAmount = installmentCount > 0 ? remainingAmount / installmentCount : 0;

    updateFormData({
      totalAmount,
      installmentAmount: Math.round(installmentAmount * 100) / 100,
    });
  }, [formData.totalAmount, formData.downPaymentAmount, formData.installmentCount]);

  // Set default values
  useEffect(() => {
    if (!formData.installmentCount) {
      updateFormData({ 
        installmentCount: 12,
        paymentFrequency: 'monthly',
        downPaymentPercentage: 20,
        lateFeePercentage: 2,
        gracePeriodDays: 5,
      });
    }
  }, []);

  // Calculate down payment based on percentage
  useEffect(() => {
    if (downPaymentType === 'percentage' && formData.downPaymentPercentage) {
      const totalAmount = formData.totalAmount || 0;
      const downPaymentAmount = (totalAmount * formData.downPaymentPercentage) / 100;
      updateFormData({ downPaymentAmount: Math.round(downPaymentAmount * 100) / 100 });
    }
  }, [formData.downPaymentPercentage, formData.totalAmount, downPaymentType]);

  const handleTotalAmountChange = (value: string) => {
    const numValue = parseCurrency(value);
    updateFormData({ totalAmount: numValue });
  };

  const handleDownPaymentAmountChange = (value: string) => {
    const numValue = parseCurrency(value);
    const totalAmount = formData.totalAmount || 0;
    const percentage = totalAmount > 0 ? (numValue / totalAmount) * 100 : 0;
    updateFormData({ 
      downPaymentAmount: numValue,
      downPaymentPercentage: Math.round(percentage * 10) / 10,
    });
  };

  const handleDownPaymentPercentageChange = (value: string) => {
    const percentage = parseFloat(value) || 0;
    const totalAmount = formData.totalAmount || 0;
    const amount = (totalAmount * percentage) / 100;
    updateFormData({ 
      downPaymentPercentage: percentage,
      downPaymentAmount: Math.round(amount * 100) / 100,
    });
  };

  const remainingAmount = (formData.totalAmount || 0) - (formData.downPaymentAmount || 0);

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-light text-primary mb-2">Configuración Financiera</h2>
        <p className="text-sm text-tertiary">
          Define el plan de pagos y las condiciones financieras del proyecto
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="xl:col-span-2 space-y-6">
          {/* Total Project Value */}
          <div className="card-flat p-6">
            <label className="block text-sm font-normal text-secondary mb-2">
              Valor Total del Proyecto <span className="text-gray-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="text"
                value={formData.totalAmount ? formatCurrency(formData.totalAmount).replace('$', '').trim() : ''}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                className="input-field w-full pl-8 text-lg font-light"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-tertiary mt-2">
              Este es el monto total que el cliente deberá pagar por el proyecto
            </p>
          </div>

          {/* Payment Structure */}
          <div className="card-flat p-6">
            <h3 className="text-base font-normal text-secondary mb-4">Estructura de Pagos</h3>
            
            {/* Down Payment */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-normal text-secondary">
                  Anticipo / Seña
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDownPaymentType('percentage')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      downPaymentType === 'percentage' 
                        ? 'bg-gray-100/20 text-gray-600 border border-gray-200/30' 
                        : 'bg-gray-800/30 text-gray-400 border border-gray-700/30'
                    }`}
                  >
                    Porcentaje
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownPaymentType('amount')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      downPaymentType === 'amount' 
                        ? 'bg-gray-100/20 text-gray-600 border border-gray-200/30' 
                        : 'bg-gray-800/30 text-gray-400 border border-gray-700/30'
                    }`}
                  >
                    Monto Fijo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="text"
                      value={formData.downPaymentAmount ? formatCurrency(formData.downPaymentAmount).replace('$', '').trim() : ''}
                      onChange={(e) => handleDownPaymentAmountChange(e.target.value)}
                      className="input-field w-full pl-8"
                      placeholder="0"
                      disabled={downPaymentType === 'percentage'}
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.downPaymentPercentage || ''}
                      onChange={(e) => handleDownPaymentPercentageChange(e.target.value)}
                      className="input-field w-full pr-8"
                      placeholder="20"
                      min="0"
                      max="100"
                      disabled={downPaymentType === 'amount'}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-tertiary mb-1">Fecha de Pago del Anticipo</label>
                <input
                  type="date"
                  value={formData.downPaymentDate || ''}
                  onChange={(e) => updateFormData({ downPaymentDate: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Installment Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-normal text-secondary">Plan de Cuotas</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-tertiary">Monto a financiar:</span>
                  <span className="text-base font-light text-gray-600">
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-tertiary mb-1">
                    Número de Cuotas <span className="text-gray-600">*</span>
                  </label>
                  <select 
                    className="select-field w-full"
                    value={formData.installmentCount || 12}
                    onChange={(e) => updateFormData({ installmentCount: parseInt(e.target.value) })}
                  >
                    {[...Array(120)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'cuota' : 'cuotas'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-tertiary mb-1">
                    Frecuencia de Pago
                  </label>
                  <select 
                    className="select-field w-full"
                    value={formData.paymentFrequency || 'monthly'}
                    onChange={(e) => updateFormData({ paymentFrequency: e.target.value as any })}
                  >
                    {PAYMENT_FREQUENCY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-tertiary mb-1">
                    Primera Cuota
                  </label>
                  <input
                    type="date"
                    value={formData.firstPaymentDate || ''}
                    onChange={(e) => updateFormData({ firstPaymentDate: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Payment Amount Display */}
              <div className="bg-gray-900/10 border border-gray-200/30 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monto de Cada Cuota</span>
                  <span className="text-xl font-light text-gray-600">
                    {formatCurrency(formData.installmentAmount || 0)}
                  </span>
                </div>
                <div className="text-xs text-gray-600/70 mt-1">
                  {formData.installmentCount} pagos de {formatCurrency(formData.installmentAmount || 0)} cada uno
                </div>
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div className="card-flat p-6">
            <h3 className="text-base font-normal text-secondary mb-4">Términos Adicionales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Cargo por Pago Tardío
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.lateFeePercentage || ''}
                        onChange={(e) => updateFormData({ lateFeePercentage: parseFloat(e.target.value) })}
                        className="input-field w-full pr-8"
                        placeholder="2"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  </div>
                  <select 
                    className="select-field w-32"
                    value={formData.lateFeeType || 'percentage'}
                    onChange={(e) => updateFormData({ lateFeeType: e.target.value as any })}
                  >
                    <option value="percentage">% del pago</option>
                    <option value="fixed">Monto fijo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Período de Gracia (días)
                </label>
                <input
                  type="number"
                  value={formData.gracePeriodDays || ''}
                  onChange={(e) => updateFormData({ gracePeriodDays: parseInt(e.target.value) })}
                  className="input-field w-full"
                  placeholder="5"
                  min="0"
                  max="30"
                />
                <p className="text-xs text-tertiary mt-1">
                  Días después del vencimiento antes de aplicar cargos por mora
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Timeline & Summary */}
        <div className="space-y-6">
          <PaymentTimeline formData={formData} />
          <PaymentSummaryCard formData={formData} />
        </div>
      </div>
    </div>
  );
}