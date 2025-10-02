import { useState } from 'react';
import type { ProjectContractorWithDetails } from '../services';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ContractorCardProps {
  contractor: ProjectContractorWithDetails;
  onEdit?: (contractor: ProjectContractorWithDetails) => void;
  onDelete?: (contractorId: string) => void;
  onViewDetails?: (contractorId: string) => void;
}

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export function ContractorCard({ contractor, onEdit, onDelete, onViewDetails }: ContractorCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const status = statusConfig[contractor.status as keyof typeof statusConfig] || statusConfig.draft;

  const budgetAmount = contractor.budget_amount || 0;
  const totalPaid = contractor.financial_summary?.total_paid || 0;
  const balanceDue = contractor.financial_summary?.balance_due || budgetAmount;
  // Use payment progress as main progress indicator if financial summary exists
  const progressPercentage = contractor.financial_summary?.payment_progress_percentage ?? contractor.progress_percentage ?? 0;

  // Debug log
  console.log('ContractorCard Debug:', {
    contractor_id: contractor.id,
    budget_amount: budgetAmount,
    financial_summary: contractor.financial_summary,
    progress_percentage: progressPercentage,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Get color based on progress percentage
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(contractor.id);
    }
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {contractor.provider?.name || 'Sin nombre'}
          </h3>
          {contractor.provider?.business_name && (
            <p className="text-sm text-gray-500 mt-1">
              {contractor.provider.business_name}
            </p>
          )}
          {contractor.contract_number && (
            <p className="text-xs text-gray-400 mt-1">
              Contrato: {contractor.contract_number}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {onViewDetails && (
                  <button
                    onClick={() => {
                      onViewDetails(contractor.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Ver detalles
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(contractor);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso de Pago</span>
          <span className={`text-sm font-semibold ${getProgressTextColor(progressPercentage)}`}>
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`${getProgressColor(progressPercentage)} h-2.5 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Presupuesto</p>
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(budgetAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Pagado</p>
          <p className={`text-sm font-semibold ${getProgressTextColor(progressPercentage)}`}>
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Saldo</p>
          <p className={`text-sm font-semibold ${progressPercentage >= 90 ? 'text-gray-500' : progressPercentage >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
            {formatCurrency(balanceDue)}
          </p>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el contractor ${contractor.provider?.name || 'Sin nombre'}? Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a este contractor.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}