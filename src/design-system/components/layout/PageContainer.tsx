/**
 * PageContainer Component for Nivexa CRM
 * 
 * Consistent page wrapper with header, actions, tabs support, and loading states.
 * Provides standardized spacing and layout for all CRM pages.
 */

import React, { useState } from 'react'
import { BaseLayoutProps, PageAction, TabItem, LoadingState, animationDurations, BreadcrumbItem } from './types'

export interface PageContainerProps extends BaseLayoutProps {
  /** Page title */
  title: string
  
  /** Page subtitle or description */
  subtitle?: string
  
  /** Icon for the page header */
  icon?: React.ReactNode
  
  /** Breadcrumbs for navigation */
  breadcrumbs?: BreadcrumbItem[]
  
  /** Primary action buttons */
  actions?: PageAction[]
  
  /** Secondary action buttons */
  secondaryActions?: PageAction[]
  
  /** Tabs configuration */
  tabs?: TabItem[]
  
  /** Active tab ID */
  activeTab?: string
  
  /** Tab change handler */
  onTabChange?: (tabId: string) => void
  
  /** Back button configuration */
  backButton?: {
    label?: string
    href?: string
    onClick?: () => void
  }
  
  /** Loading state */
  loadingState?: LoadingState
  
  /** Loading message */
  loadingMessage?: string
  
  /** Error state */
  error?: string
  
  /** Error retry handler */
  onRetry?: () => void
  
  /** Maximum content width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  
  /** Padding configuration */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  
  /** Whether to show divider below header */
  showHeaderDivider?: boolean
  
  /** Header background */
  headerBackground?: 'transparent' | 'white' | 'gray'
  
  /** Whether header should be sticky */
  stickyHeader?: boolean
  
  /** Custom header content */
  headerContent?: React.ReactNode
  
  /** Help text or additional information */
  helpText?: string
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  icon,
  breadcrumbs,
  actions = [],
  secondaryActions = [],
  tabs = [],
  activeTab,
  onTabChange,
  backButton,
  loadingState = 'idle',
  loadingMessage = 'Cargando...',
  error,
  onRetry,
  maxWidth = '7xl',
  padding = 'lg',
  showHeaderDivider = true,
  headerBackground = 'white',
  stickyHeader = false,
  headerContent,
  helpText,
  className = '',
  id
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeTab || (tabs.length > 0 ? tabs[0].id : '')
  )

  const currentActiveTab = activeTab || internalActiveTab

  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    } else {
      setInternalActiveTab(tabId)
    }
  }

  // Content width classes
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  }

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-6 py-6',
    lg: 'px-6 py-8',
    xl: 'px-8 py-10'
  }

  // Header background classes
  const headerBgClasses = {
    transparent: 'bg-transparent',
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800'
  }

  const currentTab = tabs.find(tab => tab.id === currentActiveTab)

  return (
    <div id={id} className={`min-h-full ${className}`}>
      {/* Header */}
      <header 
        className={`
          ${headerBgClasses[headerBackground]}
          ${stickyHeader ? 'sticky top-0 z-30' : ''}
          ${showHeaderDivider ? 'border-b border-gray-200 dark:border-gray-700' : ''}
        `}
      >
        <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`}>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((item, index) => (
                  <li key={item.id} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="w-3 h-3 text-gray-400 mx-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                    {item.href && !item.isActive ? (
                      <a
                        href={item.href}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span
                        className={
                          item.isActive
                            ? 'text-gray-900 dark:text-gray-100 font-medium'
                            : 'text-gray-500 dark:text-gray-400'
                        }
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          
          {/* Back Button */}
          {backButton && (
            <div className="mb-4">
              {backButton.href ? (
                <a
                  href={backButton.href}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {backButton.label || 'Volver'}
                </a>
              ) : (
                <button
                  onClick={backButton.onClick}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {backButton.label || 'Volver'}
                </button>
              )}
            </div>
          )}

          {/* Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="flex-shrink-0 w-8 h-8 text-gray-600 dark:text-gray-400">
                    {icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                  {helpText && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {helpText}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {(actions.length > 0 || secondaryActions.length > 0) && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Secondary Actions */}
                {secondaryActions.map((action) => (
                  <PageActionButton key={action.id} action={action} variant="secondary" />
                ))}
                
                {/* Primary Actions */}
                {actions.map((action) => (
                  <PageActionButton key={action.id} action={action} variant="primary" />
                ))}
              </div>
            )}
          </div>

          {/* Custom Header Content */}
          {headerContent && (
            <div className="mt-6">
              {headerContent}
            </div>
          )}

          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="mt-6">
              <nav className="flex space-x-8 overflow-x-auto" aria-label="Pestañas">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && handleTabChange(tab.id)}
                    disabled={tab.disabled}
                    className={`
                      whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                      ${tab.id === currentActiveTab
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                      }
                      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${tab.id === currentActiveTab
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }
                        `}>
                          {tab.badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
        {loadingState === 'loading' ? (
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
          <div className={paddingClasses[padding]}>
            {/* Tab Content */}
            {tabs.length > 0 && currentTab ? (
              <div className={`transition-opacity duration-${animationDurations.fast}`}>
                {currentTab.content || children}
              </div>
            ) : (
              children
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Page Action Button Component
interface PageActionButtonProps {
  action: PageAction
  variant: 'primary' | 'secondary'
}

const PageActionButton: React.FC<PageActionButtonProps> = ({ action, variant }) => {
  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    },
    secondary: {
      primary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
      secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
      ghost: 'text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700',
      danger: 'border border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-500 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20'
    }
  }

  const actionVariant = action.variant || 'primary'
  const classes = `${baseClasses} ${variantClasses[variant][actionVariant]}`

  const content = (
    <>
      {action.loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : action.icon ? (
        <span className="w-4 h-4">{action.icon}</span>
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

export default PageContainer