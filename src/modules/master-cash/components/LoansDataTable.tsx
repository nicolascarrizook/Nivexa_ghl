import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface Loan {
  id: string;
  loan_code: string;
  amount: number;
  currency: string;
  loan_status: string;
  outstanding_balance: number;
  total_paid: number;
  loan_date: string;
  due_date: string;
  installments_count: number;
  viability_score: number | null;
  risk_level: string | null;
  projects?: {
    name: string;
    code: string;
  };
}

interface LoansDataTableProps {
  loans: Loan[];
}

const statusVariants = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-700' },
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
  paid: { label: 'Pagado', className: 'bg-blue-100 text-blue-700' },
  overdue: { label: 'Vencido', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-500' },
};

export function LoansDataTable({ loans }: LoansDataTableProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'ARS') {
      return formatCurrency(amount);
    }
    return `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusVariant = (status: string) => {
    return statusVariants[status as keyof typeof statusVariants] || statusVariants.draft;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proyecto
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Riesgo
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo Pendiente
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vencimiento
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loans.map((loan) => {
            const statusVariant = getStatusVariant(loan.loan_status);

            return (
              <tr
                key={loan.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Loan Code */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {loan.loan_code}
                    </div>
                  </div>
                </td>

                {/* Project */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{loan.projects?.name || 'N/A'}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      {loan.projects?.code || ''}
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatAmount(loan.amount, loan.currency)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Pagado: {formatAmount(loan.total_paid, loan.currency)}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    statusVariant.className
                  )}>
                    {statusVariant.label}
                  </span>
                </td>

                {/* Risk Level */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  {loan.risk_level ? (
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      loan.risk_level === 'low' && "bg-green-100 text-green-700",
                      loan.risk_level === 'medium' && "bg-yellow-100 text-yellow-700",
                      loan.risk_level === 'high' && "bg-orange-100 text-orange-700",
                      loan.risk_level === 'critical' && "bg-red-100 text-red-700"
                    )}>
                      {loan.risk_level === 'low' && 'Bajo'}
                      {loan.risk_level === 'medium' && 'Medio'}
                      {loan.risk_level === 'high' && 'Alto'}
                      {loan.risk_level === 'critical' && 'Crítico'}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                  {loan.viability_score !== null && (
                    <div className="text-xs text-gray-500 mt-1">
                      Score: {loan.viability_score}
                    </div>
                  )}
                </td>

                {/* Outstanding Balance */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatAmount(loan.outstanding_balance, loan.currency)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((loan.total_paid / loan.amount) * 100).toFixed(1)}% pagado
                  </div>
                </td>

                {/* Due Date */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {formatDate(loan.due_date)}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {loan.loan_status === 'active' && loan.outstanding_balance > 0 && (
                      <button
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Registrar pago"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {(loan.loan_status === 'draft' || loan.loan_status === 'pending') && (
                      <button
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Cancelar préstamo"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty State */}
      {loans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay préstamos activos</p>
        </div>
      )}

      {/* Loan Detail Modal (Simple Preview) */}
      {selectedLoan && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-md bg-black/20 z-40"
            onClick={() => setSelectedLoan(null)}
          />
          <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Préstamo {selectedLoan.loan_code}
              </h2>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Prestador</p>
                  <p className="text-base font-medium text-gray-900">
                    Nivexa - Caja Master
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proyecto</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedLoan.projects?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Total</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatAmount(selectedLoan.amount, selectedLoan.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Saldo Pendiente</p>
                  <p className="text-base font-semibold text-red-600">
                    {formatAmount(selectedLoan.outstanding_balance, selectedLoan.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Préstamo</p>
                  <p className="text-base text-gray-900">
                    {formatDate(selectedLoan.loan_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencimiento</p>
                  <p className="text-base text-gray-900">
                    {formatDate(selectedLoan.due_date)}
                  </p>
                </div>
                {selectedLoan.risk_level && (
                  <div>
                    <p className="text-sm text-gray-500">Nivel de Riesgo</p>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      selectedLoan.risk_level === 'low' && "bg-green-100 text-green-700",
                      selectedLoan.risk_level === 'medium' && "bg-yellow-100 text-yellow-700",
                      selectedLoan.risk_level === 'high' && "bg-orange-100 text-orange-700",
                      selectedLoan.risk_level === 'critical' && "bg-red-100 text-red-700"
                    )}>
                      {selectedLoan.risk_level === 'low' && 'Bajo'}
                      {selectedLoan.risk_level === 'medium' && 'Medio'}
                      {selectedLoan.risk_level === 'high' && 'Alto'}
                      {selectedLoan.risk_level === 'critical' && 'Crítico'}
                    </span>
                  </div>
                )}
                {selectedLoan.viability_score !== null && (
                  <div>
                    <p className="text-sm text-gray-500">Score de Viabilidad</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedLoan.viability_score}/100
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Progreso del Préstamo</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(selectedLoan.total_paid / selectedLoan.amount) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {((selectedLoan.total_paid / selectedLoan.amount) * 100).toFixed(1)}% pagado
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
