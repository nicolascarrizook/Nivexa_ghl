import React from 'react';
import {
  CheckCircle,
  Clock,
  Pause,
  XCircle,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import { BADGE_VARIANTS, getProjectStatusBadge } from '../constants/design-tokens';

type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled' | 'draft' | 'paused';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  active: {
    label: 'Activo',
    icon: Clock,
    color: BADGE_VARIANTS.projectStatus.active.variant,
    iconColor: 'text-green-700',
    pulse: false,
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle,
    color: BADGE_VARIANTS.projectStatus.completed.variant,
    iconColor: 'text-gray-700',
    pulse: false,
  },
  on_hold: {
    label: 'Pausado',
    icon: Pause,
    color: BADGE_VARIANTS.projectStatus.paused.variant,
    iconColor: 'text-yellow-700',
    pulse: false,
  },
  paused: {
    label: 'Pausado',
    icon: Pause,
    color: BADGE_VARIANTS.projectStatus.paused.variant,
    iconColor: 'text-yellow-700',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    color: BADGE_VARIANTS.projectStatus.cancelled.variant,
    iconColor: 'text-red-700',
    pulse: false,
  },
  draft: {
    label: 'Borrador',
    icon: FileText,
    color: BADGE_VARIANTS.projectStatus.draft.variant,
    iconColor: 'text-gray-700',
    pulse: false,
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'h-5 w-5',
  },
} as const;

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  animated = true,
  className,
}) => {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  const BadgeContent = () => (
    <div
      className={clsx(
        'inline-flex items-center font-medium border transition-all duration-300',
        config.color,
        sizeConfig.container,
        className
      )}
    >
      {showIcon && (
        <Icon 
          className={clsx(
            sizeConfig.icon, 
            config.iconColor, 
            'mr-1.5'
          )} 
        />
      )}
      <span className="font-normal">{config.label}</span>
    </div>
  );

  return <BadgeContent />;
};

// Hook para obtener configuración de estado
export const useProjectStatusConfig = (status: ProjectStatus) => {
  return STATUS_CONFIG[status];
};

// Utilidad para validar estado
export const isValidProjectStatus = (status: string): status is ProjectStatus => {
  return status in STATUS_CONFIG;
};