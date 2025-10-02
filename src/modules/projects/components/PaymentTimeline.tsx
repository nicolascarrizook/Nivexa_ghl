import { formatCurrency, formatDate } from '@/utils/formatters';
import type { ProjectFormData } from '../types';

interface PaymentTimelineProps {
  formData: ProjectFormData;
}

export function PaymentTimeline({ formData }: PaymentTimelineProps) {
  const generatePaymentSchedule = () => {
    const schedule = [];
    const installmentCount = formData.installmentCount || 12;
    const installmentAmount = formData.installmentAmount || 0;
    const firstPaymentDate = formData.firstPaymentDate ? new Date(formData.firstPaymentDate) : new Date();
    const frequency = formData.paymentFrequency || 'monthly';
    
    // Add down payment if exists
    if (formData.downPaymentAmount && formData.downPaymentAmount > 0) {
      const downPaymentDate = formData.downPaymentDate ? new Date(formData.downPaymentDate) : new Date();
      schedule.push({
        number: 0,
        type: 'downpayment',
        date: downPaymentDate,
        amount: formData.downPaymentAmount,
        label: 'Anticipo / Seña',
        accumulated: formData.downPaymentAmount,
      });
    }

    // Calculate installment dates
    let accumulated = formData.downPaymentAmount || 0;
    for (let i = 0; i < installmentCount; i++) {
      const paymentDate = new Date(firstPaymentDate);
      
      // Calculate date based on frequency
      switch (frequency) {
        case 'monthly':
          paymentDate.setMonth(paymentDate.getMonth() + i);
          break;
        case 'biweekly':
          paymentDate.setDate(paymentDate.getDate() + (i * 14));
          break;
        case 'weekly':
          paymentDate.setDate(paymentDate.getDate() + (i * 7));
          break;
        case 'quarterly':
          paymentDate.setMonth(paymentDate.getMonth() + (i * 3));
          break;
      }

      accumulated += installmentAmount;
      
      schedule.push({
        number: i + 1,
        type: 'installment',
        date: paymentDate,
        amount: installmentAmount,
        label: `Cuota ${i + 1}`,
        accumulated: accumulated,
      });
    }

    return schedule;
  };

  const schedule = generatePaymentSchedule();
  const visiblePayments = schedule.slice(0, 6); // Show first 6 payments
  const totalAmount = formData.totalAmount || 0;

  return (
    <div className="card-flat p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-normal text-secondary">Cronograma de Pagos</h3>
        <button 
          type="button"
          className="text-xs text-gray-600 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ver calendario completo
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {visiblePayments.map((payment, index) => (
          <div key={index} className="relative">
            <div className="flex items-start gap-3">
              {/* Timeline marker */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-3 h-3 rounded-full flex-shrink-0 mt-1.5
                  ${payment.type === 'downpayment' 
                    ? 'bg-gray-100  -500/30' 
                    : 'bg-gray-600'
                  }
                `} />
                {index < visiblePayments.length - 1 && (
                  <div className="w-px h-full bg-gray-700 mt-2" />
                )}
              </div>

              {/* Payment details */}
              <div className="flex-1 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-normal ${
                      payment.type === 'downpayment' ? 'text-gray-600' : 'text-gray-300'
                    }`}>
                      {payment.label}
                    </p>
                    <p className="text-xs text-tertiary mt-0.5">
                      {formatDate(payment.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-light text-primary">
                      {formatCurrency(payment.amount)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-tertiary">Acumulado:</span>
                      <span className="text-xs text-gray-400">
                        {formatCurrency(payment.accumulated)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                      style={{ width: `${(payment.accumulated / totalAmount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-tertiary mt-1">
                    {((payment.accumulated / totalAmount) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {schedule.length > 6 && (
        <div className="mt-4 pt-4 border-t border-gray-800/30">
          <p className="text-xs text-tertiary text-center">
            +{schedule.length - 6} pagos más hasta completar {formatCurrency(totalAmount)}
          </p>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-800/30">
        <div className="bg-gray-800/30 rounded-lg p-3">
          <p className="text-xs text-tertiary mb-1">Duración Total</p>
          <p className="text-sm font-normal text-secondary">
            {(() => {
              const months = formData.installmentCount || 12;
              if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
              const years = Math.floor(months / 12);
              const remainingMonths = months % 12;
              if (remainingMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
              return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
            })()}
          </p>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3">
          <p className="text-xs text-tertiary mb-1">Frecuencia</p>
          <p className="text-sm font-normal text-secondary">
            {formData.paymentFrequency === 'monthly' && 'Mensual'}
            {formData.paymentFrequency === 'biweekly' && 'Quincenal'}
            {formData.paymentFrequency === 'weekly' && 'Semanal'}
            {formData.paymentFrequency === 'quarterly' && 'Trimestral'}
          </p>
        </div>
      </div>
    </div>
  );
}