/**
 * DashboardLayout Component for Nivexa CRM
 * 
 * Main application layout with collapsible sidebar, header, and responsive mobile drawer.
 * Includes navigation management, user menu, notifications, and breadcrumb support.
 */

import React, { useState, useEffect } from 'react'
import { 
  BaseLayoutProps, 
  NavigationSection, 
  UserMenuItem, 
  Notification, 
  BreadcrumbItem,
  animationDurations,
  zIndexLayers
} from './types'

export interface DashboardLayoutProps extends BaseLayoutProps {
  /** Navigation sections for the sidebar */
  navigation: NavigationSection[]
  
  /** User information for the header */
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  
  /** User menu items */
  userMenuItems?: UserMenuItem[]
  
  /** Notifications array */
  notifications?: Notification[]
  
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[]
  
  /** Whether sidebar is initially collapsed */
  defaultSidebarCollapsed?: boolean
  
  /** Sidebar collapse state control */
  sidebarCollapsed?: boolean
  onSidebarToggle?: (collapsed: boolean) => void
  
  /** Logo configuration */
  logo?: {
    src: string
    alt: string
    href?: string
  }
  
  /** Header actions */
  headerActions?: React.ReactNode
  
  /** Whether to show notifications */
  showNotifications?: boolean
  
  /** Loading state */
  isLoading?: boolean
  
  /** Error state */
  error?: string
  
  /** Mobile drawer control */
  mobileDrawerOpen?: boolean
  onMobileDrawerToggle?: (open: boolean) => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navigation = [],
  user = {
    name: 'Usuario',
    email: 'usuario@ejemplo.com',
    avatar: '',
    role: ''
  },
  userMenuItems = [],
  notifications = [],
  breadcrumbs = [],
  defaultSidebarCollapsed = false,
  sidebarCollapsed: controlledSidebarCollapsed,
  onSidebarToggle,
  logo,
  headerActions,
  showNotifications = true,
  isLoading = false,
  error,
  mobileDrawerOpen: controlledMobileDrawerOpen,
  onMobileDrawerToggle,
  className = '',
  id
}) => {
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(defaultSidebarCollapsed)
  const [internalMobileDrawerOpen, setInternalMobileDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(navigation.filter(section => section.defaultExpanded).map(section => section.id))
  )

  // Controlled vs uncontrolled sidebar state
  const sidebarCollapsed = controlledSidebarCollapsed ?? internalSidebarCollapsed
  const mobileDrawerOpen = controlledMobileDrawerOpen ?? internalMobileDrawerOpen

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed
    if (onSidebarToggle) {
      onSidebarToggle(newCollapsed)
    } else {
      setInternalSidebarCollapsed(newCollapsed)
    }
  }

  const handleMobileDrawerToggle = () => {
    const newOpen = !mobileDrawerOpen
    if (onMobileDrawerToggle) {
      onMobileDrawerToggle(newOpen)
    } else {
      setInternalMobileDrawerOpen(newOpen)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Close mobile drawer on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element
      if (mobileDrawerOpen && !target.closest('[data-mobile-drawer]')) {
        handleMobileDrawerToggle()
      }
    }

    if (mobileDrawerOpen) {
      document.addEventListener('click', handleOutsideClick)
      return () => document.removeEventListener('click', handleOutsideClick)
    }
  }, [mobileDrawerOpen])

  // Responsive sidebar width
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64'
  const sidebarWidthMobile = 'w-64'

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <div id={id} className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity lg:hidden"
          style={{ zIndex: zIndexLayers.backdrop }}
          onClick={handleMobileDrawerToggle}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-${animationDurations.normal} ease-in-out
          hidden lg:block
          ${sidebarWidth}
        `}
        style={{ zIndex: zIndexLayers.drawer }}
      >
        <SidebarContent
          navigation={navigation}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          collapsed={sidebarCollapsed}
          logo={logo}
        />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-${animationDurations.normal} ease-in-out
          lg:hidden ${sidebarWidthMobile}
          ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ zIndex: zIndexLayers.drawer }}
        data-mobile-drawer
      >
        <SidebarContent
          navigation={navigation}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          collapsed={false}
          logo={logo}
          isMobile
        />
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-${animationDurations.normal} ease-in-out lg:${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4" style={{ zIndex: zIndexLayers.modal - 10 }}>
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={handleMobileDrawerToggle}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Abrir menú de navegación"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Desktop Sidebar Toggle */}
              <button
                onClick={handleSidebarToggle}
                className="hidden lg:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>

              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <nav className="hidden sm:flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={crumb.id} className="flex items-center">
                        {index > 0 && (
                          <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {crumb.href && !crumb.isActive ? (
                          <a
                            href={crumb.href}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            {crumb.label}
                          </a>
                        ) : (
                          <span className={`text-sm font-medium ${crumb.isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {crumb.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Header Actions */}
              {headerActions}

              {/* Notifications */}
              {showNotifications && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    aria-label="Notificaciones"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.414A2 2 0 015 17.586V7a6 6 0 0112 0v4.586A2 2 0 0115.586 13H11v6z" />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <NotificationsDropdown
                      notifications={notifications}
                      onClose={() => setNotificationsOpen(false)}
                    />
                  )}
                </div>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Menú de usuario"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    {user.role && <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>}
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <UserMenuDropdown
                    user={user}
                    menuItems={userMenuItems}
                    onClose={() => setUserMenuOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium mb-2">Error</div>
                <div className="text-gray-600 dark:text-gray-400">{error}</div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}

