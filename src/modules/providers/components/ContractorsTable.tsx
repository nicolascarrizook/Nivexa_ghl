import { useState } from 'react';
import { Edit2, Trash2, DollarSign, Briefcase } from 'lucide-react';
import type { ProjectContractorWithDetails } from '../services';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ContractorsTableProps {
  contractors: ProjectContractorWithDetails[];
  loading?: boolean;
  onEdit?: (contractor: ProjectContractorWithDetails) => void;
  onDelete?: (contractorId: string) => void;
  onManagePayments?: (contractorId: string) => void;
  onManageWork?: (contractorId: string) => void;
}

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export function ContractorsTable({
  contractors,
  loading = false,
  onEdit,
  onDelete,
  onManagePayments,
  onManageWork,
}: ContractorsTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<{ id: string; name: string } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const handleDeleteClick = (contractor: ProjectContractorWithDetails) => {
    setContractorToDelete({
      id: contractor.id,
      name: contractor.provider?.name || 'Sin nombre'
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (contractorToDelete && onDelete) {
      onDelete(contractorToDelete.id);
    }
    setShowDeleteModal(false);
    setContractorToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setContractorToDelete(null);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 75) return 'bg-lime-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-lime-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="animate-pulse p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (contractors.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No hay contractors asignados a este proyecto</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presupuesto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contractors.map((contractor) => {
              const status = statusConfig[contractor.status as keyof typeof statusConfig] || statusConfig.draft;
              const budgetAmount = contractor.budget_amount || 0;
              const totalPaid = contractor.financial_summary?.total_paid || 0;
              const balanceDue = contractor.financial_summary?.balance_due || budgetAmount;
              const progressPercentage = contractor.financial_summary?.payment_progress_percentage ?? contractor.progress_percentage ?? 0;

              console.log('ContractorsTable - Contractor Row Data:', {
                contractor_id: contractor.id,
                contractor_name: contractor.provider?.name,
                budgetAmount,
                totalPaid,
                balanceDue,
                progressPercentage,
                financial_summary: contractor.financial_summary,
                progress_percentage: contractor.progress_percentage,
              });

              return (
                <tr key={contractor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contractor.provider?.name || 'Sin nombre'}
                      </div>
                      {contractor.provider?.business_name && (
                        <div className="text-xs text-gray-500">
                          {contractor.provider.business_name}
                        </div>
                      )}
                      {contractor.contract_number && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Contrato: {contractor.contract_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(budgetAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${getProgressTextColor(progressPercentage)}`}>
                      {formatCurrency(totalPaid)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${progressPercentage >= 90 ? 'text-gray-500' : progressPercentage >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                      {formatCurrency(balanceDue)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                        <div
                          className={`${getProgressColor(progressPercentage)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getProgressTextColor(progressPercentage)} min-w-[40px] text-right`}>
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onManagePayments && (
                        <button
                          onClick={() => onManagePayments(contractor.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Gestionar Pagos"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      {onManageWork && (
                        <button
                          onClick={() => onManageWork(contractor.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Gestionar Trabajo"
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(contractor)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDeleteClick(contractor)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el contractor ${contractorToDelete?.name}? Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a este contractor.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}