import { useState } from 'react';
import { useContractorBudget } from '../hooks';
import type { Database } from '@/types/database.types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/design-system/components/inputs/Input/Input';
import { Button } from '@/design-system/components/inputs/Button';
import { Plus } from 'lucide-react';

type ContractorBudget = Database['public']['Tables']['contractor_budgets']['Row'];
type ContractorBudgetInsert = Database['public']['Tables']['contractor_budgets']['Insert'];

interface BudgetSectionProps {
  projectContractorId: string;
}

const categoryLabels = {
  materials: 'Materiales',
  labor: 'Mano de Obra',
  equipment: 'Equipamiento',
  services: 'Servicios',
  other: 'Otros',
};

// Simple Select component consistent with design-system
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({ label, error, fullWidth = true, className = '', children, ...props }) => {
  return (
    <div className={fullWidth ? 'w-full' : 'w-auto'}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 text-base min-h-[42px]
          rounded-lg border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-900
          focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
          focus:border-transparent focus:ring-offset-1
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
          ${error ? 'border-red-500 dark:border-red-400' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export function BudgetSection({ projectContractorId }: BudgetSectionProps) {
  const { budgetItems, loading, error, summary, createItem, updateItem, deleteItem, duplicateItem } = useContractorBudget(projectContractorId);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; description: string } | null>(null);
  const [formData, setFormData] = useState<Partial<ContractorBudgetInsert>>({
    project_contractor_id: projectContractorId,
    category: 'materials',
    description: '',
    quantity: 1,
    unit: '',
    unit_price: 0,
  });
  const [paymentConfig, setPaymentConfig] = useState({
    generateInstallments: false,
    frequency: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    numberOfInstallments: 4,
    firstPaymentDate: '',
    currency: 'ARS' as 'ARS' | 'USD',
  });

  const formatCurrency = (amount: number, currency: 'ARS' | 'USD' = 'ARS') => {
    if (currency === 'USD') {
      return `US$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItemId) {
      const success = await updateItem(editingItemId, formData);
      if (success) {
        setEditingItemId(null);
        resetForm();
      }
    } else {
      const result = await createItem(formData as ContractorBudgetInsert);
      if (result.success && result.id) {
        // Generate installments if configured
        if (paymentConfig.generateInstallments && paymentConfig.firstPaymentDate) {
          await generateInstallments(result.id);
        }
        setIsAddingItem(false);
        resetForm();
      }
    }
  };

  const generateInstallments = async (budgetItemId: string) => {
    if (!paymentConfig.firstPaymentDate) return;

    const totalAmount = (formData.quantity || 1) * (formData.unit_price || 0);
    const installmentAmount = totalAmount / paymentConfig.numberOfInstallments;

    const { contractorPaymentService } = await import('../services');
    const firstDate = new Date(paymentConfig.firstPaymentDate);

    for (let i = 0; i < paymentConfig.numberOfInstallments; i++) {
      const dueDate = new Date(firstDate);

      // Calculate due date based on frequency
      switch (paymentConfig.frequency) {
        case 'weekly':
          dueDate.setDate(firstDate.getDate() + (i * 7));
          break;
        case 'biweekly':
          dueDate.setDate(firstDate.getDate() + (i * 14));
          break;
        case 'monthly':
          dueDate.setMonth(firstDate.getMonth() + i);
          break;
      }

      await contractorPaymentService.create({
        project_contractor_id: projectContractorId,
        budget_item_id: budgetItemId,
        amount: installmentAmount,
        currency: paymentConfig.currency,
        payment_type: i === 0 ? 'advance' : 'progress',
        status: 'pending',
        due_date: dueDate.toISOString().split('T')[0],
        notes: `Cuota ${i + 1} de ${paymentConfig.numberOfInstallments}`,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      project_contractor_id: projectContractorId,
      category: 'materials',
      description: '',
      quantity: 1,
      unit: '',
      unit_price: 0,
    });
    setPaymentConfig({
      generateInstallments: false,
      frequency: 'weekly',
      numberOfInstallments: 4,
      firstPaymentDate: '',
      currency: 'ARS',
    });
  };

  const handleEdit = (item: ContractorBudget) => {
    setEditingItemId(item.id);
    setFormData({
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || '',
      unit_price: item.unit_price,
      notes: item.notes || '',
    });
    setIsAddingItem(true);
  };

  const handleCancel = () => {
    setIsAddingItem(false);
    setEditingItemId(null);
    resetForm();
  };

  const handleDeleteClick = (item: ContractorBudget) => {
    setItemToDelete({ id: item.id, description: item.description });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id);
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleDuplicate = async (itemId: string) => {
    await duplicateItem(itemId);
  };

  if (loading && budgetItems.length === 0) {
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
        <p className="text-sm text-red-800">Error al cargar el presupuesto: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Presupuesto Detallado</h3>
          {!isAddingItem && (
            <Button
              onClick={() => setIsAddingItem(true)}
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Agregar Ítem
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total Presupuesto</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(summary.grand_total)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-700 mb-1">Materiales</p>
              <p className="text-lg font-semibold text-blue-900">{formatCurrency(summary.subtotal_by_category?.materials || 0)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700 mb-1">Mano de Obra</p>
              <p className="text-lg font-semibold text-green-900">{formatCurrency(summary.subtotal_by_category?.labor || 0)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-700 mb-1">Total Ítems</p>
              <p className="text-lg font-semibold text-purple-900">{summary.total_items}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAddingItem && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Categoría"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                required
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>

              <Input
                label="Descripción"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                fullWidth
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Cantidad"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                required
                fullWidth
              />

              <Input
                label="Unidad"
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="ej: m², kg, unidad"
                fullWidth
              />

              <Input
                label="Precio Unitario"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                required
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Payment Installments Configuration */}
            {!editingItemId && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="generateInstallments"
                    checked={paymentConfig.generateInstallments}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, generateInstallments: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="generateInstallments" className="text-sm font-medium text-gray-700">
                    Generar cuotas de pago automáticamente
                  </label>
                </div>

                {paymentConfig.generateInstallments && (
                  <div className="grid grid-cols-4 gap-4 mt-3 pl-6">
                    <Select
                      label="Moneda"
                      value={paymentConfig.currency}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, currency: e.target.value as 'ARS' | 'USD' })}
                      className="text-sm"
                    >
                      <option value="ARS">ARS - Pesos</option>
                      <option value="USD">USD - Dólares</option>
                    </Select>

                    <Select
                      label="Frecuencia"
                      value={paymentConfig.frequency}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, frequency: e.target.value as any })}
                      className="text-sm"
                    >
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </Select>

                    <Input
                      label="Número de Cuotas"
                      type="number"
                      min={2}
                      max={24}
                      value={paymentConfig.numberOfInstallments}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, numberOfInstallments: parseInt(e.target.value) || 2 })}
                      required={paymentConfig.generateInstallments}
                      size="sm"
                      fullWidth
                    />

                    <Input
                      label="Primera Fecha de Pago"
                      type="date"
                      value={paymentConfig.firstPaymentDate}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, firstPaymentDate: e.target.value })}
                      required={paymentConfig.generateInstallments}
                      size="sm"
                      fullWidth
                    />
                  </div>
                )}

                {paymentConfig.generateInstallments && formData.quantity && formData.unit_price && paymentConfig.numberOfInstallments > 0 && (
                  <div className="mt-3 pl-6 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">Vista previa de cuotas:</p>
                    <p className="text-sm text-blue-900">
                      {paymentConfig.numberOfInstallments} cuotas de{' '}
                      <span className="font-bold">
                        {formatCurrency(((formData.quantity || 1) * (formData.unit_price || 0)) / paymentConfig.numberOfInstallments, paymentConfig.currency)}
                      </span>
                      {' '}cada una ({paymentConfig.frequency === 'weekly' ? 'semanales' : paymentConfig.frequency === 'biweekly' ? 'quincenales' : 'mensuales'})
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="md"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                variant="primary"
                size="md"
              >
                {editingItemId ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Items List */}
      <div className="divide-y divide-gray-200">
        {budgetItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-sm text-gray-500">No hay ítems en el presupuesto</p>
            <Button
              onClick={() => setIsAddingItem(true)}
              variant="primary"
              size="md"
              className="mt-4"
            >
              Agregar primer ítem
            </Button>
          </div>
        ) : (
          budgetItems.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {categoryLabels[item.category as keyof typeof categoryLabels]}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900">{item.description}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Cantidad: {item.quantity} {item.unit}</span>
                    <span>•</span>
                    <span>Precio unitario: {formatCurrency(item.unit_price)}</span>
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-sm text-gray-600">{item.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(item.total_amount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDuplicate(item.id)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Duplicar"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el ítem "${itemToDelete?.description}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}