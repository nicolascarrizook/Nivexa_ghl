import { useState } from 'react';
import { Briefcase, FileText } from 'lucide-react';
import Modal from '@/design-system/components/feedback/Modal';
import { BudgetSection } from './BudgetSection';

interface ManageWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectContractorId: string;
  contractorName?: string;
}

const TABS = [
  { id: 'work', title: 'Trabajo', icon: Briefcase, description: 'Gestionar trabajo del proveedor' },
  { id: 'summary', title: 'Resumen', icon: FileText, description: 'Vista detallada' }
];

export function ManageWorkModal({
  isOpen,
  onClose,
  projectContractorId,
  contractorName,
}: ManageWorkModalProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'summary'>('work');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'work':
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Trabajo</h2>
                <p className="text-sm text-tertiary">Administrar el trabajo asignado al proveedor</p>
              </div>
            </div>

            <BudgetSection projectContractorId={projectContractorId} />
          </div>
        );

      case 'summary':
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Resumen</h2>
                <p className="text-sm text-tertiary">Vista detallada del trabajo</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">Información del Trabajo</h3>
                <BudgetSection projectContractorId={projectContractorId} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" hideCloseButton>
      <div className="flex h-[600px] bg-gray-50 rounded-lg overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Gestionar Trabajo</h2>
            <p className="text-xs text-gray-500 mt-1">{contractorName || 'Contractor'}</p>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`
                        w-full flex items-start space-x-2 px-2 py-2 rounded-md transition-all
                        ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}
                      `}
                    >
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                        ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}
                      `}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{tab.title}</p>
                        <p className="text-xs text-gray-500">{tab.description}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

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
            <div className="max-w-3xl mx-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}