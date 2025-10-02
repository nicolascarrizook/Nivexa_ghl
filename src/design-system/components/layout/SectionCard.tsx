/**
 * SectionCard Component for Nivexa CRM
 * 
 * Content section grouping with collapsible functionality, headers, actions, and dividers.
 * Provides consistent content organization within pages.
 */

import React, { useState } from 'react'
import { BaseLayoutProps, PageAction, animationDurations } from './types'

export interface SectionCardProps extends BaseLayoutProps {
  /** Section title */
  title?: string
  
  /** Section subtitle or description */
  subtitle?: string
  
  /** Section icon */
  icon?: React.ReactNode
  
  /** Section actions */
  actions?: PageAction[]
  
  /** Whether the section is collapsible */
  collapsible?: boolean
  
  /** Default collapsed state */
  defaultCollapsed?: boolean
  
  /** Controlled collapsed state */
  collapsed?: boolean
  
  /** Collapse state change handler */
  onCollapsedChange?: (collapsed: boolean) => void
  
  /** Whether to show divider at the bottom */
  showDivider?: boolean
  
  /** Section padding */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  
  /** Section background */
  background?: 'transparent' | 'white' | 'gray'
  
  /** Section border */
  border?: boolean
  
  /** Section rounded corners */
  rounded?: boolean
  
  /** Section shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  
  /** Loading state */
  loading?: boolean
  
  /** Empty state */
  empty?: boolean
  
  /** Empty state message */
  emptyMessage?: string
  
  /** Empty state action */
  emptyAction?: PageAction
  
  /** Help text */
  helpText?: string
  
  /** Badge content */
  badge?: string | number
  
  /** Badge variant */
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  
  /** Header content */
  headerContent?: React.ReactNode
  
  /** Footer content */
  footerContent?: React.ReactNode
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions = [],
  collapsible = false,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  showDivider = false,
  padding = 'lg',
  background = 'white',
  border = true,
  rounded = true,
  shadow = 'sm',
  loading = false,
  empty = false,
  emptyMessage = 'No hay elementos para mostrar',
  emptyAction,
  helpText,
  badge,
  badgeVariant = 'default',
  headerContent,
  footerContent,
  className = '',
  id
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed
  
  const handleToggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed)
    } else {
      setInternalCollapsed(newCollapsed)
    }
  }

  // Style classes
  const backgroundClasses = {
    transparent: 'bg-transparent',
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const badgeVariantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }

  const hasHeader = title || icon || actions.length > 0 || headerContent || badge

  return (
    <div 
      id={id}
      className={`
        ${backgroundClasses[background]}
        ${border ? 'border border-gray-200 dark:border-gray-700' : ''}
        ${rounded ? 'rounded-lg' : ''}
        ${shadowClasses[shadow]}
        ${showDivider ? 'border-b border-gray-200 dark:border-gray-700' : ''}
        ${className}
      `}
    >
      {/* Header */}
      {hasHeader && (
        <div className={`
          ${border && (children || footerContent) ? 'border-b border-gray-200 dark:border-gray-700' : ''}
          ${padding !== 'none' ? paddingClasses[padding] : 'p-6'}
          ${footerContent || children ? 'pb-4' : ''}
        `}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Icon */}
              {icon && (
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-600 dark:text-gray-400">
                  {icon}
                </div>
              )}
              
              {/* Title and Description */}
              <div className="min-w-0 flex-1">
                {title && (
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {title}
                    </h3>
                    {badge && (
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${badgeVariantClasses[badgeVariant]}
                      `}>
                        {badge}
                      </span>
                    )}
                  </div>
                )}
                
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
                
                {helpText && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    {helpText}
                  </p>
                )}
              </div>
            </div>

            {/* Actions and Collapse Button */}
            <div className="flex items-center gap-2 ml-4">
              {/* Section Actions */}
              {actions.map((action) => (
                <SectionActionButton key={action.id} action={action} />
              ))}
              
              {/* Collapse Button */}
              {collapsible && (
                <button
                  onClick={handleToggleCollapsed}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label={isCollapsed ? "Expandir sección" : "Contraer sección"}
                >
                  <svg 
                    className={`w-4 h-4 transform transition-transform duration-${animationDurations.fast} ${isCollapsed ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Custom Header Content */}
          {headerContent && (
            <div className="mt-4">
              {headerContent}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {(!collapsible || !isCollapsed) && (
        <div 
          className={`
            transition-all duration-${animationDurations.normal} ease-in-out
            ${collapsible ? (isCollapsed ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-full') : ''}
          `}
        >
          {loading ? (
            <div className={`${paddingClasses[padding]} flex items-center justify-center py-12`}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
              </div>
            </div>
          ) : empty ? (
            <div className={`${paddingClasses[padding]} text-center py-12`}>
              <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Sin elementos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {emptyMessage}
              </p>
              {emptyAction && (
                <SectionActionButton action={emptyAction} variant="primary" />
              )}
            </div>
          ) : children ? (
            <div className={hasHeader ? (padding !== 'none' ? paddingClasses[padding] : 'p-6') + ' pt-0' : paddingClasses[padding]}>
              {children}
            </div>
          ) : null}
        </div>
      )}

      {/* Footer */}
      {footerContent && (!collapsible || !isCollapsed) && (
        <div className={`
          ${border && (hasHeader || children) ? 'border-t border-gray-200 dark:border-gray-700' : ''}
          ${paddingClasses[padding]}
          ${hasHeader || children ? 'pt-4' : ''}
        `}>
          {footerContent}
        </div>
      )}
    </div>
  )
}

// Section Action Button Component
interface SectionActionButtonProps {
  action: PageAction
  variant?: 'primary' | 'secondary' | 'ghost'
}

const SectionActionButton: React.FC<SectionActionButtonProps> = ({ 
  action, 
  variant = 'ghost' 
}) => {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
  }

  const actionVariant = action.variant === 'danger' ? 'primary' : variant
  const classes = `${baseClasses} ${variantClasses[actionVariant]} ${action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}`

  const content = (
    <>
      {action.loading ? (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
      ) : action.icon ? (
        <span className="w-3 h-3">{action.icon}</span>
      ) : null}
      {action.label}
    </>
  )

  if (action.href) {
    return (
      <a
        href={action.href}
        className={classes}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      className={classes}
    >
      {content}
    </button>
  )
}

export default SectionCard