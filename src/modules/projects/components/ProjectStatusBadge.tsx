import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Pause, 
  XCircle, 
  FileText,
  AlertTriangle 
} from 'lucide-react';
import { clsx } from 'clsx';

type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled' | 'draft';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    icon: Clock,
    color: 'bg-gray-100 text-gray-900 border-gray-300',
    iconColor: 'text-gray-600',
    pulse: false,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-gray-100 text-gray-900 border-gray-300',
    iconColor: 'text-gray-600',
    pulse: false,
  },
  on_hold: {
    label: 'On Hold',
    icon: Pause,
    color: 'bg-gray-100 text-gray-900 border-gray-300',
    iconColor: 'text-gray-600',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-900 border-gray-300',
    iconColor: 'text-gray-600',
    pulse: false,
  },
  draft: {
    label: 'Draft',
    icon: FileText,
    color: 'bg-gray-100 text-gray-900 border-gray-300',
    iconColor: 'text-gray-600',
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