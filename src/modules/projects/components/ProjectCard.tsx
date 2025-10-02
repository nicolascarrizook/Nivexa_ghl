import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Home, 
  Paintbrush, 
  Hammer,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  MoreVertical,
  User
} from 'lucide-react';
import { clsx } from 'clsx';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProgressIndicator } from './ProgressIndicator';
import { formatCurrency } from '@/utils/formatters';

interface ProjectCardProps {
  project: {
    id: string;
    projectName: string;
    client_name: string;
    status: 'active' | 'completed' | 'on_hold' | 'cancelled' | 'draft';
    projectType: string;
    totalAmount: number;
    total_collected?: number;
    progress?: number;
    next_payment_date?: string;
    next_payment_amount?: number;
    installmentCount?: number;
    location?: string;
    start_date?: string;
    estimated_end_date?: string;
  };
  onClick?: (projectId: string) => void;
  onActionClick?: (action: string, projectId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  className?: string;
}

const PROJECT_TYPE_CONFIG = {
  construction: {
    label: 'Construcción',
    icon: Building2,
    gradient: 'from-gray-700 to-gray-800',
    bg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  renovation: {
    label: 'Renovación',
    icon: Hammer,
    gradient: 'from-gray-700 to-gray-800',
    bg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  design: {
    label: 'Diseño',
    icon: Paintbrush,
    gradient: 'from-gray-700 to-gray-800',
    bg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  residential: {
    label: 'Residencial',
    icon: Home,
    gradient: 'from-gray-700 to-gray-800',
    bg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
} as const;

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onActionClick,
  variant = 'default',
  showActions = true,
  className,
}) => {
  const typeConfig = PROJECT_TYPE_CONFIG[project.projectType as keyof typeof PROJECT_TYPE_CONFIG] || PROJECT_TYPE_CONFIG.construction;
  const TypeIcon = typeConfig.icon;
  
  const progressPercentage = project.progress || 0;
  const collectionPercentage = project.totalAmount > 0 
    ? ((project.total_collected || 0) / project.totalAmount) * 100 
    : 0;

  const handleCardClick = () => {
    onClick?.(project.id);
  };

  const handleActionClick = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick?.(action, project.id);
  };

  const CompactCard = () => (
    <motion.div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 p-4 cursor-pointer',
        'transition-all duration-200',
        'hover:border-gray-300',
        'group relative',
        className
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            'p-2.5 rounded-lg',
            typeConfig.bg
          )}>
            <TypeIcon className={clsx('h-5 w-5', typeConfig.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {project.projectName}
            </h3>
            <p className="text-xs text-gray-500 flex items-center mt-0.5">
              <User className="h-3 w-3 mr-1" />
              {project.client_name}
            </p>
          </div>
        </div>
        <ProjectStatusBadge status={project.status} size="sm" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(project.totalAmount)}
          </p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-600">
            {progressPercentage}%
          </p>
          <p className="text-xs text-gray-500">Progreso</p>
        </div>
      </div>
    </motion.div>
  );

  const DefaultCard = () => (
    <motion.div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 overflow-hidden',
        'transition-all duration-300',
        'hover:border-gray-300',
        'group relative cursor-pointer',
        className
      )}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      {/* Header with Gradient */}
      <div className={clsx(
        'bg-gradient-to-r p-4 text-white relative overflow-hidden',
        typeConfig.gradient
      )}>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TypeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {project.projectName}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {typeConfig.label}
              </p>
            </div>
          </div>
          
          {showActions && (
            <button
              onClick={(e) => handleActionClick('menu', e)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-6 w-16 h-16 bg-white/10 rounded-full blur-lg" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Client Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{project.client_name}</span>
          </div>
          <ProjectStatusBadge status={project.status} size="sm" />
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Valor Total</span>
            <span className="font-bold text-lg text-gray-900">
              {formatCurrency(project.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Recaudado</span>
            <span className="font-semibold text-gray-600">
              {formatCurrency(project.total_collected || 0)}
            </span>
          </div>
          
          {/* Collection Progress */}
          <ProgressIndicator
            progress={collectionPercentage}
            size="sm"
            variant="success"
            showLabel={false}
            animated={false}
            className="mt-2"
          />
        </div>

        {/* Project Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progreso</span>
            <span className="text-sm font-semibold text-gray-600">
              {progressPercentage}%
            </span>
          </div>
          <ProgressIndicator
            progress={progressPercentage}
            size="sm"
            showLabel={false}
            animated={false}
          />
        </div>

        {/* Next Payment */}
        {project.next_payment_date && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Próximo Pago
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(project.next_payment_amount || 0)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(project.next_payment_date).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {project.installmentCount ? `${project.installmentCount} cuotas` : 'Pago único'}
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleActionClick('view', e)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleActionClick('finance', e)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <DollarSign className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleActionClick('progress', e)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-600/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );

  const DetailedCard = () => (
    <motion.div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 overflow-hidden',
        'transition-all duration-300',
        'hover:border-gray-300',
        'group relative cursor-pointer',
        className
      )}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      <DefaultCard />
      
      {/* Additional detailed content would go here */}
      {project.location && (
        <div className="px-5 pb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{project.location}</span>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Render based on variant
  switch (variant) {
    case 'compact':
      return <CompactCard />;
    case 'detailed':
      return <DetailedCard />;
    default:
      return <DefaultCard />;
  }
};

// Export sub-components for flexibility
export { ProjectStatusBadge, ProgressIndicator };