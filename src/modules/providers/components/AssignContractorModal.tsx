import { useState, useEffect } from 'react';
import { Check, User, FileText } from 'lucide-react';
import { supabase } from '@/config/supabase';
import Modal from '@/design-system/components/feedback/Modal';
import type { Database } from '@/types/database.types';
import { toast } from '@/hooks/useToast';

type Provider = Database['public']['Tables']['providers']['Row'];
type ProjectContractorInsert = Database['public']['Tables']['project_contractors']['Insert'];

interface AssignContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: () => void;
}

const SECTIONS = [
  { id: 1, title: 'Seleccionar Proveedor', icon: User, description: 'Elija el proveedor a asignar' },
  { id: 2, title: 'Detalles del Contrato', icon: FileText, description: 'Información del contrato (opcional)' },
  { id: 3, title: 'Revisión Final', icon: Check, description: 'Confirmar asignación' }
];

export function AssignContractorModal({ isOpen, onClose, projectId, onSuccess }: AssignContractorModalProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [assignedContractorIds, setAssignedContractorIds] = useState<string[]>([]);

  const [formData, setFormData] = useState<{
    contractor_id: string;
    contract_number: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
    start_date: string;
    estimated_end_date: string;
    notes: string;
  }>({
    contractor_id: '',
    contract_number: '',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    estimated_end_date: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadProviders();
    }
  }, [isOpen, projectId]);

  const loadProviders = async () => {
    setLoadingProviders(true);
    try {
      // Obtener contractors ya asignados a este proyecto
      const { data: assignedContractors, error: assignedError } = await supabase
        .from('project_contractors')
        .select('contractor_id')
        .eq('project_id', projectId);

      if (assignedError) throw assignedError;

      const assignedIds = assignedContractors?.map(pc => pc.contractor_id) || [];
      setAssignedContractorIds(assignedIds);

      // Obtener todos los providers activos
      const { data: allProviders, error: providersError } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (providersError) throw providersError;

      // Filtrar providers que no están asignados
      const availableProviders = allProviders?.filter(
        provider => !assignedIds.includes(provider.id)
      ) || [];

      setProviders(availableProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const validateSection = (sectionId: number): boolean => {
    switch (sectionId) {
      case 1:
        return !!formData.contractor_id;
      case 2:
        return true; // Contract details are optional
      case 3:
        return !!formData.contractor_id;
      default:
        return false;
    }
  };

  const handleSectionChange = (sectionId: number) => {
    if (sectionId < currentSection || completedSections.includes(currentSection)) {
      setCurrentSection(sectionId);
    } else if (validateSection(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
      setCurrentSection(sectionId);
    }
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (!completedSections.includes(currentSection)) {
        setCompletedSections([...completedSections, currentSection]);
      }
      if (currentSection < SECTIONS.length) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.contractor_id) {
      toast.warning('Debe seleccionar un proveedor');
      return;
    }

    setLoading(true);
    try {
      const contractorData: ProjectContractorInsert = {
        project_id: projectId,
        contractor_id: formData.contractor_id,
        status: formData.status,
        contract_number: formData.contract_number || null,
        start_date: formData.start_date || null,
        estimated_end_date: formData.estimated_end_date || null,
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from('project_contractors')
        .insert(contractorData);

      if (error) throw error;

      toast.success('Contractor asignado exitosamente');
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error assigning contractor:', error);
      toast.error('Error al asignar el contractor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentSection(1);
    setCompletedSections([]);
    setFormData({
      contractor_id: '',
      contract_number: '',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      estimated_end_date: '',
      notes: ''
    });
  };

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contractor: 'Proveedor',
      supplier: 'Proveedor de Materiales',
      service: 'Servicio',
      professional: 'Profesional'
    };
    return labels[type] || type;
  };

  const selectedProvider = providers.find(p => p.id === formData.contractor_id);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Seleccionar Proveedor</h2>
                <p className="text-sm text-tertiary">Elija el proveedor a asignar al proyecto</p>
              </div>
            </div>

            {loadingProviders ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12">
                {assignedContractorIds.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-500 mb-2">Todos los proveedores ya están asignados</p>
                    <p className="text-xs text-gray-400 mb-4">
                      No hay proveedores disponibles para asignar a este proyecto
                    </p>
                    <button
                      onClick={onClose}
                      className="text-sm text-gray-900 underline"
                    >
                      Cerrar
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">No hay proveedores disponibles</p>
                    <button
                      onClick={onClose}
                      className="text-sm text-gray-900 underline"
                    >
                      Crear un proveedor primero
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setFormData({ ...formData, contractor_id: provider.id })}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${formData.contractor_id === provider.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                        {provider.business_name && (
                          <p className="text-xs text-gray-500 mt-1">{provider.business_name}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {getProviderTypeLabel(provider.provider_type)}
                          </span>
                          {provider.email && (
                            <span className="text-xs text-gray-500">{provider.email}</span>
                          )}
                        </div>
                      </div>
                      {formData.contractor_id === provider.id && (
                        <div className="ml-4">
                          <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Detalles del Contrato</h2>
                <p className="text-sm text-tertiary">Información general del contrato</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Número de Contrato
                </label>
                <input
                  type="text"
                  value={formData.contract_number}
                  onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                  className="input-field w-full"
                  placeholder="CONT-2024-001"
                />
                <p className="text-xs text-tertiary mt-2">
                  Número o código del contrato (opcional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Estado Inicial
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="select-field w-full"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Fecha Estimada de Fin
                </label>
                <input
                  type="date"
                  value={formData.estimated_end_date}
                  onChange={(e) => setFormData({ ...formData, estimated_end_date: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-normal text-secondary mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="textarea-field w-full"
                  rows={4}
                  placeholder="Notas o información adicional sobre el contrato..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Check className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Revisión Final</h2>
                <p className="text-sm text-tertiary">Confirme la asignación del contractor</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Proveedor Seleccionado */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">Proveedor Seleccionado</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Nombre:</span>
                    <span className="text-sm text-primary font-medium">{selectedProvider?.name || '-'}</span>
                  </div>
                  {selectedProvider?.business_name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary">Razón Social:</span>
                      <span className="text-sm text-primary">{selectedProvider.business_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Tipo:</span>
                    <span className="text-sm text-primary">{getProviderTypeLabel(selectedProvider?.provider_type || '')}</span>
                  </div>
                  {selectedProvider?.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary">Email:</span>
                      <span className="text-sm text-primary">{selectedProvider.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles del Contrato */}
              {(formData.contract_number || formData.start_date || formData.estimated_end_date) && (
                <div>
                  <h3 className="text-sm font-medium text-primary mb-3">Detalles del Contrato</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {formData.contract_number && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Número de Contrato:</span>
                        <span className="text-sm text-primary">{formData.contract_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary">Estado:</span>
                      <span className="text-sm text-primary">
                        {formData.status === 'draft' && 'Borrador'}
                        {formData.status === 'active' && 'Activo'}
                        {formData.status === 'paused' && 'Pausado'}
                      </span>
                    </div>
                    {formData.start_date && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Fecha de Inicio:</span>
                        <span className="text-sm text-primary">
                          {new Date(formData.start_date).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    )}
                    {formData.estimated_end_date && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Fecha Estimada de Fin:</span>
                        <span className="text-sm text-primary">
                          {new Date(formData.estimated_end_date).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    )}
                    {formData.notes && (
                      <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                        <span className="text-sm text-secondary">Notas:</span>
                        <span className="text-sm text-primary">{formData.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información sobre presupuestos */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Próximos pasos</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Después de asignar el contractor, podrá crear ítems de presupuesto para cada trabajo</li>
                  <li>• Cada ítem representa un trabajo específico con su propio monto y pagos</li>
                  <li>• Los pagos se gestionan individualmente por cada ítem de trabajo</li>
                </ul>
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
            <h2 className="text-lg font-semibold text-gray-900">Asignar Contractor</h2>
            <p className="text-xs text-gray-500 mt-1">Complete la información</p>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                const isCompleted = completedSections.includes(section.id);

                return (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionChange(section.id)}
                      className={`
                        w-full flex items-start space-x-2 px-2 py-2 rounded-md transition-all
                        ${isActive ? 'bg-gray-100 text-gray-900' : isCompleted ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'}
                      `}
                      disabled={!isCompleted && section.id > currentSection}
                    >
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                        ${isActive ? 'bg-gray-900 text-white' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                      `}>
                        {isCompleted && !isActive ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{section.title}</p>
                        <p className="text-xs text-gray-500">{section.description}</p>
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
              Cancelar
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Progress Bar */}
          <div className="bg-white px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">
                Paso {currentSection} de {SECTIONS.length}
              </span>
              <span className="text-xs text-gray-600">
                {Math.round((completedSections.length / SECTIONS.length) * 100)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(completedSections.length / SECTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              {renderCurrentSection()}
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white border-t border-gray-200 px-6 py-3">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentSection === 1}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${currentSection === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Anterior
              </button>

              <div className="flex items-center space-x-2">
                {currentSection < SECTIONS.length ? (
                  <button
                    onClick={handleNext}
                    disabled={!validateSection(currentSection)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg transition-colors
                      ${!validateSection(currentSection)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800'}
                    `}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center
                      ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}
                    `}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        Asignar Contractor
                        <Check className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}