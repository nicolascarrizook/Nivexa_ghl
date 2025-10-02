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
  lender_project_name: string | null;
  borrower_project_name: string | null;
  total_installments: number;
  paid_installments: number;
  pending_installments: number;
  overdue_installments: number;
  next_payment_due: string | null;
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
              Prestador → Prestatario
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cuotas
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo Pendiente
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Próximo Pago
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

                {/* Projects */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{loan.lender_project_name || 'N/A'}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      → {loan.borrower_project_name || 'N/A'}
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

                {/* Installments */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">
                        {loan.paid_installments}/{loan.total_installments}
                      </span>
                    </div>
                    {loan.overdue_installments > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        {loan.overdue_installments} vencida(s)
                      </div>
                    )}
                  </div>
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

                {/* Next Payment */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  {loan.next_payment_due ? (
                    <div className="flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {formatDate(loan.next_payment_due)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
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
                    {loan.loan_status === 'active' && loan.pending_installments > 0 && (
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
                    {selectedLoan.lender_project_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prestatario</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedLoan.borrower_project_name}
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
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Progreso de Cuotas</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(selectedLoan.paid_installments / selectedLoan.total_installments) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedLoan.paid_installments} / {selectedLoan.total_installments}
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
