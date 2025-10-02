import { FileText } from 'lucide-react';
import Modal from '@/design-system/components/feedback/Modal';
import { BudgetSection } from './BudgetSection';
import { PaymentSection } from './PaymentSection';

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
                <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
                <p className="text-xs text-gray-500 mt-1">{contractorName || 'Contractor'}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <p className="text-sm text-gray-600">
              Vista completa del presupuesto y pagos del proveedor
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
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Budget Summary */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">Presupuesto</h3>
                <BudgetSection projectContractorId={projectContractorId} />
              </div>

              {/* Payments Summary */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">Pagos</h3>
                <PaymentSection
                  projectContractorId={projectContractorId}
                  onPaymentChange={onPaymentChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}