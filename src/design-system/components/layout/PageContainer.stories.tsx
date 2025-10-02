/**
 * PageContainer Stories for Nivexa CRM Design System
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PageContainer } from './PageContainer'
import type { PageAction, TabItem } from './types'

const meta: Meta<typeof PageContainer> = {
  title: 'Design System/Layout/PageContainer',
  component: PageContainer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Contenedor de página consistente con header, acciones, soporte para tabs y estados de carga. Proporciona espaciado y diseño estandarizado para todas las páginas del CRM.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageContainer>

// Sample actions
const sampleActions: PageAction[] = [
  {
    id: 'export',
    label: 'Exportar',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m3-6V4a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
      </svg>
    ),
    onClick: () => console.log('Exportar'),
    variant: 'outline'
  },
  {
    id: 'create',
    label: 'Crear Cliente',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    onClick: () => console.log('Crear Cliente'),
    variant: 'primary'
  }
]

const sampleSecondaryActions: PageAction[] = [
  {
    id: 'filter',
    label: 'Filtrar',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
      </svg>
    ),
    onClick: () => console.log('Filtrar'),
    variant: 'ghost'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    onClick: () => console.log('Configuración'),
    variant: 'ghost'
  }
]

const sampleTabs: TabItem[] = [
  {
    id: 'overview',
    label: 'Resumen',
    content: (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la empresa
              </label>
              <div className="text-sm text-gray-900 dark:text-gray-100">TechCorp Solutions</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Activo
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'projects',
    label: 'Proyectos',
    badge: '3',
    content: (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="font-medium">Sistema de Gestión Interna</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">En progreso • Vence: 15 Dic 2024</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="font-medium">Migración a la Nube</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Planificado • Inicio: 1 Ene 2025</p>
        </div>
      </div>
    )
  },
  {
    id: 'invoices',
    label: 'Facturas',
    content: (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Sin facturas</h3>
        <p className="text-gray-600 dark:text-gray-400">No hay facturas generadas para este cliente.</p>
      </div>
    )
  },
  {
    id: 'disabled',
    label: 'Deshabilitado',
    disabled: true
  }
]

const sampleIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

// Default story
export const Default: Story = {
  args: {
    title: 'Lista de Clientes',
    subtitle: 'Gestiona y visualiza todos los clientes de tu empresa',
    icon: sampleIcon,
    actions: sampleActions,
    secondaryActions: sampleSecondaryActions,
    children: (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Contenido Principal
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>
                Aquí iría el contenido principal de la página. Podría ser una tabla, 
                formularios, gráficos o cualquier otro tipo de contenido.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// With tabs
export const WithTabs: Story = {
  args: {
    title: 'TechCorp Solutions',
    subtitle: 'Cliente desde Enero 2023',
    icon: sampleIcon,
    actions: [
      {
        id: 'edit',
        label: 'Editar',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => console.log('Editar'),
        variant: 'primary'
      }
    ],
    tabs: sampleTabs,
    backButton: {
      label: 'Volver a clientes',
      href: '/clients'
    }
  }
}

// Loading state
export const Loading: Story = {
  args: {
    title: 'Cargando Datos',
    subtitle: 'Por favor espera mientras cargamos la información',
    loadingState: 'loading',
    loadingMessage: 'Obteniendo datos del servidor...',
    actions: sampleActions
  }
}

// Error state
export const WithError: Story = {
  args: {
    title: 'Error al Cargar',
    subtitle: 'Ha ocurrido un problema al cargar los datos',
    error: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.',
    onRetry: () => console.log('Reintentar'),
    actions: sampleActions
  }
}

// With back button
export const WithBackButton: Story = {
  args: {
    ...Default.args,
    backButton: {
      label: 'Volver al dashboard',
      onClick: () => console.log('Volver')
    }
  }
}

// With help text
export const WithHelpText: Story = {
  args: {
    ...Default.args,
    helpText: 'Los clientes marcados en rojo tienen pagos pendientes. Usa los filtros para encontrar clientes específicos más rápidamente.'
  }
}

// Different sizes
export const SmallMaxWidth: Story = {
  args: {
    ...Default.args,
    maxWidth: 'md',
    title: 'Contenedor Pequeño'
  }
}

export const FullWidth: Story = {
  args: {
    ...Default.args,
    maxWidth: 'full',
    title: 'Contenedor Ancho Completo'
  }
}

// Different padding
export const CompactPadding: Story = {
  args: {
    ...Default.args,
    padding: 'sm',
    title: 'Espaciado Compacto'
  }
}

export const LargePadding: Story = {
  args: {
    ...Default.args,
    padding: 'xl',
    title: 'Espaciado Grande'
  }
}

// Header variations
export const TransparentHeader: Story = {
  args: {
    ...Default.args,
    headerBackground: 'transparent',
    showHeaderDivider: false
  }
}

export const GrayHeader: Story = {
  args: {
    ...Default.args,
    headerBackground: 'gray'
  }
}

export const StickyHeader: Story = {
  args: {
    ...Default.args,
    stickyHeader: true,
    children: (
      <div className="space-y-6">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Sección {i + 1}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Contenido de prueba para mostrar el scroll y el header sticky.
            </p>
          </div>
        ))}
      </div>
    )
  }
}

// With custom header content
export const WithHeaderContent: Story = {
  args: {
    ...Default.args,
    headerContent: (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Esta página muestra información en tiempo real. Los datos se actualizan automáticamente cada 30 segundos.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

// Controlled tabs
export const ControlledTabs: Story = {
  render: (args) => {
    const [activeTab, setActiveTab] = useState('overview')
    
    return (
      <PageContainer
        {...args}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    )
  },
  args: {
    title: 'Tabs Controlados',
    subtitle: 'Estado de tabs manejado externamente',
    tabs: sampleTabs
  }
}

// Action variants
export const ActionVariants: Story = {
  args: {
    title: 'Variantes de Acciones',
    subtitle: 'Diferentes estilos de botones de acción',
    actions: [
      {
        id: 'primary',
        label: 'Primario',
        onClick: () => console.log('Primario'),
        variant: 'primary'
      },
      {
        id: 'secondary',
        label: 'Secundario',
        onClick: () => console.log('Secundario'),
        variant: 'secondary'
      },
      {
        id: 'outline',
        label: 'Outline',
        onClick: () => console.log('Outline'),
        variant: 'outline'
      },
      {
        id: 'ghost',
        label: 'Ghost',
        onClick: () => console.log('Ghost'),
        variant: 'ghost'
      },
      {
        id: 'danger',
        label: 'Peligro',
        onClick: () => console.log('Peligro'),
        variant: 'danger'
      }
    ],
    children: (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Observa los diferentes estilos de botones en el header.
        </p>
      </div>
    )
  }
}

// Loading actions
export const LoadingActions: Story = {
  args: {
    title: 'Acciones con Carga',
    subtitle: 'Botones en estado de carga',
    actions: [
      {
        id: 'saving',
        label: 'Guardando...',
        onClick: () => console.log('Guardar'),
        loading: true,
        variant: 'primary'
      },
      {
        id: 'disabled',
        label: 'Deshabilitado',
        onClick: () => console.log('Deshabilitado'),
        disabled: true,
        variant: 'secondary'
      }
    ],
    children: (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Los botones pueden mostrar estados de carga y estar deshabilitados.
        </p>
      </div>
    )
  }
}