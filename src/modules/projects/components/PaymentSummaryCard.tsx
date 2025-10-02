import { formatCurrency } from '@/utils/formatters';
import type { ProjectFormData } from '../types';

interface PaymentSummaryCardProps {
  formData: ProjectFormData;
}

export function PaymentSummaryCard({ formData }: PaymentSummaryCardProps) {
  const totalAmount = formData.totalAmount || formData.estimatedValue || 0;
  const downPaymentAmount = formData.downPaymentAmount || 0;
  const financedAmount = totalAmount - downPaymentAmount;
  const installmentCount = formData.installmentCount || 12;
  const installmentAmount = formData.installmentAmount || 0;
  const lateFeePercentage = formData.lateFeePercentage || 0;
  
  // Calculate total with late fees (example: 5% of payments might be late)
  const estimatedLateFees = (installmentAmount * lateFeePercentage / 100) * Math.floor(installmentCount * 0.05);
  
  return (
    <div className="card-flat p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-normal text-secondary">Resumen Financiero</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-100 animate-pulse" />
          <span className="text-xs text-gray-600">Calculado en tiempo real</span>
        </div>
      </div>

      {/* Main amounts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-tertiary">Valor Total del Proyecto</span>
          <span className="text-lg font-light text-primary">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {downPaymentAmount > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-tertiary">Anticipo / Seña</span>
                {formData.downPaymentPercentage && (
                  <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-800/50 rounded">
                    {formData.downPaymentPercentage}%
                  </span>
                )}
              </div>
              <span className="text-base font-light text-gray-600">
                -{formatCurrency(downPaymentAmount)}
              </span>
            </div>

            <div className="border-t border-gray-800/30 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-tertiary">Monto a Financiar</span>
                <span className="text-base font-light text-gray-600">
                  {formatCurrency(financedAmount)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment details */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-tertiary">Plan de Pagos</span>
          <span className="text-xs text-gray-600">
            {installmentCount} {installmentCount === 1 ? 'cuota' : 'cuotas'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Cuota Regular</span>
            <span className="text-base font-normal text-primary">
              {formatCurrency(installmentAmount)}
            </span>
          </div>

          {lateFeePercentage > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Cargo por mora</span>
                <span className="text-xs text-gray-600">{lateFeePercentage}%</span>
              </div>
              <span className="text-xs text-gray-500">
                +{formatCurrency(installmentAmount * lateFeePercentage / 100)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Important dates */}
      {(formData.downPaymentDate || formData.firstPaymentDate) && (
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-normal text-tertiary uppercase tracking-wide">
            Fechas Importantes
          </h4>
          
          {formData.downPaymentDate && (
            <div className="flex items-center justify-between p-2 bg-gray-100/10 border border-gray-200/20 rounded">
              <span className="text-xs text-gray-600">Anticipo</span>
              <span className="text-xs text-gray-600">
                {new Date(formData.downPaymentDate).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          
          {formData.firstPaymentDate && (
            <div className="flex items-center justify-between p-2 bg-gray-900/10 border border-gray-200/20 rounded">
              <span className="text-xs text-gray-600">Primera Cuota</span>
              <span className="text-xs text-gray-600">
                {new Date(formData.firstPaymentDate).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}

          {formData.firstPaymentDate && formData.installmentCount && (
            <div className="flex items-center justify-between p-2 bg-gray-800/50 border border-gray-700/30 rounded">
              <span className="text-xs text-gray-400">Última Cuota</span>
              <span className="text-xs text-gray-300">
                {(() => {
                  const lastPaymentDate = new Date(formData.firstPaymentDate);
                  const frequency = formData.paymentFrequency || 'monthly';
                  const count = formData.installmentCount - 1;
                  
                  switch (frequency) {
                    case 'monthly':
                      lastPaymentDate.setMonth(lastPaymentDate.getMonth() + count);
                      break;
                    case 'biweekly':
                      lastPaymentDate.setDate(lastPaymentDate.getDate() + (count * 14));
                      break;
                    case 'weekly':
                      lastPaymentDate.setDate(lastPaymentDate.getDate() + (count * 7));
                      break;
                    case 'quarterly':
                      lastPaymentDate.setMonth(lastPaymentDate.getMonth() + (count * 3));
                      break;
                  }
                  
                  return lastPaymentDate.toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                })()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Risk indicators */}
      <div className="mt-6 p-3 bg-gray-100/10 border border-gray-200/20 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-gray-600 font-normal mb-1">
              Configuración de Riesgo
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600/70">Período de gracia</span>
                <span className="text-xs text-gray-600">
                  {formData.gracePeriodDays || 5} días
                </span>
              </div>
              {lateFeePercentage > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600/70">Penalidad por mora</span>
                  <span className="text-xs text-gray-600">
                    {lateFeePercentage}% mensual
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export options */}
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="flex-1 btn-ghost text-xs flex items-center justify-center gap-2 py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar PDF
        </button>
        <button
          type="button"
          className="flex-1 btn-ghost text-xs flex items-center justify-center gap-2 py-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-2.796 0-5.29 1.28-6.716 3.284m9.432 8.4a9.001 9.001 0 01-9.432 0" />
          </svg>
          Compartir
        </button>
      </div>
    </div>
  );
}