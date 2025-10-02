import React from 'react'
import { cn } from '../../../lib/utils'
import Spinner from '../feedback/Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button visual variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg' | 'icon'
  
  /**
   * Disabled state
   */
  disabled?: boolean
  
  /**
   * Loading state - shows spinner and disables interaction
   */
  loading?: boolean
  
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode
  
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode
  
  /**
   * Whether button should take full width of container
   */
  fullWidth?: boolean
  
  /**
   * Button content
   */
  children?: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
}

const variantClasses = {
  primary: [
    // Light mode
    'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
    'text-white',
    'border border-purple-600 hover:border-purple-700 active:border-purple-800',
    'shadow-sm hover:shadow-md',
    'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    // Dark mode
    'dark:bg-purple-500 dark:hover:bg-purple-600 dark:active:bg-purple-700',
    'dark:border-purple-500 dark:hover:border-purple-600 dark:active:border-purple-700',
    'dark:focus:ring-purple-400 dark:focus:ring-offset-gray-900'
  ].join(' '),
  
  secondary: [
    // Light mode
    'bg-gray-100 hover:bg-gray-200 active:bg-gray-300',
    'text-gray-900',
    'border border-gray-300 hover:border-gray-400 active:border-gray-500',
    'shadow-sm hover:shadow-md',
    'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    // Dark mode
    'dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600',
    'dark:text-gray-100',
    'dark:border-gray-600 dark:hover:border-gray-500 dark:active:border-gray-400',
    'dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900'
  ].join(' '),
  
  outline: [
    // Light mode
    'bg-transparent hover:bg-gray-50 active:bg-gray-100',
    'text-gray-700 hover:text-gray-900',
    'border border-gray-300 hover:border-gray-400 active:border-gray-500',
    'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    // Dark mode
    'dark:hover:bg-gray-800 dark:active:bg-gray-700',
    'dark:text-gray-300 dark:hover:text-gray-100',
    'dark:border-gray-600 dark:hover:border-gray-500 dark:active:border-gray-400',
    'dark:focus:ring-purple-400 dark:focus:ring-offset-gray-900'
  ].join(' '),
  
  ghost: [
    // Light mode
    'bg-transparent hover:bg-gray-100 active:bg-gray-200',
    'text-gray-600 hover:text-gray-900',
    'border border-transparent',
    'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    // Dark mode
    'dark:hover:bg-gray-800 dark:active:bg-gray-700',
    'dark:text-gray-400 dark:hover:text-gray-100',
    'dark:focus:ring-purple-400 dark:focus:ring-offset-gray-900'
  ].join(' '),
  
  destructive: [
    // Light mode
    'bg-red-600 hover:bg-red-700 active:bg-red-800',
    'text-white',
    'border border-red-600 hover:border-red-700 active:border-red-800',
    'shadow-sm hover:shadow-md',
    'focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    // Dark mode
    'dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700',
    'dark:border-red-500 dark:hover:border-red-600 dark:active:border-red-700',
    'dark:focus:ring-red-400 dark:focus:ring-offset-gray-900'
  ].join(' '),
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-md min-h-[32px]',
  md: 'px-4 py-2 text-sm font-medium rounded-lg min-h-[40px]',
  lg: 'px-6 py-3 text-base font-medium rounded-lg min-h-[48px]',
  icon: 'p-2 rounded-lg min-h-[40px] min-w-[40px]',
}

const disabledClasses = [
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'disabled:hover:bg-current disabled:active:bg-current',
  'disabled:hover:border-current disabled:active:border-current',
  'disabled:hover:text-current disabled:active:text-current',
  'disabled:shadow-none'
].join(' ')

const baseClasses = [
  'inline-flex items-center justify-center',
  'font-medium transition-all duration-200',
  'focus:outline-none focus:ring-offset-2',
  'select-none',
  disabledClasses
].join(' ')

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className,
    type = 'button',
    ...props
  }, ref) => {
    // Determine if we should show content (for accessibility)
    const hasContent = children !== undefined && children !== null
    const isIconOnly = size === 'icon' && !hasContent
    
    // Loading state overrides disabled
    const isDisabled = disabled || loading
    
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <Spinner 
            size="sm" 
            color={variant === 'primary' || variant === 'destructive' ? 'white' : 'primary'} 
            className={hasContent ? 'mr-2' : ''} 
          />
        ) : leftIcon ? (
          <span className={cn('flex-shrink-0', hasContent && 'mr-2', isIconOnly && 'w-4 h-4')}>
            {leftIcon}
          </span>
        ) : null}
        
        {/* Button content */}
        {hasContent && (
          <span className={loading ? 'opacity-70' : ''}>
            {children}
          </span>
        )}
        
        {/* Right icon (only if not loading) */}
        {!loading && rightIcon && (
          <span className={cn('flex-shrink-0', hasContent && 'ml-2', isIconOnly && 'w-4 h-4')}>
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button