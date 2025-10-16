import { AlertTriangle, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { CurrencyBadge } from './CurrencyBadge';
import type { Database } from '@/types/database.types';

type ContractorPayment = Database['public']['Tables']['contractor_payments']['Row'];
type ProjectContractor = Database['public']['Tables']['project_contractors']['Row'];

interface ContractorDashboardProps {
  contractor: ProjectContractor;
  payments: ContractorPayment[];
  totalBudget: number;
}

export function ContractorDashboard({ contractor, payments, totalBudget }: ContractorDashboardProps) {
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

  // Calculate metrics
  const today = new Date();
  const startDate = contractor.start_date ? parseLocalDate(contractor.start_date) : null;
  const endDate = contractor.end_date ? parseLocalDate(contractor.end_date) : null;
  const estimatedEndDate = contractor.estimated_end_date ? parseLocalDate(contractor.estimated_end_date) : null;

  // Calculate overdue payments
  const overduePayments = payments.filter(p => {
    if (!p.due_date || p.status === 'paid') return false;
    const dueDate = parseLocalDate(p.due_date);
    return dueDate < today;
  });

  // Calculate payment progress by currency
  const paymentsByCurrency = payments.reduce((acc, payment) => {
    const currency = payment.currency === 'USD' ? 'USD' : 'ARS';
    if (!acc[currency]) {
      acc[currency] = { total: 0, paid: 0, pending: 0, overdue: 0 };
    }
    acc[currency].total += payment.amount;
    if (payment.status === 'paid') {
      acc[currency].paid += payment.amount;
    } else if (payment.status === 'pending' || payment.status === 'overdue') {
      acc[currency].pending += payment.amount;
      const dueDate = payment.due_date ? parseLocalDate(payment.due_date) : null;
      if (dueDate && dueDate < today) {
        acc[currency].overdue += payment.amount;
      }
    }
    return acc;
  }, {} as Record<string, { total: number; paid: number; pending: number; overdue: number }>);

  // Calculate days progress
  let daysProgress = 0;
  let daysRemaining = 0;
  let isDelayed = false;

  if (startDate && endDate) {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    daysProgress = Math.min(100, (elapsedDays / totalDays) * 100);
    daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    // Check if delayed (estimated end date is after planned end date)
    if (estimatedEndDate && estimatedEndDate > endDate) {
      isDelayed = true;
    }
  }

  const paymentProgress = contractor.progress_percentage || 0;

  return (
    <div className="space-y-4">
      {/* Alerts Section */}
      {(overduePayments.length > 0 || isDelayed) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">Alertas Activas</h3>
              <ul className="space-y-1 text-xs text-red-700">
                {overduePayments.length > 0 && (
                  <li>
                    • <span className="font-semibold">{overduePayments.length}</span> pago{overduePayments.length !== 1 ? 's' : ''} vencido{overduePayments.length !== 1 ? 's' : ''} por un total de{' '}
                    {overduePayments.reduce((sum, p) => {
                      const currency = p.currency === 'USD' ? 'USD' : 'ARS';
                      return sum + (currency === 'ARS' ? p.amount : 0);
                    }, 0) > 0 && formatCurrency(overduePayments.reduce((sum, p) => sum + (p.currency === 'USD' ? 0 : p.amount), 0))}
                    {overduePayments.reduce((sum, p) => sum + (p.currency === 'USD' ? p.amount : 0), 0) > 0 &&
                      ` + ${formatCurrency(overduePayments.reduce((sum, p) => sum + (p.currency === 'USD' ? p.amount : 0), 0), 'USD')}`
                    }
                  </li>
                )}
                {isDelayed && (
                  <li>
                    • El proyecto presenta demoras. Fecha estimada de finalización: {formatDate(contractor.estimated_end_date)} (planificado: {formatDate(contractor.end_date)})
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Metric */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Presupuesto Total</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Progreso de Pago</p>
              <p className="text-lg font-bold text-gray-900">{paymentProgress.toFixed(1)}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                paymentProgress >= 90 ? 'bg-green-600' :
                paymentProgress >= 75 ? 'bg-lime-500' :
                paymentProgress >= 50 ? 'bg-yellow-500' :
                paymentProgress >= 25 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(paymentProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Time Progress */}
        {startDate && endDate && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Progreso de Tiempo</p>
                <p className="text-lg font-bold text-gray-900">{daysProgress.toFixed(1)}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isDelayed ? 'bg-red-500' : 'bg-purple-600'
                }`}
                style={{ width: `${Math.min(daysProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Plazo vencido'}
            </p>
          </div>
        )}

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${
              contractor.status === 'active' ? 'bg-green-100' :
              contractor.status === 'paused' ? 'bg-yellow-100' :
              contractor.status === 'completed' ? 'bg-blue-100' :
              contractor.status === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <TrendingUp className={`w-5 h-5 ${
                contractor.status === 'active' ? 'text-green-600' :
                contractor.status === 'paused' ? 'text-yellow-600' :
                contractor.status === 'completed' ? 'text-blue-600' :
                contractor.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Estado del Trabajo</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{contractor.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary by Currency */}
      {Object.keys(paymentsByCurrency).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalle de Pagos por Moneda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(paymentsByCurrency).map(([currency, data]) => (
              <div key={currency} className={`border rounded-lg p-3 ${
                currency === 'USD' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyBadge currency={currency as 'ARS' | 'USD'} size="md" />
                  <h4 className="font-semibold text-gray-900">{currency === 'USD' ? 'Dólares' : 'Pesos Argentinos'}</h4>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(data.total, currency as 'ARS' | 'USD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagado:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(data.paid, currency as 'ARS' | 'USD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendiente:</span>
                    <span className="font-semibold text-orange-600">{formatCurrency(data.pending, currency as 'ARS' | 'USD')}</span>
                  </div>
                  {data.overdue > 0 && (
                    <div className="flex justify-between pt-1 border-t border-red-200">
                      <span className="text-red-600">Vencido:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(data.overdue, currency as 'ARS' | 'USD')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
