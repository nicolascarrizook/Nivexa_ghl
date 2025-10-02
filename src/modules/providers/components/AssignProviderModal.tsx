import { useState, useEffect } from 'react';
import { X, User, Search, Plus } from 'lucide-react';
import { supabase } from '@/config/supabase';

interface Provider {
  id: string;
  name: string;
  provider_type: string;
  email: string | null;
  phone: string | null;
}

interface AssignProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSuccess?: () => void;
}

export function AssignProviderModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess
}: AssignProviderModalProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [assignedProviders, setAssignedProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [estimatedEndDate, setEstimatedEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProviders();
      loadAssignedProviders();
    }
  }, [isOpen, projectId]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, name, provider_type, email, phone')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const loadAssignedProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('project_providers')
        .select('provider_id')
        .eq('project_id', projectId)
        .eq('status', 'active');

      if (error) throw error;
      setAssignedProviders((data || []).map(item => item.provider_id));
    } catch (error) {
      console.error('Error loading assigned providers:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedProvider) {
      alert('Por favor seleccione un proveedor');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_providers')
        .insert({
          project_id: projectId,
          provider_id: selectedProvider,
          role: role || null,
          notes: notes || null,
          budget_amount: budgetAmount > 0 ? budgetAmount : null,
          start_date: startDate || null,
          estimated_end_date: estimatedEndDate || null,
          status: 'active'
        });

      if (error) {
        if (error.code === '23505') { // Duplicate key error
          alert('Este proveedor ya está asignado al proyecto');
        } else {
          throw error;
        }
        return;
      }

      alert('Proveedor asignado exitosamente');
      setSelectedProvider('');
      setRole('');
      setNotes('');
      setBudgetAmount(0);
      setStartDate('');
      setEstimatedEndDate('');
      loadAssignedProviders();
      onSuccess?.();
    } catch (error) {
      console.error('Error assigning provider:', error);
      alert('Error al asignar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => 
    !assignedProviders.includes(provider.id) &&
    (provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     provider.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     provider.phone?.includes(searchTerm))
  );

  const getProviderTypeLabel = (type: string) => {
    const labels = {
      'contractor': 'Contratista',
      'supplier': 'Proveedor',
      'service': 'Servicio',
      'professional': 'Profesional'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Asignar Proveedor al Proyecto
              </h3>
              <p className="text-sm text-gray-500 mt-1">{projectName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Provider Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Proveedor
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Seleccione un proveedor...</option>
              {filteredProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {getProviderTypeLabel(provider.provider_type)}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol en el Proyecto (opcional)
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej: Electricista principal, Proveedor de cemento, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Budget Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presupuesto (opcional)
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Estimada de Fin
              </label>
              <input
                type="date"
                value={estimatedEndDate}
                onChange={(e) => setEstimatedEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre la asignación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Currently Assigned */}
          {assignedProviders.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{assignedProviders.length}</strong> proveedor(es) ya asignado(s) a este proyecto
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedProvider}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {loading ? 'Asignando...' : 'Asignar Proveedor'}
          </button>
        </div>
      </div>
    </div>
  );
}