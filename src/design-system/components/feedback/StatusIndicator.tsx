import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  Circle,
  Loader2,
  Pause,
  Play,
  AlertCircle
} from 'lucide-react';

export interface StatusIndicatorProps {
  /** Variante del estado */
  variant: 'success' | 'error' | 'warning' | 'info' | 'processing' | 'pending' | 'active' | 'inactive';
  /** Texto del label (opcional) */
  label?: string;
  /** Mostrar animación de pulso para estados activos */
  pulse?: boolean;
  /** Tamaño del indicador */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Solo mostrar el indicador sin texto */
  indicatorOnly?: boolean;
  /** Icono personalizado */
  customIcon?: React.ReactNode;
  /** Descripción adicional */
  description?: string;
  /** Callback al hacer clic */
  onClick?: () => void;
  /** Estado deshabilitado */
  disabled?: boolean;
  /** Posición del texto relativo al indicador */
  labelPosition?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  variant,
  label,
  pulse = false,
  size = 'md',
  indicatorOnly = false,
  customIcon,
  description,
  onClick,
  disabled = false,
  labelPosition = 'right',
  className = '',
}) => {
  const sizeStyles = {
    xs: {
      indicator: 'w-2 h-2',
      icon: 'w-2 h-2',
      text: 'text-xs',
      gap: 'gap-1.5',
      padding: onClick ? 'p-1' : '',
    },
    sm: {
      indicator: 'w-3 h-3',
      icon: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-2',
      padding: onClick ? 'p-1.5' : '',
    },
    md: {
      indicator: 'w-4 h-4',
      icon: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-2.5',
      padding: onClick ? 'p-2' : '',
    },
    lg: {
      indicator: 'w-5 h-5',
      icon: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-3',
      padding: onClick ? 'p-2.5' : '',
    },
    xl: {
      indicator: 'w-6 h-6',
      icon: 'w-6 h-6',
      text: 'text-lg',
      gap: 'gap-3',
      padding: onClick ? 'p-3' : '',
    },
  };

  const variantStyles = {
    success: {
      bg: 'bg-success-500 dark:bg-success-600',
      text: 'text-success-700 dark:text-success-300',
      icon: 'text-white',
      border: 'border-success-500 dark:border-success-600',
      hoverBg: 'hover:bg-success-50 dark:hover:bg-success-900/20',
      defaultIcon: CheckCircle,
    },
    error: {
      bg: 'bg-error-500 dark:bg-error-600',
      text: 'text-error-700 dark:text-error-300',
      icon: 'text-white',
      border: 'border-error-500 dark:border-error-600',
      hoverBg: 'hover:bg-error-50 dark:hover:bg-error-900/20',
      defaultIcon: XCircle,
    },
    warning: {
      bg: 'bg-warning-500 dark:bg-warning-600',
      text: 'text-warning-700 dark:text-warning-300',
      icon: 'text-white',
      border: 'border-warning-500 dark:border-warning-600',
      hoverBg: 'hover:bg-warning-50 dark:hover:bg-warning-900/20',
      defaultIcon: AlertTriangle,
    },
    info: {
      bg: 'bg-info-500 dark:bg-info-600',
      text: 'text-info-700 dark:text-info-300',
      icon: 'text-white',
      border: 'border-info-500 dark:border-info-600',
      hoverBg: 'hover:bg-info-50 dark:hover:bg-info-900/20',
      defaultIcon: Info,
    },
    processing: {
      bg: 'bg-primary-500 dark:bg-primary-600',
      text: 'text-primary-700 dark:text-primary-300',
      icon: 'text-white',
      border: 'border-primary-500 dark:border-primary-600',
      hoverBg: 'hover:bg-primary-50 dark:hover:bg-primary-900/20',
      defaultIcon: Loader2,
    },
    pending: {
      bg: 'bg-neutral-400 dark:bg-neutral-500',
      text: 'text-neutral-600 dark:text-neutral-400',
      icon: 'text-white',
      border: 'border-neutral-400 dark:border-neutral-500',
      hoverBg: 'hover:bg-neutral-50 dark:hover:bg-neutral-800',
      defaultIcon: Clock,
    },
    active: {
      bg: 'bg-success-500 dark:bg-success-600',
      text: 'text-success-700 dark:text-success-300',
      icon: 'text-white',
      border: 'border-success-500 dark:border-success-600',
      hoverBg: 'hover:bg-success-50 dark:hover:bg-success-900/20',
      defaultIcon: Play,
    },
    inactive: {
      bg: 'bg-neutral-300 dark:bg-neutral-600',
      text: 'text-neutral-500 dark:text-neutral-400',
      icon: 'text-white',
      border: 'border-neutral-300 dark:border-neutral-600',
      hoverBg: 'hover:bg-neutral-50 dark:hover:bg-neutral-800',
      defaultIcon: Pause,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const getIcon = () => {
    if (customIcon) return customIcon;
    
    const DefaultIcon = currentVariant.defaultIcon;
    
    // Special handling for processing animation
    if (variant === 'processing') {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <DefaultIcon className={currentSize.icon} />
        </motion.div>
      );
    }
    
    return <DefaultIcon className={currentSize.icon} />;
  };

  const getLayoutClasses = () => {
    switch (labelPosition) {
      case 'left':
        return 'flex-row-reverse';
      case 'top':
        return 'flex-col-reverse items-center';
      case 'bottom':
        return 'flex-col items-center';
      default: // right
        return 'flex-row';
    }
  };

  const isVertical = labelPosition === 'top' || labelPosition === 'bottom';

  const indicatorElement = (
    <motion.div
      whileHover={onClick && !disabled ? { scale: 1.1 } : {}}
      whileTap={onClick && !disabled ? { scale: 0.95 } : {}}
      className={`
        relative rounded-full flex items-center justify-center
        ${currentSize.indicator} ${currentVariant.bg}
        ${onClick && !disabled ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-50' : ''}
        transition-all duration-200
      `}
    >
      {/* Icon */}
      <span className={currentVariant.icon}>
        {getIcon()}
      </span>
      
      {/* Pulse Animation */}
      {(pulse || variant === 'processing' || variant === 'active') && !disabled && (
        <motion.div
          className={`absolute inset-0 rounded-full ${currentVariant.bg}`}
          animate={{ 
            scale: [1, 1.5, 1], 
            opacity: [0.7, 0, 0.7] 
          }}
          transition={{ 
            duration: variant === 'processing' ? 1.5 : 2, 
            repeat: Infinity 
          }}
        />
      )}
    </motion.div>
  );

  const textElement = !indicatorOnly && (label || description) && (
    <div className={`
      ${isVertical ? 'text-center' : ''}
      ${disabled ? 'opacity-50' : ''}
    `}>
      {label && (
        <div className={`font-medium ${currentVariant.text} ${currentSize.text}`}>
          {label}
        </div>
      )}
      {description && (
        <div className={`text-neutral-500 dark:text-neutral-400 ${
          size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'
        }`}>
          {description}
        </div>
      )}
    </div>
  );

  if (indicatorOnly) {
    return (
      <div
        className={className}
        onClick={onClick && !disabled ? onClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        onKeyDown={onClick && !disabled ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
        aria-label={label || `Estado: ${variant}`}
      >
        {indicatorElement}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center ${currentSize.gap} ${getLayoutClasses()}
        ${onClick && !disabled ? `cursor-pointer rounded-lg ${currentSize.padding} ${currentVariant.hoverBg} transition-colors` : ''}
        ${className}
      `}
      onClick={onClick && !disabled ? onClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `${label || variant} - Hacer clic para más acciones` : undefined}
    >
      {indicatorElement}
      {textElement}
    </motion.div>
  );
};

export default StatusIndicator;