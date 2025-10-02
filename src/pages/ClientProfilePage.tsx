import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Download,
  Edit2,
  Eye,
  FileText,
  FolderOpen,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
  Users
} from 'lucide-react';

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Column } from '@/design-system/components/data-display';
import { Badge, DataTable } from '@/design-system/components/data-display';
import { SectionCard } from '@/design-system/components/layout';

// Utilities
import { formatCurrency, formatDate } from '@/utils/formatters';

// Hooks
import { useClients } from '@/modules/clients/hooks/useClients';

interface ClientDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

interface ClientProject {
  id: string;
  name: string;
  status: 'En progreso' | 'Completado' | 'Pausado';
  startDate: string;
  endDate?: string;
  budget?: number;
  progress?: number;
  type?: string;
}

// TODO: These will be loaded from Supabase in future implementation
const mockDocuments: ClientDocument[] = [];
const mockProjects: ClientProject[] = [];

export function ClientProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'citas' | 'proyectos' | 'documentos'>('proyectos');

  // Load client data from Supabase
  const { getClient, selectedClient, isLoading, deleteClient } = useClients();

  // Load client when component mounts or ID changes
  useEffect(() => {
    if (id) {
      getClient(id);
    }
  }, [id, getClient]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  // Show error if client not found
  if (!selectedClient && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cliente no encontrado</h2>
          <p className="text-gray-600 mb-4">El cliente que buscas no existe o fue eliminado.</p>
          <button
            onClick={() => navigate('/clients')}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  const STATUS_CONFIG = {
    'En progreso': { label: 'En progreso', variant: 'primary' as const },
    'Completado': { label: 'Completado', variant: 'default' as const },
    'Pausado': { label: 'Pausado', variant: 'error' as const },
  };

  const TYPE_LABELS = {
    residential: 'Residencial',
    commercial: 'Comercial',
    renovation: 'Renovación',
    landscape: 'Paisajismo',
  };

  const handleEditClient = () => {
    navigate(`/clients/${id}/edit`);
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    if (confirm(`¿Estás seguro de eliminar el cliente "${selectedClient.name}"?`)) {
      const success = await deleteClient(selectedClient.id);
      if (success) {
        navigate('/clients');
      }
    }
  };

  const handleNewProject = () => {
    navigate(`/projects/new?client=${id}`);
  };

  const handleViewProject = (project: ClientProject) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project: ClientProject) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDeleteProject = (project: ClientProject) => {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"?`)) {
      console.log('Delete project:', project);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Sin definir';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Define projects table columns
  const projectColumns: Column[] = [
    {
      key: 'name',
      title: 'Proyecto',
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div>
            <button
              onClick={() => handleViewProject(record)}
              className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              {record.name}
            </button>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {TYPE_LABELS[record.type as keyof typeof TYPE_LABELS] || record.type || 'Sin tipo'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Estado',
      sortable: true,
      render: (value) => {
        const statusConfig = STATUS_CONFIG[value as keyof typeof STATUS_CONFIG];
        return (
          <Badge variant={statusConfig?.variant || 'default'} size="sm">
            {statusConfig?.label || value}
          </Badge>
        );
      },
    },
    {
      key: 'progress',
      title: 'Progreso',
      sortable: true,
      render: (value) => (
        <div className="w-20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              {value || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                (value || 0) < 30
                  ? 'bg-red-500'
                  : (value || 0) < 60
                  ? 'bg-yellow-500'
                  : (value || 0) < 90
                  ? 'bg-blue-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${value || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'budget',
      title: 'Presupuesto',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(value || 0)}
        </span>
      ),
    },
    {
      key: 'startDate',
      title: 'Fechas',
      sortable: true,
      render: (value, record) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{formatDateDisplay(value)}</span>
          </div>
          {record.endDate && (
            <div className="text-xs text-gray-500 mt-1">
              Fin: {formatDateDisplay(record.endDate)}
            </div>
          )}
        </div>
      ),
    },
  ];

  // Define documents table columns
  const documentColumns: Column[] = [
    {
      key: 'name',
      title: 'Documento',
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            <FileText className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-500">{record.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'size',
      title: 'Tamaño',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'date',
      title: 'Fecha',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {formatDateDisplay(value)}
        </span>
      ),
    },
  ];

  const projectRowActions = {
    items: [
      {
        key: 'view',
        label: 'Ver detalles',
        icon: <Eye className="h-4 w-4" />,
        onClick: handleViewProject,
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: <Edit2 className="h-4 w-4" />,
        onClick: handleEditProject,
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDeleteProject,
        danger: true,
      },
    ],
  };

  const documentRowActions = {
    items: [
      {
        key: 'download',
        label: 'Descargar',
        icon: <Download className="h-4 w-4" />,
        onClick: (record: any) => console.log('Download document:', record),
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record: any) => {
          if (confirm(`¿Estás seguro de eliminar el documento "${record.name}"?`)) {
            console.log('Delete document:', record);
          }
        },
        danger: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Nivexa Studio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/clients">Clientes</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedClient?.name || 'Cargando...'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-gray-700">
                  {selectedClient?.name.split(' ').map(n => n[0]).join('') || '?'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedClient?.name || 'Cargando...'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Cliente desde {selectedClient?.created_at ? formatDate(selectedClient.created_at) : '...'} • {mockProjects.length} proyectos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewProject}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </button>
              <button
                onClick={handleEditClient}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Cliente
              </button>
              <button
                onClick={handleDeleteClient}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cliente
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Client Information Card */}
            <SectionCard className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Información del Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedClient?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-sm font-medium text-gray-900">{selectedClient?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">CUIT/CUIL</p>
                      <p className="text-sm font-medium text-gray-900">{selectedClient?.tax_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedClient?.address || 'N/A'}
                        {selectedClient?.city && `, ${selectedClient.city}`}
                        {selectedClient?.state && `, ${selectedClient.state}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Cliente desde</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedClient?.created_at ? formatDate(selectedClient.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">ID Cliente</p>
                      <p className="text-sm font-medium text-gray-900 font-mono text-xs">{selectedClient?.id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SectionCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mockProjects.length}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Total Proyectos</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mockProjects.filter(p => p.status === 'En progreso').length}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Proyectos Activos</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mockProjects.filter(p => p.status === 'Completado').length}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Proyectos Completados</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Tabs */}
            <SectionCard className="p-0">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('proyectos')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'proyectos'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Proyectos
                  </button>
                  <button
                    onClick={() => setActiveTab('documentos')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'documentos'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Documentos
                  </button>
                  <button
                    onClick={() => setActiveTab('citas')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'citas'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Citas
                  </button>
                </nav>
              </div>

              {activeTab === 'proyectos' && (
                <DataTable
                  data={mockProjects}
                  columns={projectColumns}
                  loading={false}
                  rowKey="id"
                  rowActions={projectRowActions}
                  onRowClick={handleViewProject}
                  searchable={false}
                  exportable={false}
                  size="md"
                  bordered={false}
                  emptyText="No hay proyectos para este cliente."
                  pagination={false}
                />
              )}

              {activeTab === 'documentos' && (
                <DataTable
                  data={mockDocuments}
                  columns={documentColumns}
                  loading={false}
                  rowKey="id"
                  rowActions={documentRowActions}
                  searchable={false}
                  exportable={false}
                  size="md"
                  bordered={false}
                  emptyText="No hay documentos para este cliente."
                  pagination={false}
                />
              )}

              {activeTab === 'citas' && (
                <div className="p-6">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay citas programadas
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Las citas programadas con este cliente aparecerán aquí.
                    </p>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Programar Cita
                    </button>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <SectionCard className="p-4 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleNewProject}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Proyecto</span>
                  </button>
                  <button
                    onClick={handleEditClient}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar Cliente</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('documentos')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Ver Documentos</span>
                  </button>
                </div>
              </SectionCard>

              {/* Recent Documents */}
              <SectionCard className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos Recientes</h2>
                <div className="space-y-3">
                  {mockDocuments.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateDisplay(doc.date)} • {doc.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('documentos')}
                  className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ver todos los documentos
                </button>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}