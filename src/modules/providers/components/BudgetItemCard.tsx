import { useState } from 'react';
import { CheckCircle, Clock, DollarSign, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // Calculate financial metrics
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

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
              {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Presupuesto</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(item.total_amount || 0)}</p>
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
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Progreso de Pago</span>
              <span className="text-xs font-semibold text-gray-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getProgressColor(progress)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 rounded p-2 border border-green-100">
              <p className="text-xs text-green-700 font-medium">Pagado</p>
              <p className="text-sm font-bold text-green-900">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-yellow-50 rounded p-2 border border-yellow-100">
              <p className="text-xs text-yellow-700 font-medium">Pendiente</p>
              <p className="text-sm font-bold text-yellow-900">{formatCurrency(totalPending)}</p>
            </div>
            <div className={`rounded p-2 border ${balance > 0 ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-xs font-medium ${balance > 0 ? 'text-orange-700' : 'text-gray-500'}`}>Saldo</p>
              <p className={`text-sm font-bold ${balance > 0 ? 'text-orange-900' : 'text-gray-500'}`}>{formatCurrency(balance)}</p>
            </div>
          </div>

          {/* Payments List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-gray-700">Pagos ({payments.length})</h5>
              {!isFullyPaid && (
                <button
                  onClick={() => onAddPayment(item.id)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors"
                >
                  <DollarSign className="w-3 h-3 mr-1" />
                  Agregar Pago
                </button>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs text-gray-500">No hay pagos registrados para este trabajo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => {
                  const statusInfo = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  const isPending = payment.status === 'pending';
                  const isPaid = payment.status === 'paid';

                  return (
                    <div key={payment.id} className="bg-gray-50 rounded p-2 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                            {payment.due_date && (
                              <span className="text-xs text-gray-500">
                                Vence: {formatDate(payment.due_date)}
                              </span>
                            )}
                          </div>
                          {payment.notes && (
                            <p className="text-xs text-gray-600 truncate">{payment.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                          {isPending && (
                            <button
                              onClick={() => onMarkAsPaid(payment.id)}
                              className="p-1 hover:bg-green-100 rounded transition-colors"
                              title="Marcar como pagado"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          {!isPaid && (
                            <button
                              onClick={() => onDeletePayment(payment.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
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