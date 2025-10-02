import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  /** Título principal de la métrica */
  title: string;
  /** Valor principal a mostrar */
  value: string | number;
  /** Variación porcentual */
  change?: {
    value: number;
    period: string;
  };
  /** Tendencia de la métrica */
  trend?: 'up' | 'down' | 'neutral';
  /** Icono de la métrica */
  icon?: LucideIcon;
  /** Descripción adicional */
  description?: string;
  /** Color del tema */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Estado de carga */
  loading?: boolean;
  /** Estado de error */
  error?: boolean;
  /** Datos para sparkline simple */
  sparklineData?: number[];
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Callback cuando se hace clic */
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
  variant = 'default',
  loading = false,
  error = false,
  sparklineData,
  size = 'md',
  onClick,
  className = '',
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-white dark:bg-neutral-900',
      iconBg: 'bg-primary-50 dark:bg-primary-900/20',
      iconColor: 'text-primary-600 dark:text-primary-400',
      border: 'border-neutral-200 dark:border-neutral-700',
    },
    success: {
      bg: 'bg-white dark:bg-neutral-900',
      iconBg: 'bg-success-50 dark:bg-success-900/20',
      iconColor: 'text-success-600 dark:text-success-400',
      border: 'border-success-200 dark:border-success-700',
    },
    warning: {
      bg: 'bg-white dark:bg-neutral-900',
      iconBg: 'bg-warning-50 dark:bg-warning-900/20',
      iconColor: 'text-warning-600 dark:text-warning-400',
      border: 'border-warning-200 dark:border-warning-700',
    },
    error: {
      bg: 'bg-white dark:bg-neutral-900',
      iconBg: 'bg-error-50 dark:bg-error-900/20',
      iconColor: 'text-error-600 dark:text-error-400',
      border: 'border-error-200 dark:border-error-700',
    },
    info: {
      bg: 'bg-white dark:bg-neutral-900',
      iconBg: 'bg-info-50 dark:bg-info-900/20',
      iconColor: 'text-info-600 dark:text-info-400',
      border: 'border-info-200 dark:border-info-700',
    },
  };

  const sizeStyles = {
    sm: {
      padding: 'p-4',
      iconSize: 'w-4 h-4',
      iconContainer: 'w-8 h-8',
      valueText: 'text-xl',
      titleText: 'text-xs',
      changeText: 'text-xs',
    },
    md: {
      padding: 'p-6',
      iconSize: 'w-5 h-5',
      iconContainer: 'w-10 h-10',
      valueText: 'text-2xl',
      titleText: 'text-sm',
      changeText: 'text-sm',
    },
    lg: {
      padding: 'p-8',
      iconSize: 'w-6 h-6',
      iconContainer: 'w-12 h-12',
      valueText: 'text-3xl',
      titleText: 'text-base',
      changeText: 'text-base',
    },
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success-600 dark:text-success-400';
      case 'down':
        return 'text-error-600 dark:text-error-400';
      default:
        return 'text-neutral-500 dark:text-neutral-400';
    }
  };

  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-4">
        <svg width="60" height="20" className="text-neutral-400">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            points={points}
          />
        </svg>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24"></div>
            <div className={`${sizeStyles[size].iconContainer} bg-neutral-200 dark:bg-neutral-700 rounded-lg`}></div>
          </div>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-4">
          <div className="text-error-500 dark:text-error-400 text-sm">
            Error al cargar los datos
          </div>
        </div>
      );
    }

    const TrendIcon = getTrendIcon();

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-medium text-neutral-600 dark:text-neutral-300 ${sizeStyles[size].titleText} uppercase tracking-wide`}>
            {title}
          </h3>
          {Icon && (
            <div className={`${sizeStyles[size].iconContainer} ${variantStyles[variant].iconBg} rounded-lg flex items-center justify-center`}>
              <Icon className={`${sizeStyles[size].iconSize} ${variantStyles[variant].iconColor}`} />
            </div>
          )}
        </div>

        <div className="mb-2">
          <div className={`font-bold text-neutral-900 dark:text-neutral-100 ${sizeStyles[size].valueText}`}>
            {value}
          </div>
        </div>

        {change && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1 ${sizeStyles[size].changeText}`}>
              <TrendIcon className={`w-3 h-3 ${getTrendColor()}`} />
              <span className={getTrendColor()}>
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
            </div>
            <span className={`text-neutral-500 dark:text-neutral-400 ${sizeStyles[size].changeText}`}>
              {change.period}
            </span>
          </div>
        )}

        {description && (
          <p className={`text-neutral-500 dark:text-neutral-400 ${sizeStyles[size].changeText}`}>
            {description}
          </p>
        )}

        {renderSparkline()}
      </>
    );
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={className}
    >
      <div
        className={`
          relative overflow-hidden rounded-xl border transition-all duration-200
          ${variantStyles[variant].bg}
          ${variantStyles[variant].border}
          ${sizeStyles[size].padding}
          ${onClick ? 'cursor-pointer hover:shadow-lg dark:hover:shadow-neutral-900/25' : ''}
        `}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
        aria-label={onClick ? `Ver detalles de ${title}` : undefined}
      >
        {renderContent()}
        
        {/* Hover effect overlay */}
        {onClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 transition-opacity duration-200 hover:opacity-100" />
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;