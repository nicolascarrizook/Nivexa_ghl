import React from 'react';
import { motion } from 'framer-motion';
import StatCard, { type StatCardProps } from '../StatCard';

export interface MetricGridProps {
  /** Métricas a mostrar */
  metrics: StatCardProps[];
  /** Número de columnas en desktop */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Espaciado entre elementos */
  gap?: 'sm' | 'md' | 'lg';
  /** Layout responsivo automático */
  responsive?: boolean;
  /** Animación de entrada */
  animated?: boolean;
  /** Retraso de animación entre elementos */
  staggerDelay?: number;
  /** Estado de carga para toda la grilla */
  loading?: boolean;
  /** Callback cuando se hace clic en una métrica */
  onMetricClick?: (metric: StatCardProps, index: number) => void;
  className?: string;
}

const MetricGrid: React.FC<MetricGridProps> = ({
  metrics,
  columns = 4,
  gap = 'md',
  responsive = true,
  animated = true,
  staggerDelay = 0.1,
  loading = false,
  onMetricClick,
  className = '',
}) => {
  const getGridClasses = () => {
    const baseClasses = 'grid w-full';
    
    if (!responsive) {
      return `${baseClasses} grid-cols-${columns}`;
    }

    // Clases responsivas basadas en el número de columnas objetivo
    switch (columns) {
      case 1:
        return `${baseClasses} grid-cols-1`;
      case 2:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2`;
      case 3:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
      case 4:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
      case 5:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`;
      case 6:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6`;
      default:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
    }
  };

  const getGapClasses = () => {
    switch (gap) {
      case 'sm':
        return 'gap-3';
      case 'lg':
        return 'gap-8';
      default:
        return 'gap-6';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Función para determinar el tamaño automático basado en el número de métricas
  const getAutoSize = (totalMetrics: number, index: number): StatCardProps['size'] => {
    if (!responsive) return 'md';

    // Si hay pocas métricas, usar tamaños más grandes
    if (totalMetrics <= 2) return 'lg';
    if (totalMetrics <= 4) return 'md';
    return 'sm';
  };

  // Función para determinar variantes automáticas para mejor UX visual
  const getAutoVariant = (index: number): StatCardProps['variant'] => {
    const variants: StatCardProps['variant'][] = ['default', 'success', 'info', 'warning'];
    return variants[index % variants.length];
  };

  if (loading) {
    return (
      <div className={`${getGridClasses()} ${getGapClasses()} ${className}`}>
        {Array.from({ length: columns }).map((_, index) => (
          <StatCard
            key={`loading-${index}`}
            title=""
            value=""
            loading={true}
          />
        ))}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-neutral-500 dark:text-neutral-400">
          No hay métricas disponibles
        </div>
      </div>
    );
  }

  const gridContent = (
    <div className={`${getGridClasses()} ${getGapClasses()}`}>
      {metrics.map((metric, index) => {
        const enhancedMetric: StatCardProps = {
          size: getAutoSize(metrics.length, index),
          ...metric,
          // Solo aplicar variante automática si no se especificó una
          variant: metric.variant || getAutoVariant(index),
          // Agregar onClick si se proporciona el handler
          onClick: onMetricClick ? () => onMetricClick(metric, index) : metric.onClick,
        };

        if (animated) {
          return (
            <motion.div
              key={metric.title || index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <StatCard {...enhancedMetric} />
            </motion.div>
          );
        }

        return (
          <StatCard
            key={metric.title || index}
            {...enhancedMetric}
          />
        );
      })}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {gridContent}
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {gridContent}
    </div>
  );
};

export default MetricGrid;