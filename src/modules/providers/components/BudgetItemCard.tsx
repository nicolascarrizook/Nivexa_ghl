import { useState } from 'react';
import { CheckCircle, Clock, DollarSign, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { CurrencyBadge } from './CurrencyBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import type { Database } from '@/types/database.types';

type ContractorBudget = Database['public']['Tables']['contractor_budgets']['Row'];
type ContractorPayment = Database['public']['Tables']['contractor_payments']['Row'];

interface BudgetItemCardProps {
  item: ContractorBudget;
  payments: ContractorPayment[];
  onAddPayment: (itemId: string) => void;
  onEditPayment: (payment: ContractorPayment) => void;
  onDeletePayment: (paymentId: string) => void;
  onMarkAsPaid: (paymentId: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
};

const categoryLabels = {
  materials: 'Materiales',
  labor: 'Mano de Obra',
  equipment: 'Equipos',
  services: 'Servicios',
  other: 'Otros',
};

export function BudgetItemCard({
  item,
  payments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  onMarkAsPaid,
}: BudgetItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number, currency: 'ARS' | 'USD' = 'ARS') => {
    if (currency === 'USD') {
      return `US$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Parse date string as local date (avoid timezone issues)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return parseLocalDate(dateString).toLocaleDateString('es-AR');
  };

  // Determine primary currency from payments (most used currency)
  const currencyCounts = payments.reduce((acc, p) => {
    const curr = p.currency === 'USD' ? 'USD' : 'ARS';
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const primaryCurrency: 'ARS' | 'USD' =
    payments.length === 0 ? 'ARS' :
    (currencyCounts['USD'] || 0) > (currencyCounts['ARS'] || 0) ? 'USD' : 'ARS';

  // Calculate financial metrics by currency
  const metricsByCurrency = payments.reduce((acc, p) => {
    const curr = p.currency === 'USD' ? 'USD' : 'ARS';
    if (!acc[curr]) {
      acc[curr] = { paid: 0, pending: 0 };
    }
    if (p.status === 'paid') {
      acc[curr].paid += p.amount;
    } else if (p.status === 'pending') {
      acc[curr].pending += p.amount;
    }
    return acc;
  }, {} as Record<string, { paid: number; pending: number }>);

  // Use primary currency for overall metrics
  const totalPaid = metricsByCurrency[primaryCurrency]?.paid || 0;
  const totalPending = metricsByCurrency[primaryCurrency]?.pending || 0;
  const balance = (item.total_amount || 0) - totalPaid;
  const progress = item.total_amount > 0 ? (totalPaid / item.total_amount * 100) : 0;

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 75) return 'bg-lime-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isFullyPaid = balance <= 0;

  return (
    <div className={`bg-white rounded-lg border ${isFullyPaid ? 'border-green-300' : 'border-gray-200'} overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {categoryLabels[item.category as keyof typeof categoryLabels]}
              </span>
              {isFullyPaid && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3" />
                  Pagado
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-gray-900">{item.description}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.quantity} {item.unit} × {formatCurrency(item.unit_price, primaryCurrency)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Presupuesto</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(item.total_amount || 0, primaryCurrency)}</p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso de Pago</span>
              <span className="text-sm font-bold text-gray-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className={`${getProgressColor(progress)} h-3 rounded-full transition-all duration-500 shadow-sm`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-gray-400">|</span>
              <span>25%</span>
              <span className="text-gray-400">|</span>
              <span>50%</span>
              <span className="text-gray-400">|</span>
              <span>75%</span>
              <span className="text-gray-400">|</span>
              <span>100%</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 rounded p-2 border border-green-100">
              <p className="text-xs text-green-700 font-medium">Pagado</p>
              <p className="text-sm font-bold text-green-900">{formatCurrency(totalPaid, primaryCurrency)}</p>
            </div>
            <div className="bg-yellow-50 rounded p-2 border border-yellow-100">
              <p className="text-xs text-yellow-700 font-medium">Pendiente</p>
              <p className="text-sm font-bold text-yellow-900">{formatCurrency(totalPending, primaryCurrency)}</p>
            </div>
            <div className={`rounded p-2 border ${balance > 0 ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-xs font-medium ${balance > 0 ? 'text-orange-700' : 'text-gray-500'}`}>Saldo</p>
              <p className={`text-sm font-bold ${balance > 0 ? 'text-orange-900' : 'text-gray-500'}`}>{formatCurrency(balance, primaryCurrency)}</p>
            </div>
          </div>

          {/* Payments List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-900">Cuotas y Pagos ({payments.length})</h5>
              {!isFullyPaid && (
                <button
                  onClick={() => onAddPayment(item.id)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Agregar Pago
                </button>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">No hay cuotas registradas</p>
                <p className="text-xs text-gray-500">Agregá cuotas para este trabajo haciendo click en "Agregar Pago"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => {
                  const isPending = payment.status === 'pending';
                  const isPaid = payment.status === 'paid';
                  const dueDate = payment.due_date ? parseLocalDate(payment.due_date) : null;
                  const today = new Date();
                  const isOverdue = dueDate && dueDate < today && payment.status !== 'paid';
                  const daysOverdue = isOverdue ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

                  return (
                    <div key={payment.id} className={`rounded-lg p-4 border-l-4 ${
                      isOverdue ? 'bg-red-50 border-red-500' :
                      isPaid ? 'bg-green-50 border-green-500' :
                      'bg-white border-gray-300'
                    } shadow-sm`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Header con monto y badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold text-gray-900">
                              {payment.currency === 'USD'
                                ? `US$ ${payment.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : formatCurrency(payment.amount, primaryCurrency)
                              }
                            </span>
                            <PaymentStatusBadge status={payment.status as 'pending' | 'paid' | 'overdue' | 'cancelled'} size="sm" />
                            <CurrencyBadge currency={payment.currency === 'USD' ? 'USD' : 'ARS'} size="sm" />
                          </div>

                          {/* Descripción */}
                          {payment.notes && (
                            <p className="text-sm text-gray-700 font-medium">{payment.notes}</p>
                          )}

                          {/* Fecha de vencimiento */}
                          {payment.due_date && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Vencimiento: <span className="font-semibold">{formatDate(payment.due_date)}</span>
                              </span>
                              {isOverdue && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Vencido hace {daysOverdue} día{daysOverdue !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Fecha de pago */}
                          {payment.paid_at && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <p className="text-sm text-green-700 font-medium">
                                Pagado el: {formatDate(payment.paid_at)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {isPending && (
                            <button
                              onClick={() => onMarkAsPaid(payment.id)}
                              className="p-1.5 hover:bg-green-100 rounded transition-colors"
                              title="Marcar como pagado"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          {!isPaid && (
                            <button
                              onClick={() => onDeletePayment(payment.id)}
                              className="p-1.5 hover:bg-red-100 rounded transition-colors"
                              title="Eliminar"
                            >
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}