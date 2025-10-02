import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { Badge } from '@/design-system/components/data-display/Badge/Badge';
import { Button } from '@/design-system/components/inputs/Button';
import DataTable, { Column } from '@/design-system/components/data-display/DataTable/DataTable';
import PageHeader from '@/components/PageHeader/PageHeader';
import { EmptyState } from '@/design-system/components/feedback';

interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  status: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  progress: number;
  team: string[];
  priority: 'low' | 'medium' | 'high';
  image?: string;
}

interface ProjectsTableViewProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  loading?: boolean;
}

const STATUS_CONFIG = {
  planning: { label: 'Planificación', variant: 'info' as const },
  design: { label: 'Diseño', variant: 'warning' as const },
  development: { label: 'Desarrollo', variant: 'primary' as const },
  construction: { label: 'Construcción', variant: 'success' as const },
  completed: { label: 'Completado', variant: 'default' as const },
  paused: { label: 'Pausado', variant: 'error' as const }
};

const TYPE_LABELS = {
  residential: 'Residencial',
  commercial: 'Comercial',
  institutional: 'Institucional',
  renovation: 'Renovación',
  landscape: 'Paisajismo'
};

export function ProjectsTableView({ projects, onEdit, onDelete, loading }: ProjectsTableViewProps) {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin definir';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Calculate financial summaries
  const financialSummary = useMemo(() => {
    const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
    const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);
    const cashFlow = totalBudget - totalSpent;
    const avgProgress = projects.length > 0 
      ? projects.reduce((sum, project) => sum + project.progress, 0) / projects.length 
      : 0;

    return {
      totalBudget,
      totalSpent,
      cashFlow,
      avgProgress,
      projectCount: projects.length
    };
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const columns: Column<Project>[] = [
    {
      key: 'name',
      title: 'Proyecto',
      sortable: true,
      width: '25%',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div>
            <button
              onClick={() => navigate(`/projects/${record.id}`)}
              className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
            >
              {record.name}
            </button>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-gray-500">{record.client}</p>
              {getPriorityIcon(record.priority)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Tipo',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {TYPE_LABELS[value as keyof typeof TYPE_LABELS] || value}
        </span>
      )
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
      }
    },
    {
      key: 'progress',
      title: 'Progreso',
      sortable: true,
      render: (value) => (
        <div className="w-20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">{value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                value < 30 ? 'bg-red-500' :
                value < 60 ? 'bg-yellow-500' :
                value < 90 ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'budget',
      title: 'Presupuesto',
      sortable: true,
      align: 'right',
      render: (value, record) => (
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(value)}
          </p>
          <p className="text-xs text-gray-500">
            Gastado: {formatCurrency(record.spent)}
          </p>
        </div>
      )
    },
    {
      key: 'startDate',
      title: 'Fechas',
      sortable: true,
      render: (value, record) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{formatDate(value)}</span>
          </div>
          {record.endDate && (
            <div className="text-xs text-gray-500 mt-1">
              Fin: {formatDate(record.endDate)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'team',
      title: 'Equipo',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {value?.length || 0} miembros
          </span>
        </div>
      )
    }
  ];

  const rowActions = {
    items: [
      {
        key: 'view',
        label: 'Ver detalles',
        icon: <Eye className="h-4 w-4" />,
        onClick: (record: Project) => navigate(`/projects/${record.id}`)
      },
      ...(onEdit ? [{
        key: 'edit',
        label: 'Editar',
        icon: <Edit2 className="h-4 w-4" />,
        onClick: onEdit
      }] : []),
      ...(onDelete ? [{
        key: 'delete',
        label: 'Eliminar',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        danger: true
      }] : [])
    ]
  };

  const handleExport = (data: Project[]) => {
    const csvContent = [
      ['Nombre', 'Cliente', 'Tipo', 'Estado', 'Progreso', 'Presupuesto', 'Gastado', 'Inicio', 'Fin'].join(','),
      ...data.map(project => [
        project.name,
        project.client,
        TYPE_LABELS[project.type as keyof typeof TYPE_LABELS] || project.type,
        STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]?.label || project.status,
        `${project.progress}%`,
        project.budget,
        project.spent,
        formatDate(project.startDate),
        formatDate(project.endDate)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proyectos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Proyectos' }
  ];

  const headerActions = (
    <>
      <Button 
        variant="outline" 
        size="md"
        leftIcon={<Filter className="h-4 w-4" />}
        onClick={() => {/* TODO: Open filter modal */}}
      >
        Filtros
      </Button>
      <Button 
        variant="primary" 
        size="md"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={() => navigate('/projects/new')}
      >
        Nuevo Proyecto
      </Button>
    </>
  );

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Proyectos"
          subtitle="Gestiona todos tus proyectos desde aquí"
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />
        <div className="p-6">
          <EmptyState
            variant="no-projects"
            title="No hay proyectos"
            description="Comienza creando tu primer proyecto para gestionar tu trabajo."
            actions={{
              primary: {
                label: 'Crear Proyecto',
                onClick: () => navigate('/projects/new')
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Proyectos"
        subtitle={`${filteredProjects.length} proyectos activos`}
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <div className="p-6 space-y-6">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 bg-green-100 rounded-lg p-2" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Presupuestado</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(financialSummary.totalBudget)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600 bg-red-100 rounded-lg p-2" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Gastado</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(financialSummary.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Flujo de Caja</h3>
                <p className={`text-2xl font-semibold ${
                  financialSummary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(financialSummary.cashFlow)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Progreso Promedio</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(financialSummary.avgProgress)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            {selectedRows.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedRows.length} seleccionados
                </span>
                <Button variant="outline" size="sm">
                  Acciones en lote
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredProjects}
          columns={columns}
          loading={loading}
          rowKey="id"
          rowActions={rowActions}
          onRowClick={(record) => navigate(`/projects/${record.id}`)}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: (keys) => setSelectedRows(keys)
          }}
          searchable={false}
          exportable={true}
          onExport={handleExport}
          size="md"
          bordered={true}
          emptyText="No se encontraron proyectos que coincidan con los filtros."
        />
      </div>
    </div>
  );
}

export default ProjectsTableView;