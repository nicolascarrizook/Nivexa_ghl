import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Phone, Mail, Building, User, Edit, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/config/supabase';
import { CreateProviderModal } from './CreateProviderModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/hooks/useToast';

interface Provider {
  id: string;
  name: string;
  business_name: string | null;
  tax_id: string | null;
  provider_type: 'contractor' | 'supplier' | 'service' | 'professional';
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function ProvidersList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProviderToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!providerToDelete) return;

    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', providerToDelete.id);

      if (error) throw error;

      toast.success('Proveedor eliminado exitosamente');
      loadProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Error al eliminar el proveedor');
    } finally {
      setShowDeleteModal(false);
      setProviderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProviderToDelete(null);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.phone?.includes(searchTerm);
    
    const matchesType = filterType === 'all' || provider.provider_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getProviderTypeLabel = (type: string) => {
    const labels = {
      'contractor': 'Contratista',
      'supplier': 'Proveedor',
      'service': 'Servicio',
      'professional': 'Profesional'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getProviderTypeColor = (type: string) => {
    const colors = {
      'contractor': 'bg-blue-100 text-blue-800',
      'supplier': 'bg-green-100 text-green-800',
      'service': 'bg-purple-100 text-purple-800',
      'professional': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proveedores y Contratistas</h1>
        <p className="text-gray-600 mt-1">Gestione sus proveedores, contratistas y profesionales</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              <option value="contractor">Contratistas</option>
              <option value="supplier">Proveedores</option>
              <option value="service">Servicios</option>
              <option value="professional">Profesionales</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nuevo Proveedor
            </button>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' 
              ? 'No se encontraron proveedores'
              : 'No hay proveedores registrados'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'Intente con otros criterios de búsqueda'
              : 'Comience registrando su primer proveedor o contratista'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Registrar Primer Proveedor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {provider.name}
                    </h3>
                    {provider.business_name && (
                      <p className="text-sm text-gray-500">{provider.business_name}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderTypeColor(provider.provider_type)}`}>
                    {getProviderTypeLabel(provider.provider_type)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {provider.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {provider.email}
                    </div>
                  )}
                  {provider.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {provider.phone}
                    </div>
                  )}
                  {provider.city && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      {provider.city}
                    </div>
                  )}
                  {provider.tax_id && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      CUIT: {provider.tax_id}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {/* TODO: View provider details */}}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {/* TODO: Edit provider */}}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(provider.id, provider.name)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Provider Modal */}
      <CreateProviderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadProviders}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Está seguro de eliminar al proveedor ${providerToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}