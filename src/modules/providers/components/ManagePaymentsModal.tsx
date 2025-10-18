import { FileText } from 'lucide-react';
import Modal from '@/design-system/components/feedback/Modal';
import { SimplePayableAccount } from './SimplePayableAccount';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

interface ManagePaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectContractorId: string;
  contractorName?: string;
  onPaymentChange?: () => void;
}

export function ManagePaymentsModal({
  isOpen,
  onClose,
  projectContractorId,
  contractorName,
  onPaymentChange,
}: ManagePaymentsModalProps) {
  // Fetch project contractor data to get project_id, budget_amount, and currency
  const { data: contractorData, isLoading } = useQuery({
    queryKey: ['project-contractor', projectContractorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_contractors')
        .select('project_id, budget_amount, currency')
        .eq('id', projectContractorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!projectContractorId,
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" hideCloseButton>
      <div className="flex h-[600px] bg-gray-50 rounded-lg overflow-hidden">
        {/* Sidebar Header */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Cuenta por Pagar</h2>
                <p className="text-xs text-gray-500 mt-1">{contractorName || 'Contractor'}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <p className="text-sm text-gray-600">
              Gestiona los pagos a este proveedor de forma simple y directa
            </p>
          </div>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse space-y-4 w-full max-w-3xl">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : contractorData ? (
              <div className="max-w-3xl mx-auto">
                <SimplePayableAccount
                  projectContractorId={projectContractorId}
                  projectId={contractorData.project_id}
                  contractorName={contractorName || 'Contractor'}
                  budgetAmount={contractorData.budget_amount || 0}
                  currency={contractorData.currency || 'ARS'}
                  onPaymentRegistered={onPaymentChange}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No se pudo cargar la información del contractor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}