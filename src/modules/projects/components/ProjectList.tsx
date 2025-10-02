import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  Clock,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/design-system/components/data-display';
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

interface ProjectListProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  loading?: boolean;
}

const STATUS_CONFIG = {
  planning: { label: 'Planificación', variant: 'info' as const, color: 'bg-blue-100 text-blue-800' },
  design: { label: 'Diseño', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-800' },
  development: { label: 'Desarrollo', variant: 'primary' as const, color: 'bg-indigo-100 text-indigo-800' },
  construction: { label: 'Construcción', variant: 'success' as const, color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completado', variant: 'default' as const, color: 'bg-gray-100 text-gray-800' },
  paused: { label: 'Pausado', variant: 'error' as const, color: 'bg-red-100 text-red-800' }
};

const TYPE_LABELS = {
  residential: 'Residencial',
  commercial: 'Comercial',
  institutional: 'Institucional',
  renovation: 'Renovación',
  landscape: 'Paisajismo'
};

export function ProjectList({ projects, onEdit, onDelete, loading }: ProjectListProps) {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

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

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 60) return 'bg-yellow-500';
    if (progress < 90) return 'bg-blue-500';
    return 'bg-green-500';
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const statusConfig = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
        const budgetPercentage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;

        return (
          <div
            key={project.id}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
          >
            {/* Project Image or Placeholder */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
              {project.image ? (
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Sin imagen</p>
                  </div>
                </div>
              )}
              
              {/* Priority Indicator */}
              {project.priority && project.priority !== 'low' && (
                <div className="absolute top-3 left-3">
                  {getPriorityIcon(project.priority)}
                </div>
              )}

              {/* Actions Menu */}
              <div className="absolute top-3 right-3">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === project.id ? null : project.id);
                    }}
                    className="p-2 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {openMenuId === project.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                      <button
                        onClick={() => {
                          navigate(`/projects/${project.id}`);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </button>
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit(project);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(project);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-3 left-3">
                <Badge variant={statusConfig?.variant || 'default'} size="sm">
                  {statusConfig?.label || project.status}
                </Badge>
              </div>
            </div>

            {/* Project Content */}
            <div className="p-6">
              {/* Header */}
              <div className="mb-4">
                <h3 
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{project.client}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {TYPE_LABELS[project.type as keyof typeof TYPE_LABELS] || project.type}
                </p>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Progreso</span>
                  <span className="text-xs font-medium text-gray-700">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Presupuesto</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Inicio</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Usage Bar */}
              {project.budget > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Presupuesto usado</span>
                    <span className={`text-xs font-medium ${
                      budgetPercentage > 90 ? 'text-red-600' : 
                      budgetPercentage > 70 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {budgetPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        budgetPercentage > 90 ? 'bg-red-500' : 
                        budgetPercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {project.team?.length || 0} miembros
                  </span>
                </div>

                {/* Days Remaining */}
                {project.endDate && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const daysRemaining = Math.ceil(
                          (new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                        );
                        if (daysRemaining < 0) return 'Vencido';
                        if (daysRemaining === 0) return 'Hoy';
                        if (daysRemaining === 1) return '1 día';
                        return `${daysRemaining} días`;
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}