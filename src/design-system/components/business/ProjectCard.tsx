import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  MoreVertical,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  MapPin
} from 'lucide-react';

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface ProjectBudget {
  total: number;
  spent: number;
  remaining: number;
  currency: 'MXN' | 'USD';
}

export interface ProjectTimeline {
  startDate: string;
  endDate: string;
  estimatedDuration: number; // in days
  actualDuration?: number; // in days
}

export interface ProjectCardProps {
  /** ID único del proyecto */
  id: string;
  /** Nombre del proyecto */
  name: string;
  /** Descripción breve del proyecto */
  description?: string;
  /** Cliente del proyecto */
  client: {
    id: string;
    name: string;
    avatar?: string;
  };
  /** Estado del proyecto */
  status: 'en-curso' | 'completado' | 'pausado' | 'cancelado' | 'planificacion';
  /** Progreso del proyecto (0-100) */
  progress: number;
  /** Información presupuestaria */
  budget: ProjectBudget;
  /** Cronograma del proyecto */
  timeline: ProjectTimeline;
  /** Ubicación del proyecto */
  location?: {
    address: string;
    city: string;
    state: string;
  };
  /** Tipo de proyecto */
  type: 'residencial' | 'comercial' | 'industrial' | 'infraestructura';
  /** Prioridad del proyecto */
  priority: 'baja' | 'media' | 'alta' | 'critica';
  /** Equipo del proyecto */
  team: ProjectTeamMember[];
  /** Última actualización */
  lastUpdate?: string;
  /** Alertas del proyecto */
  alerts?: {
    type: 'presupuesto' | 'cronograma' | 'calidad' | 'seguridad';
    message: string;
    severity: 'info' | 'warning' | 'error';
  }[];
  /** Callbacks para acciones */
  onViewDetails?: (projectId: string) => void;
  onEditProject?: (projectId: string) => void;
  onViewClient?: (clientId: string) => void;
  onManageTeam?: (projectId: string) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Tamaño del card */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  client,
  status,
  progress,
  budget,
  timeline,
  location,
  type,
  priority,
  team,
  lastUpdate,
  alerts = [],
  onViewDetails,
  onEditProject,
  onViewClient,
  onManageTeam,
  loading = false,
  size = 'md',
  className = '',
}) => {
  const statusConfig = {
    'en-curso': {
      bg: 'bg-info-50 dark:bg-info-900/20',
      text: 'text-info-700 dark:text-info-400',
      border: 'border-info-200 dark:border-info-700',
      icon: PlayCircle,
      label: 'En Curso',
    },
    'completado': {
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-700 dark:text-success-400',
      border: 'border-success-200 dark:border-success-700',
      icon: CheckCircle,
      label: 'Completado',
    },
    'pausado': {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-700 dark:text-warning-400',
      border: 'border-warning-200 dark:border-warning-700',
      icon: PauseCircle,
      label: 'Pausado',
    },
    'cancelado': {
      bg: 'bg-error-50 dark:bg-error-900/20',
      text: 'text-error-700 dark:text-error-400',
      border: 'border-error-200 dark:border-error-700',
      icon: AlertTriangle,
      label: 'Cancelado',
    },
    'planificacion': {
      bg: 'bg-neutral-50 dark:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-400',
      border: 'border-neutral-200 dark:border-neutral-600',
      icon: Clock,
      label: 'Planificación',
    },
  };

  const priorityConfig = {
    baja: { color: 'text-neutral-500', bg: 'bg-neutral-100', label: 'Baja' },
    media: { color: 'text-info-600', bg: 'bg-info-100', label: 'Media' },
    alta: { color: 'text-warning-600', bg: 'bg-warning-100', label: 'Alta' },
    critica: { color: 'text-error-600', bg: 'bg-error-100', label: 'Crítica' },
  };

  const typeConfig = {
    residencial: { icon: Building2, label: 'Residencial', color: 'text-primary-600' },
    comercial: { icon: Building2, label: 'Comercial', color: 'text-success-600' },
    industrial: { icon: Building2, label: 'Industrial', color: 'text-warning-600' },
    infraestructura: { icon: Building2, label: 'Infraestructura', color: 'text-info-600' },
  };

  const sizeConfig = {
    sm: {
      padding: 'p-4',
      avatarSize: 'w-6 h-6',
      titleSize: 'text-sm',
      textSize: 'text-xs',
    },
    md: {
      padding: 'p-6',
      avatarSize: 'w-8 h-8',
      titleSize: 'text-base',
      textSize: 'text-sm',
    },
    lg: {
      padding: 'p-8',
      avatarSize: 'w-10 h-10',
      titleSize: 'text-lg',
      textSize: 'text-base',
    },
  };

  const currentStatus = statusConfig[status];
  const currentPriority = priorityConfig[priority];
  const currentType = typeConfig[type];
  const StatusIcon = currentStatus.icon;
  const TypeIcon = currentType.icon;

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getProgressColor = () => {
    if (progress < 30) return 'bg-error-500';
    if (progress < 70) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getBudgetPercentage = () => {
    return (budget.spent / budget.total) * 100;
  };

  const getBudgetStatus = () => {
    const percentage = getBudgetPercentage();
    if (percentage > 90) return 'error';
    if (percentage > 75) return 'warning';
    return 'success';
  };

  const getDaysRemaining = () => {
    const endDate = new Date(timeline.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderClientAvatar = () => {
    if (client.avatar) {
      return (
        <img
          src={client.avatar}
          alt={client.name}
          className={`${sizeConfig[size].avatarSize} rounded-full object-cover`}
        />
      );
    }

    const initials = client.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className={`${sizeConfig[size].avatarSize} rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center`}>
        <span className="text-primary-700 dark:text-primary-300 font-semibold text-xs">
          {initials}
        </span>
      </div>
    );
  };

  const renderTeamAvatars = () => {
    const visibleTeam = team.slice(0, 3);
    const remainingCount = team.length - 3;

    return (
      <div className="flex items-center -space-x-2">
        {visibleTeam.map((member) => (
          <div key={member.id} className="relative">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className={`${sizeConfig[size].avatarSize} rounded-full border-2 border-white dark:border-neutral-900 object-cover`}
                title={`${member.name} - ${member.role}`}
              />
            ) : (
              <div 
                className={`${sizeConfig[size].avatarSize} rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center`}
                title={`${member.name} - ${member.role}`}
              >
                <span className="text-neutral-600 dark:text-neutral-400 font-semibold text-xs">
                  {member.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className={`${sizeConfig[size].avatarSize} rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center`}>
            <span className="text-neutral-600 dark:text-neutral-400 font-semibold text-xs">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderAlerts = () => {
    if (alerts.length === 0) return null;

    const criticalAlerts = alerts.filter(alert => alert.severity === 'error');
    const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

    if (criticalAlerts.length > 0) {
      return (
        <div className="mb-3 p-2 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-error-600 dark:text-error-400" />
            <span className="text-xs text-error-700 dark:text-error-300 font-medium">
              {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? 's' : ''} crítica{criticalAlerts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      );
    }

    if (warningAlerts.length > 0) {
      return (
        <div className="mb-3 p-2 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
            <span className="text-xs text-warning-700 dark:text-warning-300 font-medium">
              {warningAlerts.length} advertencia{warningAlerts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-20" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        </div>
      );
    }

    const daysRemaining = getDaysRemaining();

    return (
      <>
        {/* Header with name, status, and priority */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].titleSize} truncate`}>
                {name}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border} border`}>
                <StatusIcon className="w-3 h-3" />
                {currentStatus.label}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <TypeIcon className={`w-4 h-4 ${currentType.color}`} />
                <span className={`${sizeConfig[size].textSize} text-neutral-600 dark:text-neutral-400`}>
                  {currentType.label}
                </span>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentPriority.bg} ${currentPriority.color}`}>
                {currentPriority.label}
              </span>
            </div>
          </div>
          
          {onEditProject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditProject(id);
              }}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Alerts */}
        {renderAlerts()}

        {/* Client Information */}
        <div className="flex items-center justify-between mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewClient?.(client.id);
            }}
          >
            {renderClientAvatar()}
            <div>
              <p className={`font-medium text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].textSize}`}>
                {client.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Cliente
              </p>
            </div>
          </div>
          
          {location && (
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">
                {location.city}, {location.state}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`${sizeConfig[size].textSize} font-medium text-neutral-700 dark:text-neutral-300`}>
              Progreso
            </span>
            <span className={`${sizeConfig[size].textSize} font-semibold text-neutral-900 dark:text-neutral-100`}>
              {progress}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getProgressColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Budget Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Presupuesto</p>
            <p className={`font-semibold text-neutral-900 dark:text-neutral-100 ${sizeConfig[size].textSize}`}>
              {formatCurrency(budget.total, budget.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Gastado</p>
            <p className={`font-semibold ${sizeConfig[size].textSize}`}>
              <span className={getBudgetStatus() === 'error' ? 'text-error-600' : getBudgetStatus() === 'warning' ? 'text-warning-600' : 'text-success-600'}>
                {formatCurrency(budget.spent, budget.currency)}
              </span>
            </p>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1 mt-1">
              <div
                className={`h-1 rounded-full ${
                  getBudgetStatus() === 'error' ? 'bg-error-500' :
                  getBudgetStatus() === 'warning' ? 'bg-warning-500' : 'bg-success-500'
                }`}
                style={{ width: `${Math.min(getBudgetPercentage(), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Inicio</p>
            <p className={`${sizeConfig[size].textSize} text-neutral-900 dark:text-neutral-100`}>
              {formatDate(timeline.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Fin estimado</p>
            <p className={`${sizeConfig[size].textSize} text-neutral-900 dark:text-neutral-100`}>
              {formatDate(timeline.endDate)}
            </p>
            {daysRemaining > 0 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {daysRemaining} días restantes
              </p>
            )}
            {daysRemaining < 0 && status !== 'completado' && (
              <p className="text-xs text-error-600 dark:text-error-400">
                {Math.abs(daysRemaining)} días de retraso
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-4">
            <p className={`text-neutral-600 dark:text-neutral-400 ${sizeConfig[size].textSize} line-clamp-2`}>
              {description}
            </p>
          </div>
        )}

        {/* Team and Last Update */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg p-2 -m-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onManageTeam?.(id);
            }}
          >
            <Users className="w-4 h-4 text-neutral-400" />
            {renderTeamAvatars()}
            <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
              {team.length} miembro{team.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center gap-1 text-neutral-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs">
                Actualizado {formatDate(lastUpdate)}
              </span>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <div
        className={`
          relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700
          rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-neutral-900/25 
          transition-all duration-200 cursor-pointer overflow-hidden
          ${sizeConfig[size].padding}
        `}
        onClick={() => onViewDetails?.(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onViewDetails) {
            e.preventDefault();
            onViewDetails(id);
          }
        }}
        aria-label={`Proyecto ${name} - ${currentStatus.label} - ${progress}% completado`}
      >
        {renderContent()}
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default ProjectCard;