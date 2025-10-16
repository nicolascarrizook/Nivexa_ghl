import { Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import type { Database } from '@/types/database.types';

type ProjectContractor = Database['public']['Tables']['project_contractors']['Row'];
type ContractorPayment = Database['public']['Tables']['contractor_payments']['Row'];

interface TimelineSectionProps {
  contractor: ProjectContractor;
  payments: ContractorPayment[];
  totalBudget: number;
}

interface TimelineEvent {
  date: Date;
  label: string;
  type: 'start' | 'end' | 'payment' | 'milestone' | 'today';
  status?: 'completed' | 'pending' | 'overdue';
  amount?: number;
  currency?: string;
}

export function TimelineSection({ contractor, payments, totalBudget }: TimelineSectionProps) {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Build timeline events
  const events: TimelineEvent[] = [];
  const today = new Date();

  // Add start date
  if (contractor.start_date) {
    events.push({
      date: parseLocalDate(contractor.start_date),
      label: 'Asignación al Proyecto',
      type: 'start',
      status: 'completed',
    });
  }

  // Add payment events
  payments.forEach(payment => {
    if (payment.due_date) {
      const dueDate = parseLocalDate(payment.due_date);
      events.push({
        date: dueDate,
        label: payment.notes || 'Pago',
        type: 'payment',
        status: payment.status === 'paid' ? 'completed' : dueDate < today ? 'overdue' : 'pending',
        amount: payment.amount,
        currency: payment.currency,
      });
    }
  });

  // Add end date
  if (contractor.end_date) {
    const endDate = parseLocalDate(contractor.end_date);
    events.push({
      date: endDate,
      label: 'Finalización Planificada',
      type: 'end',
      status: today > endDate ? 'overdue' : 'pending',
    });
  }

  // Add estimated end date if different
  if (contractor.estimated_end_date && contractor.end_date) {
    const estimatedDate = parseLocalDate(contractor.estimated_end_date);
    const plannedDate = parseLocalDate(contractor.end_date);
    if (estimatedDate.getTime() !== plannedDate.getTime()) {
      events.push({
        date: estimatedDate,
        label: 'Finalización Estimada',
        type: 'milestone',
        status: 'pending',
      });
    }
  }

  // Add today marker
  events.push({
    date: today,
    label: 'Hoy',
    type: 'today',
  });

  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate progress metrics
  const startDate = contractor.start_date ? parseLocalDate(contractor.start_date) : null;
  const endDate = contractor.end_date ? parseLocalDate(contractor.end_date) : null;

  let expectedProgress = 0;
  let progressDifference = 0;
  let performanceStatus: 'on-track' | 'ahead' | 'behind' = 'on-track';

  if (startDate && endDate) {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    expectedProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    const actualProgress = contractor.progress_percentage || 0;
    progressDifference = actualProgress - expectedProgress;

    if (progressDifference > 5) {
      performanceStatus = 'ahead';
    } else if (progressDifference < -5) {
      performanceStatus = 'behind';
    }
  }

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'start':
        return <Calendar className="w-4 h-4" />;
      case 'end':
      case 'milestone':
        return event.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
      case 'payment':
        return event.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
               event.status === 'overdue' ? <AlertTriangle className="w-4 h-4" /> :
               <Clock className="w-4 h-4" />;
      case 'today':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.type === 'today') return 'bg-blue-500';

    switch (event.status) {
      case 'completed':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getEventBorderColor = (event: TimelineEvent) => {
    if (event.type === 'today') return 'border-blue-200';

    switch (event.status) {
      case 'completed':
        return 'border-green-200';
      case 'overdue':
        return 'border-red-200';
      case 'pending':
        return 'border-yellow-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Indicator */}
      {startDate && endDate && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Análisis de Cumplimiento</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Expected Progress */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Progreso Esperado</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <p className="text-lg font-bold text-gray-900">{expectedProgress.toFixed(1)}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-gray-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(expectedProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Actual Progress */}
            <div className={`rounded-lg p-3 border ${
              performanceStatus === 'ahead' ? 'bg-green-50 border-green-200' :
              performanceStatus === 'behind' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Progreso Real</p>
              <div className="flex items-center gap-2">
                {performanceStatus === 'ahead' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
                 performanceStatus === 'behind' ? <TrendingDown className="w-4 h-4 text-red-600" /> :
                 <TrendingUp className="w-4 h-4 text-blue-600" />}
                <p className={`text-lg font-bold ${
                  performanceStatus === 'ahead' ? 'text-green-900' :
                  performanceStatus === 'behind' ? 'text-red-900' :
                  'text-blue-900'
                }`}>
                  {(contractor.progress_percentage || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    performanceStatus === 'ahead' ? 'bg-green-600' :
                    performanceStatus === 'behind' ? 'bg-red-600' :
                    'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(contractor.progress_percentage || 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Performance Status */}
            <div className={`rounded-lg p-3 border ${
              performanceStatus === 'ahead' ? 'bg-green-50 border-green-200' :
              performanceStatus === 'behind' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Estado</p>
              <div className="flex items-center gap-2">
                {performanceStatus === 'ahead' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                 performanceStatus === 'behind' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                 <Clock className="w-4 h-4 text-blue-600" />}
                <p className={`text-lg font-bold ${
                  performanceStatus === 'ahead' ? 'text-green-900' :
                  performanceStatus === 'behind' ? 'text-red-900' :
                  'text-blue-900'
                }`}>
                  {performanceStatus === 'ahead' ? 'Adelantado' :
                   performanceStatus === 'behind' ? 'Atrasado' :
                   'En Tiempo'}
                </p>
              </div>
              <p className={`text-xs mt-2 ${
                performanceStatus === 'ahead' ? 'text-green-700' :
                performanceStatus === 'behind' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {progressDifference > 0 ? '+' : ''}{progressDifference.toFixed(1)}% {progressDifference >= 0 ? 'sobre' : 'bajo'} lo esperado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Cronograma del Proyecto</h3>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[29px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Events */}
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="relative flex gap-4 items-start">
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-[60px] flex items-center justify-center`}>
                  <div className={`w-8 h-8 rounded-full ${getEventColor(event)} flex items-center justify-center text-white shadow-md`}>
                    {getEventIcon(event)}
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 bg-gray-50 rounded-lg p-3 border ${getEventBorderColor(event)} ${
                  event.type === 'today' ? 'border-2 shadow-md' : ''
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        event.type === 'today' ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {event.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(event.date)}
                      </p>
                      {event.amount && (
                        <p className="text-xs font-medium text-gray-700 mt-1">
                          {formatCurrency(event.amount, event.currency as 'ARS' | 'USD')}
                        </p>
                      )}
                    </div>
                    {event.status && event.type !== 'today' && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                        event.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status === 'completed' ? 'Completado' :
                         event.status === 'overdue' ? 'Vencido' :
                         'Pendiente'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Métricas de Eficiencia</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time Efficiency */}
          {startDate && endDate && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Eficiencia Temporal</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-2xl font-bold ${
                  performanceStatus === 'ahead' ? 'text-green-600' :
                  performanceStatus === 'behind' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {performanceStatus === 'ahead' ? '↑' :
                   performanceStatus === 'behind' ? '↓' :
                   '→'}
                </p>
                <div>
                  <p className="text-sm text-gray-700">
                    {performanceStatus === 'ahead' ? 'Adelantado al cronograma' :
                     performanceStatus === 'behind' ? 'Atrasado del cronograma' :
                     'En línea con el cronograma'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Desviación: {progressDifference > 0 ? '+' : ''}{progressDifference.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Compliance */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Cumplimiento de Pagos</p>
            <div className="flex items-baseline gap-2">
              {(() => {
                const totalPayments = payments.length;
                const paidPayments = payments.filter(p => p.status === 'paid').length;
                const overduePayments = payments.filter(p => {
                  if (!p.due_date || p.status === 'paid') return false;
                  return parseLocalDate(p.due_date) < today;
                }).length;

                const complianceRate = totalPayments > 0 ? ((paidPayments / totalPayments) * 100) : 0;

                return (
                  <>
                    <p className={`text-2xl font-bold ${
                      overduePayments > 0 ? 'text-red-600' :
                      complianceRate >= 80 ? 'text-green-600' :
                      'text-yellow-600'
                    }`}>
                      {complianceRate.toFixed(0)}%
                    </p>
                    <div>
                      <p className="text-sm text-gray-700">
                        {paidPayments} de {totalPayments} pagos realizados
                      </p>
                      {overduePayments > 0 && (
                        <p className="text-xs text-red-600 font-medium">
                          {overduePayments} pago{overduePayments !== 1 ? 's' : ''} vencido{overduePayments !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
