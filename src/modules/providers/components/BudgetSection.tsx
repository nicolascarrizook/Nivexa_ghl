import { useState } from 'react';
import { useContractorBudget } from '../hooks';
import type { Database } from '@/types/database.types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

  const formatCurrency = (amount: number) => {
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
      const success = await createItem(formData as ContractorBudgetInsert);
      if (success) {
        setIsAddingItem(false);
        resetForm();
      }
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
            <button
              onClick={() => setIsAddingItem(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Ítem
            </button>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="ej: m², kg, unidad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
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

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {editingItemId ? 'Actualizar' : 'Agregar'}
              </button>
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
            <button
              onClick={() => setIsAddingItem(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Agregar primer ítem
            </button>
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