/**
 * QuickActions Component for Nivexa CRM
 * 
 * Floating action toolbar positioned at bottom-right with contextual actions.
 * Includes FAB style with expandable menu, keyboard shortcuts, and responsive behavior.
 */

import React, { useState, useEffect, useRef } from 'react'
import { QuickAction, animationDurations, zIndexLayers } from './types'

export interface QuickActionsProps {
  /** Quick actions array */
  actions: QuickAction[]
  
  /** Primary action (always visible as main FAB) */
  primaryAction?: QuickAction
  
  /** Whether menu is initially expanded */
  defaultExpanded?: boolean
  
  /** Position from bottom */
  bottom?: number
  
  /** Position from right */
  right?: number
  
  /** FAB size */
  size?: 'sm' | 'md' | 'lg'
  
  /** FAB color */
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray'
  
  /** Whether to show labels */
  showLabels?: boolean
  
  /** Whether to show keyboard shortcuts */
  showShortcuts?: boolean
  
  /** Custom trigger content */
  triggerContent?: React.ReactNode
  
  /** Custom trigger icon */
  triggerIcon?: React.ReactNode
  
  /** Trigger label */
  triggerLabel?: string
  
  /** Animation direction */
  direction?: 'up' | 'left' | 'up-left'
  
  /** Whether to close menu after action */
  closeOnAction?: boolean
  
  /** Close menu handler */
  onToggle?: (expanded: boolean) => void
  
  /** Hide on scroll */
  hideOnScroll?: boolean
  
  /** Hide on mobile */
  hideOnMobile?: boolean
  
  /** Custom className */
  className?: string
  