// Sidebar Content Component
interface SidebarContentProps {
  navigation: NavigationSection[]
  expandedSections: Set<string>
  onToggleSection: (sectionId: string) => void
  collapsed: boolean
  logo?: DashboardLayoutProps['logo']
  isMobile?: boolean
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  expandedSections,
  onToggleSection,
  collapsed,
  logo,
  isMobile = false
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        {logo ? (
          logo.href ? (
            <a href={logo.href} className="flex items-center">
              <img 
                src={logo.src} 
                alt={logo.alt} 
                className={`${collapsed && !isMobile ? 'w-8 h-8' : 'w-10 h-10'} transition-all`}
              />
              {(!collapsed || isMobile) && (
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  Nivexa
                </span>
              )}
            </a>
          ) : (
            <div className="flex items-center">
              <img 
                src={logo.src} 
                alt={logo.alt} 
                className={`${collapsed && !isMobile ? 'w-8 h-8' : 'w-10 h-10'} transition-all`}
              />
              {(!collapsed || isMobile) && (
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  Nivexa
                </span>
              )}
            </div>
          )
        ) : (
          <div className="flex items-center">
            <div className={`bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold ${collapsed && !isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'}`}>
              N
            </div>
            {(!collapsed || isMobile) && (
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Nivexa
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.id}>
            {/* Section Header */}
            {(!collapsed || isMobile) && (
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {section.title}
                </h3>
                {section.collapsible && (
                  <button
                    onClick={() => onToggleSection(section.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  >
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${expandedSections.has(section.id) ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Section Items */}
            {(!section.collapsible || expandedSections.has(section.id)) && (
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${item.isActive 
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                        }
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${collapsed && !isMobile ? 'justify-center' : ''}
                      `}
                      title={collapsed && !isMobile ? item.label : undefined}
                    >
                      {item.icon && (
                        <span className={`flex-shrink-0 ${(!collapsed || isMobile) ? 'mr-3' : ''} w-5 h-5`}>
                          {item.icon}
                        </span>
                      )}
                      {(!collapsed || isMobile) && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="ml-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

// Notifications Dropdown Component
interface NotificationsDropdownProps {
  notifications: Notification[]
  onClose: () => void
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onClose
}) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700" style={{ zIndex: zIndexLayers.tooltip }}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notificaciones</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No hay notificaciones
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {notification.timestamp.toLocaleDateString('es-ES')}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                )}
              </div>
              {notification.actionUrl && notification.actionLabel && (
                <a
                  href={notification.actionUrl}
                  className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {notification.actionLabel}
                </a>
              )}
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  )
}

// User Menu Dropdown Component
interface UserMenuDropdownProps {
  user: DashboardLayoutProps['user']
  menuItems: UserMenuItem[]
  onClose: () => void
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  user,
  menuItems,
  onClose
}) => {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700" style={{ zIndex: zIndexLayers.tooltip }}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
        {user.role && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.role}</div>}
      </div>
      
      <div className="py-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.divider ? (
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            ) : item.href ? (
              <a
                href={item.href}
                className={`block px-4 py-2 text-sm transition-colors ${
                  item.danger 
                    ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={onClose}
              >
                <div className="flex items-center">
                  {item.icon && <span className="mr-3 w-4 h-4">{item.icon}</span>}
                  {item.label}
                </div>
              </a>
            ) : (
              <button
                onClick={() => {
                  item.onClick?.()
                  onClose()
                }}
                className={`w-full text-left block px-4 py-2 text-sm transition-colors ${
                  item.danger 
                    ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  {item.icon && <span className="mr-3 w-4 h-4">{item.icon}</span>}
                  {item.label}
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardLayout