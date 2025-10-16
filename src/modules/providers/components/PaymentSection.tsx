import { useState, useMemo } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useContractorPayments } from '../hooks';
import { useContractorBudget } from '../hooks';
import MetricGrid from '@/design-system/components/data-display/MetricGrid';
import { BudgetItemCard } from './BudgetItemCard';
import { CurrencyBadge } from './CurrencyBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import type { Database } from '@/types/database.types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { supabase } from '@/config/supabase';

type ContractorPayment = Database['public']['Tables']['contractor_payments']['Row'];
type ContractorPaymentInsert = Database['public']['Tables']['contractor_payments']['Insert'];

interface ContractorPaymentWithBudgetItem extends ContractorPayment {
  budget_item?: {
    id: string;
    description: string;
    category: string;
  } | null;
}

interface PaymentSectionProps {
  projectContractorId: string;
  onPaymentChange?: () => void;
}

export function PaymentSection({ projectContractorId, onPaymentChange }: PaymentSectionProps) {
  const { payments, loading, error, summary, createPayment, deletePayment, markAsPaid } = useContractorPayments(projectContractorId);
  const { budgetItems, summary: budgetSummary } = useContractorBudget(projectContractorId);

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ContractorPaymentInsert>>({
    project_contractor_id: projectContractorId,
    payment_type: 'progress',
    amount: 0,
    due_date: '',
    notes: '',
  });

  // Parse date string as local date (avoid timezone issues)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Calculate currency summaries
  const currencySummary = useMemo(() => {
    const ars = { total: 0, paid: 0, pending: 0 };
    const usd = { total: 0, paid: 0, pending: 0 };

    (payments as ContractorPaymentWithBudgetItem[]).forEach(payment => {
      const currency = payment.currency === 'USD' ? usd : ars;
      currency.total += payment.amount;
      if (payment.status === 'paid') {
        currency.paid += payment.amount;
      } else if (payment.status === 'pending' || payment.status === 'overdue') {
        currency.pending += payment.amount;
      }
    });

    return { ars, usd };
  }, [payments]);

  // Calculate remaining balance
  const remainingBalance = useMemo(() => {
    const totalBudget = budgetSummary?.grand_total || 0;
    const totalPaid = summary?.total_paid || 0;
    return Math.max(0, totalBudget - totalPaid);
  }, [budgetSummary?.grand_total, summary?.total_paid]);

  // Financial metrics for MetricGrid
  const financialMetrics = useMemo(() => {
    const totalBudget = budgetSummary?.grand_total || 0;
    const totalPaid = summary?.total_paid || 0;
    const totalPayments = summary?.total_payments || 0;

    return [
      {
        title: 'Presupuesto Total',
        value: formatCurrency(totalBudget),
        icon: TrendingUp,
        variant: 'info' as const,
        size: 'sm' as const,
      },
      {
        title: 'Total Pagado',
        value: formatCurrency(totalPaid),
        icon: TrendingUp,
        variant: 'success' as const,
        size: 'sm' as const,
      },
      {
        title: 'Saldo Pendiente',
        value: formatCurrency(remainingBalance),
        icon: AlertCircle,
        variant: remainingBalance > 0 ? ('warning' as const) : ('default' as const),
        size: 'sm' as const,
      },
      {
        title: 'Total Cuotas',
        value: totalPayments.toString(),
        icon: TrendingUp,
        variant: 'default' as const,
        size: 'sm' as const,
      },
    ];
  }, [budgetSummary?.grand_total, summary?.total_paid, summary?.total_payments, remainingBalance]);

  // Group payments by budget item
  const paymentsByItem = useMemo(() => {
    const grouped: Record<string, ContractorPayment[]> = {};
    (payments as ContractorPaymentWithBudgetItem[]).forEach(payment => {
      if (payment.budget_item_id) {
        if (!grouped[payment.budget_item_id]) {
          grouped[payment.budget_item_id] = [];
        }
        grouped[payment.budget_item_id].push(payment);
      }
    });
    return grouped;
  }, [payments]);

  // Get unassigned payments (without budget_item_id)
  const unassignedPayments = useMemo(() => {
    return (payments as ContractorPaymentWithBudgetItem[]).filter(p => !p.budget_item_id);
  }, [payments]);

  const handleAddPayment = (itemId: string) => {
    const item = budgetItems?.find(i => i.id === itemId);
    if (!item) return;

    // Calculate remaining for this item
    const itemPayments = paymentsByItem[itemId] || [];
    const paidAmount = itemPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const remainingForItem = (item.total_amount || 0) - paidAmount;

    setSelectedItemId(itemId);
    setFormData({
      project_contractor_id: projectContractorId,
      budget_item_id: itemId,
      payment_type: 'progress',
      amount: remainingForItem > 0 ? Math.round(remainingForItem * 0.5) : 0,
      due_date: '',
      notes: '',
    });
    setIsAddingPayment(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.budget_item_id) {
      alert('Debe seleccionar un ítem de presupuesto');
      return;
    }

    // Validate amount is within database limits
    const maxAmount = 9999999999.99; // DECIMAL(12,2) limit
    if (formData.amount && formData.amount > maxAmount) {
      alert(`El monto no puede exceder $${maxAmount.toLocaleString('es-AR')}`);
      return;
    }

    const success = await createPayment(formData as ContractorPaymentInsert);
    if (success) {
      setIsAddingPayment(false);
      setSelectedItemId(null);
      setFormData({
        project_contractor_id: projectContractorId,
        payment_type: 'progress',
        amount: 0,
        due_date: '',
        notes: '',
      });
      onPaymentChange?.();
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const payment = (payments as ContractorPaymentWithBudgetItem[]).find(p => p.id === paymentId);
      if (!payment) {
        alert('No se encontró el pago');
        return;
      }

      // Solicitar información adicional opcional
      const paidBy = prompt('¿Quién realizó el pago? (opcional)');
      const receiptUrl = prompt('URL del comprobante (opcional)');

      // El método markAsPaidWithCashBoxIntegration ahora maneja todo:
      // - Valida fondos suficientes en ambas cajas
      // - Registra movimientos de caja
      // - Deduce montos automáticamente
      // - Vincula el pago con el movimiento
      const success = await markAsPaid(paymentId, paidBy || undefined, receiptUrl || undefined);

      if (success) {
        onPaymentChange?.();
        alert('Pago registrado exitosamente. Los fondos se han deducido de las cajas del proyecto y master.');
      }
    } catch (error: any) {
      console.error('Error al procesar el pago:', error);

      // Mejorar el mensaje de error para casos comunes
      let errorMessage = error.message || 'Error desconocido';

      if (errorMessage.includes('Insufficient funds')) {
        errorMessage = '⚠️ Fondos Insuficientes\n\n' + errorMessage +
          '\n\nPor favor, verifica el saldo de la caja del proyecto antes de marcar el pago como pagado.';
      } else if (errorMessage.includes('Cash box not found')) {
        errorMessage = '⚠️ Error de Configuración\n\n' +
          'No se encontró la caja del proyecto. Por favor, contacta al administrador del sistema.';
      }

      alert(`Error al procesar el pago:\n\n${errorMessage}`);
    }
  };

  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (paymentToDelete) {
      const success = await deletePayment(paymentToDelete);
      if (success) {
        onPaymentChange?.();
      }
    }
    setShowDeleteModal(false);
    setPaymentToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPaymentToDelete(null);
  };

  const handleAssignPayment = async (paymentId: string, itemId: string) => {
    // Import the service dynamically to update the payment
    const { contractorPaymentService } = await import('../services');
    const { error } = await contractorPaymentService.update(paymentId, {
      budget_item_id: itemId,
    });

    if (!error) {
      onPaymentChange?.();
      // Force refetch by reloading the component
      window.location.reload();
    }
  };

  if (loading && (!budgetItems || budgetItems.length === 0)) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">Error al cargar los pagos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
        <MetricGrid
          metrics={financialMetrics}
          columns={4}
          gap="sm"
        />
      </div>

      {/* Payment Form Modal */}
      {isAddingPayment && selectedItemId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Pago</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento (opcional)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ej: Primera cuota de materiales"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPayment(false);
                    setSelectedItemId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Currency Summary */}
      {(currencySummary.ars.total > 0 || currencySummary.usd.total > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen por Moneda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currencySummary.ars.total > 0 && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <CurrencyBadge currency="ARS" size="md" />
                  <h4 className="font-semibold text-gray-900">Pesos Argentinos</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(currencySummary.ars.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagado:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(currencySummary.ars.paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendiente:</span>
                    <span className="font-semibold text-orange-600">{formatCurrency(currencySummary.ars.pending)}</span>
                  </div>
                </div>
              </div>
            )}
            {currencySummary.usd.total > 0 && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <CurrencyBadge currency="USD" size="md" />
                  <h4 className="font-semibold text-gray-900">Dólares</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">US$ {currencySummary.usd.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagado:</span>
                    <span className="font-semibold text-green-600">US$ {currencySummary.usd.paid.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendiente:</span>
                    <span className="font-semibold text-orange-600">US$ {currencySummary.usd.pending.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unassigned Payments Warning */}
      {unassignedPayments.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Pagos sin asignar ({unassignedPayments.length})
              </h3>
              <p className="text-xs text-yellow-700 mb-3">
                Los siguientes pagos no están asociados a ningún trabajo. Asígnalos para que aparezcan en las tarjetas correspondientes:
              </p>
              <div className="space-y-2">
                {unassignedPayments.map((payment) => {
                  const dueDate = payment.due_date ? parseLocalDate(payment.due_date) : null;
                  const today = new Date();
                  const isOverdue = dueDate && dueDate < today && payment.status !== 'paid';
                  const daysOverdue = isOverdue ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

                  return (
                    <div key={payment.id} className="bg-white rounded p-3 border border-yellow-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">
                              {payment.currency === 'USD'
                                ? `US$ ${payment.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : formatCurrency(payment.amount)
                              }
                            </p>
                            <CurrencyBadge currency={payment.currency === 'USD' ? 'USD' : 'ARS'} size="sm" />
                            <PaymentStatusBadge status={payment.status as 'pending' | 'paid' | 'overdue' | 'cancelled'} size="sm" />
                          </div>
                          {payment.notes && (
                            <p className="text-xs text-gray-500">{payment.notes}</p>
                          )}
                          {payment.due_date && (
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">
                                Vencimiento: {parseLocalDate(payment.due_date).toLocaleDateString('es-AR')}
                              </p>
                              {isOverdue && (
                                <span className="text-xs font-medium text-red-600">
                                  (Vencido hace {daysOverdue} día{daysOverdue !== 1 ? 's' : ''})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignPayment(payment.id, e.target.value);
                              }
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Asignar a...</option>
                            {budgetItems?.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.description}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteClick(payment.id)}
                            className="text-xs text-red-600 hover:text-red-800 whitespace-nowrap"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trabajos y Pagos</h3>
        {!budgetItems || budgetItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-500">No hay ítems de presupuesto configurados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetItems.map((item) => (
              <BudgetItemCard
                key={item.id}
                item={item}
                payments={paymentsByItem[item.id] || []}
                onAddPayment={handleAddPayment}
                onEditPayment={() => {}}
                onDeletePayment={handleDeleteClick}
                onMarkAsPaid={handleMarkAsPaid}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}