import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/design-system/components/data-display/Badge/Badge';
import DataTable, { Column } from '@/design-system/components/data-display/DataTable/DataTable';
import { ProjectWithDetails } from '../services/ProjectService';

interface ProjectsTableProps {
  projects: ProjectWithDetails[];
  onEdit?: (project: ProjectWithDetails) => void;
  onDelete?: (project: ProjectWithDetails) => void;
  loading?: boolean;
}

const STATUS_CONFIG = {
  draft: { label: 'Borrador', variant: 'default' as const },
  active: { label: 'Activo', variant: 'success' as const },
  on_hold: { label: 'En Pausa', variant: 'warning' as const },
  completed: { label: 'Completado', variant: 'info' as const },
  cancelled: { label: 'Cancelado', variant: 'error' as const }
};

const TYPE_LABELS = {
  construction: 'Construcción',
  renovation: 'Renovación',
  design: 'Diseño',
  other: 'Otro'
};

export function ProjectsTable({ projects, onEdit, onDelete, loading }: ProjectsTableProps) {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin definir';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProgressPercentage = (project: ProjectWithDetails): number => {
    if (project.progress_percentage !== undefined) {
      return project.progress_percentage;
    }
    
    // Fallback calculation based on payments
    if (project.total_amount > 0 && project.paid_amount) {
      return Math.round((project.paid_amount / project.total_amount) * 100);
    }
    
    return 0;
  };

  const columns: Column<ProjectWithDetails>[] = [
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
              <p className="text-xs text-gray-500">{record.client_name}</p>
              <span className="text-xs text-gray-400">•</span>
              <p className="text-xs text-gray-400">{record.code}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'project_type',
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
      sortable: false,
      render: (_, record) => {
        const progress = getProgressPercentage(record);
        return (
          <div className="w-20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  progress < 30 ? 'bg-red-500' :
                  progress < 60 ? 'bg-yellow-500' :
                  progress < 90 ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'total_amount',
      title: 'Presupuesto',
      sortable: true,
      align: 'right',
      render: (value, record) => (
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(value)}
          </p>
          {record.paid_amount && (
            <p className="text-xs text-gray-500">
              Pagado: {formatCurrency(record.paid_amount)}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'start_date',
      title: 'Fechas',
      sortable: true,
      render: (value, record) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{formatDate(value)}</span>
          </div>
          {record.estimated_end_date && (
            <div className="text-xs text-gray-500 mt-1">
              Fin: {formatDate(record.estimated_end_date)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'installments_count',
      title: 'Cuotas',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {value || 0} cuotas
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
        onClick: (record: ProjectWithDetails) => navigate(`/projects/${record.id}`)
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

  const handleExport = (data: ProjectWithDetails[]) => {
    const csvContent = [
      ['Código', 'Nombre', 'Cliente', 'Tipo', 'Estado', 'Presupuesto', 'Pagado', 'Inicio', 'Fin'].join(','),
      ...data.map(project => [
        project.code,
        project.name,
        project.client_name,
        TYPE_LABELS[project.project_type as keyof typeof TYPE_LABELS] || project.project_type,
        STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]?.label || project.status,
        project.total_amount,
        project.paid_amount || 0,
        formatDate(project.start_date),
        formatDate(project.estimated_end_date)
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

  return (
    <DataTable
      data={projects}
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
      emptyText="No se encontraron proyectos."
    />
  );
}

export default ProjectsTable;