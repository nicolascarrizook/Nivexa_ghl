import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

export interface AlertProps {
  /**
   * Variante visual del alert
   */
  variant: 'success' | 'error' | 'warning' | 'info';
  
  /**
   * Título del alert
   */
  title?: string;
  
  /**
   * Contenido del alert
   */
  children?: React.ReactNode;
  
  /**
   * Si el alert puede ser cerrado
   */
  dismissible?: boolean;
  
  /**
   * Callback cuando se cierra el alert
   */
  onDismiss?: () => void;
  
  /**
   * Icono personalizado
   */
  icon?: React.ReactNode;
  
  /**
   * Ocultar el icono por defecto
   */
  hideIcon?: boolean;
  
  /**
   * Tamaño del alert
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Clases CSS adicionales
   */
  className?: string;
  
  /**
   * ID para accesibilidad
   */
  id?: string;
  
  /**
   * Rol ARIA
   */
  role?: 'alert' | 'alertdialog' | 'status';
}

const variantConfig = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    titleText: 'text-green-900 dark:text-green-100',
    icon: 'text-green-600 dark:text-green-400',
    defaultIcon: CheckCircle,
    dismissButton: 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    titleText: 'text-red-900 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400',
    defaultIcon: XCircle,
    dismissButton: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    titleText: 'text-yellow-900 dark:text-yellow-100',
    icon: 'text-yellow-600 dark:text-yellow-400',
    defaultIcon: AlertTriangle,
    dismissButton: 'text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-200'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    titleText: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400',
    defaultIcon: Info,
    dismissButton: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200'
  }
};

const sizeConfig = {
  sm: {
    padding: 'p-3',
    gap: 'gap-2',
    titleSize: 'text-sm font-medium',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    dismissSize: 'w-4 h-4',
    dismissPadding: 'p-1'
  },
  md: {
    padding: 'p-4',
    gap: 'gap-3',
    titleSize: 'text-base font-medium',
    textSize: 'text-sm',
    iconSize: 'w-5 h-5',
    dismissSize: 'w-5 h-5',
    dismissPadding: 'p-1.5'
  },
  lg: {
    padding: 'p-5',
    gap: 'gap-4',
    titleSize: 'text-lg font-medium',
    textSize: 'text-base',
    iconSize: 'w-6 h-6',
    dismissSize: 'w-6 h-6',
    dismissPadding: 'p-2'
  }
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    variant,
    title,
    children,
    dismissible = false,
    onDismiss,
    icon,
    hideIcon = false,
    size = 'md',
    className,
    id,
    role = 'alert',
    ...props
  }, ref) => {
    const variantStyles = variantConfig[variant];
    const sizeStyles = sizeConfig[size];

    const handleDismiss = () => {
      onDismiss?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (dismissible && (e.key === 'Escape')) {
        handleDismiss();
      }
    };

    const IconComponent = icon || (hideIcon ? null : variantStyles.defaultIcon);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        role={role}
        id={id}
        onKeyDown={handleKeyDown}
        className={cn(
          'border rounded-lg',
          variantStyles.bg,
          variantStyles.border,
          sizeStyles.padding,
          className
        )}
        {...props}
      >
        <div className={cn('flex', sizeStyles.gap)}>
          {/* Icono */}
          {IconComponent && (
            <div className="flex-shrink-0">
              {React.isValidElement(icon) ? (
                <span className={cn(variantStyles.icon, sizeStyles.iconSize)}>
                  {icon}
                </span>
              ) : (
                <IconComponent className={cn(variantStyles.icon, sizeStyles.iconSize)} />
              )}
            </div>
          )}

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={cn(variantStyles.titleText, sizeStyles.titleSize, 'mb-1')}>
                {title}
              </h3>
            )}
            
            {children && (
              <div className={cn(variantStyles.text, sizeStyles.textSize)}>
                {children}
              </div>
            )}
          </div>

          {/* Botón de cerrar */}
          {dismissible && (
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={handleDismiss}
                className={cn(
                  'rounded-md transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  variantStyles.dismissButton,
                  sizeStyles.dismissPadding,
                  variant === 'success' && 'focus:ring-green-500',
                  variant === 'error' && 'focus:ring-red-500',
                  variant === 'warning' && 'focus:ring-yellow-500',
                  variant === 'info' && 'focus:ring-blue-500'
                )}
                aria-label="Cerrar alerta"
              >
                <X className={sizeStyles.dismissSize} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;