  /** Custom ID */
  id?: string
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  primaryAction,
  defaultExpanded = false,
  bottom = 24,
  right = 24,
  size = 'lg',
  color = 'blue',
  showLabels = true,
  showShortcuts = true,
  triggerContent,
  triggerIcon,
  triggerLabel = 'Acciones rápidas',
  direction = 'up',
  closeOnAction = true,
  onToggle,
  hideOnScroll = true,
  hideOnMobile = false,
  className = '',
  id = 'quick-actions'
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle menu toggle
  const handleToggle = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    onToggle?.(newExpanded)
  }

  // Handle action click
  const handleActionClick = (action: QuickAction) => {
    if (action.disabled || action.loading) return
    
    action.onClick()
    
    if (closeOnAction) {
      setExpanded(false)
      onToggle?.(false)
    }
  }

  // Handle primary action click
  const handlePrimaryActionClick = () => {
    if (primaryAction) {
      handleActionClick(primaryAction)
    } else {
      handleToggle()
    }
  }

  // Handle scroll to hide/show FAB
  useEffect(() => {
    if (!hideOnScroll) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY > lastScrollY && currentScrollY > 100

      setVisible(!isScrollingDown)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hideOnScroll, lastScrollY])

  // Handle outside clicks
  useEffect(() => {
    if (!expanded) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setExpanded(false)
        onToggle?.(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expanded, onToggle])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape
      if (event.key === 'Escape' && expanded) {
        setExpanded(false)
        onToggle?.(false)
        return
      }

      // Handle action shortcuts
      actions.forEach(action => {
        if (action.shortcut && matchesShortcut(event, action.shortcut)) {
          event.preventDefault()
          handleActionClick(action)
        }
      })

      // Handle primary action shortcut
      if (primaryAction?.shortcut && matchesShortcut(event, primaryAction.shortcut)) {
        event.preventDefault()
        handleActionClick(primaryAction)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions, primaryAction, expanded, onToggle])

  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Color classes
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    green: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
    red: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl',
    gray: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl'
  }

  // Direction classes for menu items
  const directionClasses = {
    up: 'flex-col-reverse',
    left: 'flex-row-reverse',
    'up-left': 'flex-col-reverse'
  }

  const itemPositionClasses = {
    up: 'mb-3',
    left: 'mr-3',
    'up-left': 'mb-3'
  }

  if (hideOnMobile && typeof window !== 'undefined' && window.innerWidth < 640) {
    return null
  }

  return (
    <div
      id={id}
      ref={menuRef}
      className={`
        fixed transition-all duration-${animationDurations.normal} ease-in-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
        ${className}
      `}
      style={{ 
        bottom: `${bottom}px`, 
        right: `${right}px`,
        zIndex: zIndexLayers.quickActions
      }}
    >
      {/* Menu Items */}
      {expanded && actions.length > 0 && (
        <div className={`flex ${directionClasses[direction]} items-end`}>
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={`
                ${itemPositionClasses[direction]}
                transform transition-all duration-${animationDurations.normal} ease-out
                ${expanded 
                  ? 'scale-100 opacity-100 translate-y-0' 
                  : 'scale-0 opacity-0 translate-y-4'
                }
              `}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              <QuickActionButton
                action={action}
                size={size}
                showLabel={showLabels}
                showShortcut={showShortcuts}
                onClick={() => handleActionClick(action)}
                direction={direction}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={handlePrimaryActionClick}
        disabled={primaryAction?.disabled || primaryAction?.loading}
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          rounded-full flex items-center justify-center
          transition-all duration-${animationDurations.normal} ease-in-out
          focus:outline-none focus:ring-4 focus:ring-blue-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transform hover:scale-105 active:scale-95
          ${expanded ? 'rotate-45' : 'rotate-0'}
        `}
        aria-label={primaryAction?.label || triggerLabel}
        title={primaryAction?.label || triggerLabel}
      >
        {primaryAction?.loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : triggerContent ? (
          triggerContent
        ) : triggerIcon ? (
          <span className={iconSizeClasses[size]}>{triggerIcon}</span>
        ) : primaryAction?.icon ? (
          <span className={iconSizeClasses[size]}>{primaryAction.icon}</span>
        ) : (
          <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )}
      </button>

      {/* Keyboard shortcuts help */}
      {showShortcuts && expanded && (actions.length > 0 || primaryAction?.shortcut) && (
        <div className="absolute top-full mt-2 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Esc para cerrar
        </div>
      )}
    </div>
  )
}

// Quick Action Button Component
interface QuickActionButtonProps {
  action: QuickAction
  size: 'sm' | 'md' | 'lg'
  showLabel: boolean
  showShortcut: boolean
  onClick: () => void
  direction: 'up' | 'left' | 'up-left'
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  action,
  size,
  showLabel,
  showShortcut,
  onClick,
  direction
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const labelPositionClasses = {
    up: 'right-0 mb-2 bottom-full',
    left: 'top-0 mr-2 right-full',
    'up-left': 'right-full mr-2 bottom-0'
  }

  return (
    <div className="relative">
      {/* Label and Shortcut */}
      {showLabel && (
        <div className={`
          absolute ${labelPositionClasses[direction]}
          bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap
          transform transition-all duration-200 ease-out
          flex items-center gap-2
        `}>
          <span>{action.label}</span>
          {showShortcut && action.shortcut && (
            <kbd className="bg-white/20 px-1 rounded text-xs">
              {formatShortcut(action.shortcut)}
            </kbd>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onClick}
        disabled={action.disabled || action.loading}
        className={`
          ${sizeClasses[size]}
          bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
          rounded-full flex items-center justify-center
          shadow-lg hover:shadow-xl transition-all duration-200 ease-out
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          border border-gray-200 dark:border-gray-600
        `}
        aria-label={action.label}
        title={action.label}
      >
        {action.loading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
        ) : (
          <span className={iconSizeClasses[size]}>{action.icon}</span>
        )}
      </button>
    </div>
  )
}

// Utility functions
function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  
  const modifiers = parts.slice(0, -1)
  const needsCtrl = modifiers.includes('ctrl') || modifiers.includes('cmd')
  const needsAlt = modifiers.includes('alt')
  const needsShift = modifiers.includes('shift')
  
  return (
    event.key.toLowerCase() === key &&
    event.ctrlKey === needsCtrl &&
    event.metaKey === needsCtrl &&
    event.altKey === needsAlt &&
    event.shiftKey === needsShift
  )
}

function formatShortcut(shortcut: string): string {
  return shortcut
    .replace(/cmd/gi, '⌘')
    .replace(/ctrl/gi, '⌘')
    .replace(/alt/gi, '⌥')
    .replace(/shift/gi, '⇧')
    .replace(/\+/g, '')
    .toUpperCase()
}

export default QuickActions