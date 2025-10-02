/**
 * DashboardLayout Stories for Nivexa CRM Design System
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { defaultNavigationSections, defaultUserMenuItems } from './index'
import type { Notification } from './types'

const meta: Meta<typeof DashboardLayout> = {
  title: 'Design System/Layout/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Layout principal de la aplicación con navegación lateral, header y soporte para contenido responsivo. Incluye gestión de navegación, menú de usuario, notificaciones y breadcrumbs en español.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DashboardLayout>

// Sample data
const sampleUser = {
  name: 'Ana García',
  email: 'ana.garcia@nivexa.com',
  role: 'Administradora',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nueva factura generada',
    message: 'La factura #FAC-2024-001 ha sido generada exitosamente',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actionUrl: '/invoices/FAC-2024-001',
    actionLabel: 'Ver factura'
  },
  {
    id: '2',
    title: 'Pago pendiente',
    message: 'El cliente TechCorp tiene un pago vencido por $2,500',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    actionUrl: '/payments/pending',
    actionLabel: 'Gestionar pago'
  },
  {
    id: '3',
    title: 'Proyecto completado',
    message: 'El proyecto "Sistema de gestión" ha sido marcado como completado',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true
  }
]

const sampleBreadcrumbs = [
  { id: '1', label: 'Dashboard', href: '/dashboard' },
  { id: '2', label: 'Clientes', href: '/clients' },
  { id: '3', label: 'TechCorp', isActive: true }
]

// Default story
export const Default: Story = {
  args: {
    navigation: defaultNavigationSections,
    user: sampleUser,
    userMenuItems: defaultUserMenuItems,
    notifications: sampleNotifications,
    breadcrumbs: sampleBreadcrumbs,
    children: (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Dashboard Principal
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Clientes Activos</h3>
            <p className="text-3xl font-bold text-blue-600">156</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Proyectos en Curso</h3>
            <p className="text-3xl font-bold text-green-600">23</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Ingresos del Mes</h3>
            <p className="text-3xl font-bold text-purple-600">$45,230</p>
          </div>
        </div>
      </div>
    )
  }
}

// Collapsed sidebar story
export const CollapsedSidebar: Story = {
  args: {
    ...Default.args,
    defaultSidebarCollapsed: true
  }
}

// With active navigation
export const WithActiveNavigation: Story = {
  args: {
    ...Default.args,
    navigation: defaultNavigationSections.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        isActive: item.id === 'clients'
      }))
    }))
  }
}

// Loading state
export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true
  }
}

// Error state
export const WithError: Story = {
  args: {
    ...Default.args,
    error: 'No se pudo cargar el contenido. Por favor, inténtalo de nuevo.'
  }
}

// No notifications
export const NoNotifications: Story = {
  args: {
    ...Default.args,
    notifications: [],
    showNotifications: true
  }
}

// No breadcrumbs
export const NoBreadcrumbs: Story = {
  args: {
    ...Default.args,
    breadcrumbs: []
  }
}

// With header actions
export const WithHeaderActions: Story = {
  args: {
    ...Default.args,
    headerActions: (
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
          Exportar
        </button>
        <button className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
          Nuevo Cliente
        </button>
      </div>
    )
  }
}

// Controlled sidebar
export const ControlledSidebar: Story = {
  render: (args) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    
    return (
      <DashboardLayout
        {...args}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={setSidebarCollapsed}
      />
    )
  },
  args: {
    ...Default.args
  }
}

// Mobile responsive demo
export const MobileResponsive: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}

// Dark mode
export const DarkMode: Story = {
  args: {
    ...Default.args
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}

// Custom logo
export const WithCustomLogo: Story = {
  args: {
    ...Default.args,
    logo: {
      src: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=N',
      alt: 'Nivexa CRM',
      href: '/dashboard'
    }
  }
}

// Minimal navigation
export const MinimalNavigation: Story = {
  args: {
    ...Default.args,
    navigation: [
      {
        id: 'main',
        title: 'Principal',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/dashboard',
            isActive: true,
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 002-2h10" />
              </svg>
            )
          },
          {
            id: 'clients',
            label: 'Clientes',
            href: '/clients',
            badge: '156',
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            )
          }
        ]
      }
    ]
  }
}