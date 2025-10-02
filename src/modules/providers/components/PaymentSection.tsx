import { useState, useMemo } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useContractorPayments } from '../hooks';
import { useContractorBudget } from '../hooks';
import MetricGrid from '@/design-system/components/data-display/MetricGrid';
import { BudgetItemCard } from './BudgetItemCard';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

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
      // Obtener el pago completo para conocer el monto y project_id
      const payment = (payments as ContractorPaymentWithBudgetItem[]).find(p => p.id === paymentId);
      if (!payment) {
        alert('No se encontró el pago');
        return;
      }

      // Obtener el project_id del contractor
      const { data: projectContractor } = await supabase
        .from('project_contractors')
        .select('project_id')
        .eq('id', payment.project_contractor_id)
        .single();

      if (!projectContractor) {
        alert('No se encontró el proyecto asociado');
        return;
      }

      const paidBy = prompt('¿Quién realizó el pago? (opcional)');
      const receiptUrl = prompt('URL del comprobante (opcional)');

      // Procesar el gasto en la caja del proyecto
      const { newCashBoxService } = await import('@/services/cash/NewCashBoxService');
      await newCashBoxService.processProjectExpense({
        projectId: projectContractor.project_id,
        amount: payment.amount,
        description: `Pago a proveedor - ${payment.notes || 'Sin descripción'}`,
        contractorPaymentId: paymentId,
        currency: 'ARS' // Por ahora ARS por defecto, después se puede hacer dinámico
      });

      // Actualizar el estado del pago
      const success = await markAsPaid(paymentId, paidBy || undefined, receiptUrl || undefined);
      if (success) {
        onPaymentChange?.();
      }
    } catch (error: any) {
      console.error('Error al procesar el pago:', error);
      alert(`Error al procesar el pago: ${error.message || 'Error desconocido'}`);
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
                {unassignedPayments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded p-3 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Estado: {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                          {payment.notes && ` • ${payment.notes}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
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
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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