/**
 * DetailPanel Component for Nivexa CRM
 * 
 * Slide-over detail panel that appears from the right side of the screen.
 * Responsive design that becomes full screen on mobile devices.
 * Perfect for showing detailed information, forms, or secondary content.
 */

import React, { useEffect } from 'react'
import { BaseLayoutProps, PageAction, animationDurations, zIndexLayers } from './types'

export interface DetailPanelProps extends BaseLayoutProps {
  /** Whether the panel is open */
  open: boolean
  
  /** Close handler */
  onClose: () => void
  
  /** Panel title */
  title?: string
  
  /** Panel subtitle or description */
  subtitle?: string
  
  /** Panel icon */
  icon?: React.ReactNode
  
  /** Header actions */
  actions?: PageAction[]
  
  /** Secondary actions */
  secondaryActions?: PageAction[]
  
  /** Panel size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  /** Custom width (overrides size) */
  width?: string
  
  /** Whether panel should be closable */
  closable?: boolean
  
  /** Whether clicking backdrop closes panel */
  closeOnBackdropClick?: boolean
  
  /** Whether pressing ESC closes panel */
  closeOnEscape?: boolean
  
  /** Loading state */
  loading?: boolean
  
  /** Loading message */
  loadingMessage?: string
  
  /** Error state */
  error?: string
  
  /** Error retry handler */
  onRetry?: () => void
  
  /** Footer content */
  footer?: React.ReactNode
  
  /** Whether footer should stick to bottom */
  stickyFooter?: boolean
  
  /** Custom header content */
  headerContent?: React.ReactNode
  
  /** Panel padding */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  
  /** Show divider below header */
  showHeaderDivider?: boolean
  
  /** Show divider above footer */
  showFooterDivider?: boolean
  
  /** Panel background */
  background?: 'white' | 'gray'
  
  /** Animation direction */
  direction?: 'right' | 'left'
  
  /** Focus trap (for accessibility) */
  trapFocus?: boolean
  
  /** Initial focus element selector */
  initialFocus?: string
  
  /** Restore focus on close */
  restoreFocus?: boolean
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  children,
  open,
  onClose,
  title,
  subtitle,
  icon,
  actions = [],
  secondaryActions = [],
  size = 'lg',
  width,
  closable = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  loading = false,
  loadingMessage = 'Cargando...',
  error,
  onRetry,
  footer,
  stickyFooter = false,
  headerContent,
  padding = 'lg',
  showHeaderDivider = true,
  showFooterDivider = true,
  background = 'white',
  direction = 'right',
  trapFocus = true,
  initialFocus,
  restoreFocus = true,
  className = '',
  id
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-none w-full'
  }

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8'
  }

  // Background classes
  const backgroundClasses = {
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800'
  }

  // Transform classes based on direction
  const transformClasses = {
    right: open ? 'translate-x-0' : 'translate-x-full',
    left: open ? 'translate-x-0' : '-translate-x-full'
  }

  // Handle ESC key
  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])

  // Handle body scroll lock
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [open])

  // Focus management
  useEffect(() => {
    if (!open || !trapFocus) return

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const panel = document.getElementById(id || 'detail-panel')
    
    if (!panel) return

    const firstFocusableElement = panel.querySelector(focusableElements) as HTMLElement
    const focusableContent = panel.querySelectorAll(focusableElements)
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus()
          e.preventDefault()
        }
      }
    }

    // Set initial focus
    if (initialFocus) {
      const initialElement = panel.querySelector(initialFocus) as HTMLElement
      initialElement?.focus()
    } else {
      firstFocusableElement?.focus()
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [open, trapFocus, initialFocus, id])

  if (!open) return null

  const hasHeader = title || icon || actions.length > 0 || secondaryActions.length > 0 || headerContent
  const hasFooter = footer

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        style={{ zIndex: zIndexLayers.backdrop }}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div 
        className="fixed inset-0 overflow-hidden"
        style={{ zIndex: zIndexLayers.modal }}
        aria-labelledby={title ? `${id || 'detail-panel'}-title` : undefined}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className={`pointer-events-none fixed inset-y-0 ${direction === 'right' ? 'right-0' : 'left-0'} flex ${size === 'full' ? 'w-full' : sizeClasses[size]}`}>
            <div 
              id={id || 'detail-panel'}
              className={`
                pointer-events-auto relative flex h-full flex-col overflow-y-auto
                ${backgroundClasses[background]}
                ${width ? '' : 'w-full'}
                shadow-xl
                transform transition-transform duration-${animationDurations.normal} ease-in-out
                ${transformClasses[direction]}
                ${className}
              `}
              style={width ? { width } : undefined}
            >
              {/* Header */}
              {hasHeader && (
                <div className={`
                  ${showHeaderDivider ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                  ${paddingClasses[padding]}
                  ${hasFooter && stickyFooter ? 'flex-shrink-0' : ''}
                `}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Icon */}
                      {icon && (
                        <div className="flex-shrink-0 w-6 h-6 mt-0.5 text-gray-600 dark:text-gray-400">
                          {icon}
                        </div>
                      )}
                      
                      {/* Title and Subtitle */}
                      <div className="min-w-0 flex-1">
                        {title && (
                          <h2 
                            id={`${id || 'detail-panel'}-title`}
                            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                          >
                            {title}
                          </h2>
                        )}
                        {subtitle && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions and Close Button */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Secondary Actions */}
                      {secondaryActions.map((action) => (
                        <DetailPanelActionButton key={action.id} action={action} variant="secondary" />
                      ))}
                      
                      {/* Primary Actions */}
                      {actions.map((action) => (
                        <DetailPanelActionButton key={action.id} action={action} variant="primary" />
                      ))}
                      
                      {/* Close Button */}
                      {closable && (
                        <button
                          onClick={onClose}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          aria-label="Cerrar panel"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              <div className={`flex-1 ${hasFooter && stickyFooter ? 'overflow-y-auto' : ''}`}>
                {loading ? (
                  <div className={`${paddingClasses[padding]} flex items-center justify-center py-20`}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">{loadingMessage}</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className={`${paddingClasses[padding]} flex items-center justify-center py-20`}>
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 text-red-500 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Ha ocurrido un error
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                      {onRetry && (
                        <button
                          onClick={onRetry}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reintentar
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={hasHeader ? (paddingClasses[padding] === '' ? 'p-6' : paddingClasses[padding]) + ' pt-0' : paddingClasses[padding]}>
                    {children}
                  </div>
                )}
              </div>

              {/* Footer */}
              {hasFooter && (
                <div className={`
                  ${showFooterDivider ? 'border-t border-gray-200 dark:border-gray-700' : ''}
                  ${paddingClasses[padding]}
                  ${stickyFooter ? 'flex-shrink-0' : ''}
                `}>
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Detail Panel Action Button Component
interface DetailPanelActionButtonProps {
  action: PageAction
  variant: 'primary' | 'secondary'
}

const DetailPanelActionButton: React.FC<DetailPanelActionButtonProps> = ({ action, variant }) => {
  const baseClasses = "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    },
    secondary: {
      primary: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
      secondary: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
      danger: 'text-red-600 hover:text-red-800 hover:bg-red-50 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-900/20'
    }
  }

  const actionVariant = action.variant || 'primary'
  const classes = `${baseClasses} ${variantClasses[variant][actionVariant]}`

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

export default DetailPanel