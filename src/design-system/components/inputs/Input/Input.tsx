import React, { useState, useRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Etiqueta del input
   */
  label?: string;
  
  /**
   * Texto de ayuda que aparece debajo del input
   */
  helperText?: string;
  
  /**
   * Mensaje de error
   */
  error?: string;
  
  /**
   * Mensaje de éxito
   */
  success?: string;
  
  /**
   * Icono a mostrar en el lado izquierdo
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icono a mostrar en el lado derecho
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Tamaño del input
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Si el input ocupa todo el ancho disponible
   */
  fullWidth?: boolean;
  
  /**
   * Estado de carga
   */
  loading?: boolean;
  
  /**
   * Función callback cuando se presiona Enter
   */
  onEnter?: () => void;
  
  /**
   * Función callback cuando el input pierde el foco
   */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Función callback cuando el input gana el foco
   */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const sizeConfig = {
  sm: {
    input: 'px-3 py-2 text-sm min-h-[36px]',
    label: 'text-sm',
    helper: 'text-xs',
    iconSize: 'w-4 h-4',
    leftPadding: 'pl-9',
    rightPadding: 'pr-9'
  },
  md: {
    input: 'px-4 py-2.5 text-base min-h-[42px]',
    label: 'text-sm',
    helper: 'text-sm',
    iconSize: 'w-5 h-5',
    leftPadding: 'pl-11',
    rightPadding: 'pr-11'
  },
  lg: {
    input: 'px-4 py-3 text-lg min-h-[48px]',
    label: 'text-base',
    helper: 'text-base',
    iconSize: 'w-6 h-6',
    leftPadding: 'pl-12',
    rightPadding: 'pr-12'
  }
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    size = 'md',
    fullWidth = false,
    loading = false,
    onEnter,
    onBlur,
    onFocus,
    type = 'text',
    className,
    disabled,
    required,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Forward ref to both external ref and internal ref
    useImperativeHandle(ref, () => inputRef.current!, []);
    
    const sizeStyles = sizeConfig[size];
    const isPasswordType = type === 'password';
    const actualType = isPasswordType && showPassword ? 'text' : type;
    
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;
    const hasHelperText = Boolean(helperText) && !hasError && !hasSuccess;
    
    // Determine state styles
    const getStateStyles = () => {
      if (hasError) {
        return {
          border: 'border-red-500 dark:border-red-400',
          ring: 'focus:ring-red-500 dark:focus:ring-red-400',
          icon: 'text-red-500 dark:text-red-400'
        };
      }
      
      if (hasSuccess) {
        return {
          border: 'border-green-500 dark:border-green-400',
          ring: 'focus:ring-green-500 dark:focus:ring-green-400',
          icon: 'text-green-500 dark:text-green-400'
        };
      }
      
      return {
        border: 'border-gray-300 dark:border-gray-600',
        ring: 'focus:ring-purple-500 dark:focus:ring-purple-400',
        icon: 'text-gray-400 dark:text-gray-500'
      };
    };
    
    const stateStyles = getStateStyles();
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnter) {
        onEnter();
      }
      props.onKeyDown?.(e);
    };
    
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    // Determine right side content (icons, loading, password toggle)
    const getRightContent = () => {
      const elements = [];
      
      // Loading spinner
      if (loading) {
        elements.push(
          <div key="loading" className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-purple-500" />
        );
      }
      
      // Success/Error icons (only if not loading)
      if (!loading && (hasError || hasSuccess)) {
        elements.push(
          <div key="status" className={stateStyles.icon}>
            {hasError && <AlertCircle className={sizeStyles.iconSize} />}
            {hasSuccess && <CheckCircle className={sizeStyles.iconSize} />}
          </div>
        );
      }
      
      // Password toggle (only if not loading and no status icons)
      if (!loading && isPasswordType && !hasError && !hasSuccess) {
        elements.push(
          <button
            key="password-toggle"
            type="button"
            onClick={togglePasswordVisibility}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className={sizeStyles.iconSize} />
            ) : (
              <Eye className={sizeStyles.iconSize} />
            )}
          </button>
        );
      }
      
      // Custom right icon (only if no other right content)
      if (!loading && !hasError && !hasSuccess && !isPasswordType && rightIcon) {
        elements.push(
          <div key="right-icon" className={stateStyles.icon}>
            {React.isValidElement(rightIcon) ? 
              React.cloneElement(rightIcon, { className: sizeStyles.iconSize }) : 
              rightIcon
            }
          </div>
        );
      }
      
      return elements;
    };
    
    const rightContent = getRightContent();
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightContent = rightContent.length > 0;
    
    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto', className)}>
        {/* Label */}
        {label && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              'block font-medium mb-2 transition-colors',
              'text-gray-700 dark:text-gray-300',
              disabled && 'text-gray-400 dark:text-gray-600',
              sizeStyles.label
            )}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
              stateStyles.icon
            )}>
              {React.isValidElement(leftIcon) ? 
                React.cloneElement(leftIcon, { className: sizeStyles.iconSize }) : 
                leftIcon
              }
            </div>
          )}
          
          {/* Input */}
          <motion.input
            ref={inputRef}
            id={inputId}
            type={actualType}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              hasSuccess && errorId,
              hasHelperText && helperId
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white dark:bg-gray-900 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              
              // Size styles
              sizeStyles.input,
              
              // Icon padding
              hasLeftIcon && sizeStyles.leftPadding,
              hasRightContent && sizeStyles.rightPadding,
              
              // State styles
              stateStyles.border,
              stateStyles.ring,
              
              // Disabled styles
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800',
              
              // Focus styles
              focused && 'ring-2'
            )}
            {...props}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Right Content */}
          {hasRightContent && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'
            )}>
              {rightContent}
            </div>
          )}
        </div>
        
        {/* Helper Text / Error / Success */}
        {(hasHelperText || hasError || hasSuccess) && (
          <motion.div
            id={hasHelperText ? helperId : errorId}
            className={cn(
              'mt-2',
              sizeStyles.helper,
              hasError && 'text-red-600 dark:text-red-400',
              hasSuccess && 'text-green-600 dark:text-green-400',
              hasHelperText && 'text-gray-600 dark:text-gray-400'
            )}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error || success || helperText}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;