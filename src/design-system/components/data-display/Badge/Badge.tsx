import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../../lib/utils';

export interface BadgeProps {
  /**
   * Variante visual del badge
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  
  /**
   * Tamaño del badge
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Contenido del badge
   */
  children: React.ReactNode;
  
  /**
   * Si el badge tiene forma de punto (sin texto, solo color)
   */
  dot?: boolean;
  
  /**
   * Si el badge tiene bordes redondeados completos (pill)
   */
  pill?: boolean;
  
  /**
   * Icono opcional a mostrar
   */
  icon?: React.ReactNode;
  
  /**
   * Posición del icono
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * Si el badge es clickeable
   */
  onClick?: () => void;
  
  /**
   * Si el badge está deshabilitado
   */
  disabled?: boolean;
  
  /**
   * Mostrar animación de pulso
   */
  pulse?: boolean;
  
  /**
   * Clases CSS adicionales
   */
  className?: string;
  
  /**
   * Props adicionales para el elemento
   */
  [key: string]: any;
}

const variantConfig = {
  default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
    dot: 'bg-gray-400 dark:bg-gray-500'
  },
  primary: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-700',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/50',
    dot: 'bg-purple-600 dark:bg-purple-400'
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-700',
    hover: 'hover:bg-green-200 dark:hover:bg-green-900/50',
    dot: 'bg-green-600 dark:bg-green-400'
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-700',
    hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
    dot: 'bg-yellow-600 dark:bg-yellow-400'
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-700',
    hover: 'hover:bg-red-200 dark:hover:bg-red-900/50',
    dot: 'bg-red-600 dark:bg-red-400'
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/50',
    dot: 'bg-blue-600 dark:bg-blue-400'
  }
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    height: 'h-5',
    iconSize: 'w-3 h-3',
    dotSize: 'w-2 h-2',
    gap: 'gap-1'
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    height: 'h-6',
    iconSize: 'w-4 h-4',
    dotSize: 'w-2.5 h-2.5',
    gap: 'gap-1.5'
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    height: 'h-7',
    iconSize: 'w-4 h-4',
    dotSize: 'w-3 h-3',
    gap: 'gap-2'
  }
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    variant = 'default',
    size = 'md',
    children,
    dot = false,
    pill = false,
    icon,
    iconPosition = 'left',
    onClick,
    disabled = false,
    pulse = false,
    className,
    ...props
  }, ref) => {
    const variantStyles = variantConfig[variant];
    const sizeStyles = sizeConfig[size];
    
    const isClickable = onClick && !disabled;
    const Component = isClickable ? 'button' : 'span';

    // Si es modo dot, solo mostrar el punto de color
    if (dot) {
      return (
        <motion.span
          ref={ref}
          className={cn(
            'inline-block rounded-full',
            sizeStyles.dotSize,
            variantStyles.dot,
            pulse && 'animate-pulse',
            className
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
      );
    }

    const handleClick = () => {
      if (isClickable) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        <Component
          ref={ref}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          tabIndex={isClickable ? 0 : undefined}
          role={isClickable ? 'button' : undefined}
          className={cn(
            // Base styles
            'inline-flex items-center justify-center font-medium border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            
            // Size styles
            sizeStyles.padding,
            sizeStyles.text,
            sizeStyles.gap,
            
            // Variant styles
            variantStyles.bg,
            variantStyles.text,
            variantStyles.border,
            
            // Shape styles
            pill ? 'rounded-full' : 'rounded-md',
            
            // Interactive styles
            isClickable && [
              'cursor-pointer',
              variantStyles.hover,
              'active:scale-95',
              // Focus ring colors
              variant === 'primary' && 'focus:ring-purple-500',
              variant === 'success' && 'focus:ring-green-500',
              variant === 'warning' && 'focus:ring-yellow-500',
              variant === 'error' && 'focus:ring-red-500',
              variant === 'info' && 'focus:ring-blue-500',
              variant === 'default' && 'focus:ring-gray-500'
            ],
            
            // Disabled styles
            disabled && 'opacity-50 cursor-not-allowed',
            
            // Pulse animation
            pulse && 'animate-pulse',
            
            className
          )}
          {...props}
        >
          {/* Icono izquierdo */}
          {icon && iconPosition === 'left' && (
            <span className={cn('flex-shrink-0', sizeStyles.iconSize)}>
              {icon}
            </span>
          )}
          
          {/* Contenido */}
          <span className="truncate">
            {children}
          </span>
          
          {/* Icono derecho */}
          {icon && iconPosition === 'right' && (
            <span className={cn('flex-shrink-0', sizeStyles.iconSize)}>
              {icon}
            </span>
          )}
        </Component>
      </motion.div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;