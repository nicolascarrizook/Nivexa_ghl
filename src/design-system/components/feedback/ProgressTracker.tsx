import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Circle, 
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export interface ProgressStep {
  /** Identificador único del paso */
  id: string;
  /** Título del paso */
  title: string;
  /** Descripción opcional del paso */
  description?: string;
  /** Estado del paso */
  status: 'pending' | 'current' | 'completed' | 'error' | 'skipped';
  /** Icono personalizado para el paso */
  icon?: React.ReactNode;
  /** Si el paso es opcional */
  optional?: boolean;
  /** Datos adicionales del paso */
  data?: {
    timeEstimate?: string;
    lastUpdated?: string;
    errorMessage?: string;
  };
}

export interface ProgressTrackerProps {
  /** Lista de pasos del progreso */
  steps: ProgressStep[];
  /** Orientación del tracker */
  orientation?: 'horizontal' | 'vertical';
  /** Permitir navegación clickeable a pasos completados */
  allowNavigation?: boolean;
  /** Callback cuando se hace clic en un paso */
  onStepClick?: (stepId: string) => void;
  /** Mostrar información adicional */
  showDetails?: boolean;
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'detailed';
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar progreso global */
  showProgress?: boolean;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  orientation = 'horizontal',
  allowNavigation = false,
  onStepClick,
  showDetails = true,
  variant = 'default',
  size = 'md',
  showProgress = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: {
      stepSize: 'w-6 h-6',
      iconSize: 'w-3 h-3',
      titleText: 'text-xs',
      descText: 'text-xs',
      spacing: orientation === 'horizontal' ? 'gap-4' : 'gap-3',
      lineThickness: 'h-0.5',
    },
    md: {
      stepSize: 'w-8 h-8',
      iconSize: 'w-4 h-4',
      titleText: 'text-sm',
      descText: 'text-xs',
      spacing: orientation === 'horizontal' ? 'gap-6' : 'gap-4',
      lineThickness: 'h-0.5',
    },
    lg: {
      stepSize: 'w-10 h-10',
      iconSize: 'w-5 h-5',
      titleText: 'text-base',
      descText: 'text-sm',
      spacing: orientation === 'horizontal' ? 'gap-8' : 'gap-6',
      lineThickness: 'h-1',
    },
  };

  const currentSize = sizeStyles[size];

  const getStepStyles = (status: ProgressStep['status']) => {
    const styles = {
      pending: {
        circle: 'bg-neutral-200 dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600',
        icon: 'text-neutral-400 dark:text-neutral-500',
        title: 'text-neutral-600 dark:text-neutral-400',
        description: 'text-neutral-500 dark:text-neutral-500',
        line: 'bg-neutral-200 dark:bg-neutral-700',
      },
      current: {
        circle: 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500 dark:border-primary-400',
        icon: 'text-primary-600 dark:text-primary-400',
        title: 'text-primary-900 dark:text-primary-100 font-semibold',
        description: 'text-primary-700 dark:text-primary-300',
        line: 'bg-neutral-200 dark:bg-neutral-700',
      },
      completed: {
        circle: 'bg-success-500 dark:bg-success-600 border-2 border-success-500 dark:border-success-600',
        icon: 'text-white',
        title: 'text-success-900 dark:text-success-100 font-medium',
        description: 'text-success-700 dark:text-success-300',
        line: 'bg-success-500 dark:bg-success-600',
      },
      error: {
        circle: 'bg-error-100 dark:bg-error-900 border-2 border-error-500 dark:border-error-400',
        icon: 'text-error-600 dark:text-error-400',
        title: 'text-error-900 dark:text-error-100 font-medium',
        description: 'text-error-700 dark:text-error-300',
        line: 'bg-neutral-200 dark:bg-neutral-700',
      },
      skipped: {
        circle: 'bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 border-dashed',
        icon: 'text-neutral-400 dark:text-neutral-500',
        title: 'text-neutral-500 dark:text-neutral-400 line-through',
        description: 'text-neutral-400 dark:text-neutral-500 line-through',
        line: 'bg-neutral-200 dark:bg-neutral-700',
      },
    };
    return styles[status];
  };

  const getStepIcon = (step: ProgressStep) => {
    if (step.icon) return step.icon;

    switch (step.status) {
      case 'completed':
        return <Check className={currentSize.iconSize} />;
      case 'current':
        return <Clock className={currentSize.iconSize} />;
      case 'error':
        return <AlertCircle className={currentSize.iconSize} />;
      default:
        return <Circle className={currentSize.iconSize} />;
    }
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const isClickable = (step: ProgressStep) => {
    return allowNavigation && onStepClick && 
           (step.status === 'completed' || step.status === 'current');
  };

  const renderStep = (step: ProgressStep, index: number) => {
    const stepStyles = getStepStyles(step.status);
    const clickable = isClickable(step);
    const isLast = index === steps.length - 1;

    const stepContent = (
      <div className={`
        flex items-center relative group
        ${orientation === 'horizontal' ? 'flex-col text-center' : 'flex-row'}
        ${clickable ? 'cursor-pointer' : ''}
      `}>
        {/* Step Circle */}
        <motion.div
          whileHover={clickable ? { scale: 1.1 } : {}}
          whileTap={clickable ? { scale: 0.95 } : {}}
          className={`
            ${currentSize.stepSize} rounded-full flex items-center justify-center
            ${stepStyles.circle} transition-all duration-200 relative z-10
            ${clickable ? 'hover:shadow-lg' : ''}
          `}
          onClick={clickable ? () => onStepClick(step.id) : undefined}
        >
          <span className={stepStyles.icon}>
            {getStepIcon(step)}
          </span>
          
          {/* Pulse animation for current step */}
          {step.status === 'current' && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary-500 dark:bg-primary-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Step Content */}
        <div className={`
          ${orientation === 'horizontal' ? 'mt-2' : 'ml-4 flex-1'}
          ${variant === 'minimal' ? 'hidden' : ''}
        `}>
          <div className={`${currentSize.titleText} ${stepStyles.title} transition-colors`}>
            {step.title}
            {step.optional && (
              <span className="ml-1 text-neutral-400 dark:text-neutral-500 font-normal">
                (opcional)
              </span>
            )}
          </div>
          
          {showDetails && step.description && (
            <div className={`${currentSize.descText} ${stepStyles.description} mt-1 transition-colors`}>
              {step.description}
            </div>
          )}

          {/* Additional Data */}
          {showDetails && variant === 'detailed' && step.data && (
            <div className="mt-2 space-y-1">
              {step.data.timeEstimate && (
                <div className={`${currentSize.descText} text-neutral-500 dark:text-neutral-400`}>
                  Tiempo estimado: {step.data.timeEstimate}
                </div>
              )}
              {step.data.lastUpdated && step.status === 'completed' && (
                <div className={`${currentSize.descText} text-success-600 dark:text-success-400`}>
                  Completado: {step.data.lastUpdated}
                </div>
              )}
              {step.data.errorMessage && step.status === 'error' && (
                <div className={`${currentSize.descText} text-error-600 dark:text-error-400`}>
                  Error: {step.data.errorMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connection Line */}
        {!isLast && (
          <div className={`
            ${orientation === 'horizontal' 
              ? `absolute top-1/2 -translate-y-1/2 left-full w-full ${currentSize.lineThickness}` 
              : `absolute left-1/2 -translate-x-1/2 top-full h-full w-0.5`
            }
            ${stepStyles.line} transition-colors duration-500
            ${orientation === 'horizontal' ? 'z-0' : 'z-0'}
          `}
          />
        )}
      </div>
    );

    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`
          relative
          ${orientation === 'horizontal' ? 'flex-1' : 'w-full'}
        `}
      >
        {stepContent}
      </motion.div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Global Progress Bar */}
      {showProgress && orientation === 'horizontal' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Progreso general
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {Math.round(calculateProgress())}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <motion.div
              className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps Container */}
      <div className={`
        ${orientation === 'horizontal' 
          ? `flex items-start ${currentSize.spacing}` 
          : `space-y-4`
        }
      `}>
        {steps.map((step, index) => renderStep(step, index))}
      </div>

      {/* Navigation Hint */}
      {allowNavigation && onStepClick && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 text-center"
        >
          Haz clic en los pasos completados para navegar
        </motion.div>
      )}
    </div>
  );
};

export default ProgressTracker;