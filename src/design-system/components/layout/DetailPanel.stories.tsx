/**
 * DetailPanel Stories for Nivexa CRM Design System
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DetailPanel } from './DetailPanel'
import type { PageAction } from './types'

const meta: Meta<typeof DetailPanel> = {
  title: 'Design System/Layout/DetailPanel',
  component: DetailPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Panel deslizante de detalles que aparece desde el lado derecho. Responsive con pantalla completa en móviles. Perfecto para mostrar información detallada, formularios o contenido secundario.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DetailPanel>

// Sample actions
const sampleActions: PageAction[] = [
  {
    id: 'save',
    label: 'Guardar',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    onClick: () => console.log('Guardar'),
    variant: 'primary'
  }
]

const sampleSecondaryActions: PageAction[] = [
  {
    id: 'cancel',
    label: 'Cancelar',
    onClick: () => console.log('Cancelar'),
    variant: 'ghost'
  }
]

const sampleIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

// Default story - needs interactive button
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Abrir Panel de Detalles
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    title: 'Detalles del Cliente',
    subtitle: 'Información completa y configuración',
    icon: sampleIcon,
    actions: sampleActions,
    secondaryActions: sampleSecondaryActions,
    children: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Información Personal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                defaultValue="María González"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue="maria@techcorp.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Configuración
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Recibir notificaciones por email
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Permitir acceso a datos analíticos
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Sincronizar con calendario
              </span>
            </label>
          </div>
        </div>
      </div>
    )
  }
}

// Different sizes
export const SmallSize: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel Pequeño
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    size: 'sm',
    title: 'Panel Pequeño',
    children: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este es un panel de tamaño pequeño, ideal para acciones rápidas o información breve.
        </p>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Estado:</span> Activo
          </div>
          <div className="text-sm">
            <span className="font-medium">Última conexión:</span> Hace 2 minutos
          </div>
        </div>
      </div>
    )
  }
}

export const ExtraLargeSize: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel Extra Grande
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    size: 'xl',
    title: 'Panel Extra Grande',
    children: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Información Personal</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" defaultValue="María González" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" defaultValue="maria@techcorp.com" className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Configuración</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="ml-2 text-sm">Notificaciones</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded" />
                <span className="ml-2 text-sm">Datos analíticos</span>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Historial de Actividad</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">Acción {i}</div>
                  <div className="text-sm text-gray-500">Descripción de la actividad</div>
                </div>
                <div className="text-sm text-gray-500">
                  Hace {i} hora{i > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

// Full width
export const FullWidth: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel Ancho Completo
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    size: 'full',
    title: 'Editor Completo',
    subtitle: 'Modo de edición a pantalla completa'
  }
}

// Loading state
export const Loading: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel Cargando
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    title: 'Cargando Datos',
    subtitle: 'Obteniendo información del servidor',
    loading: true,
    loadingMessage: 'Cargando detalles del cliente...'
  }
}

// Error state
export const WithError: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel con Error
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    title: 'Error al Cargar',
    subtitle: 'No se pudieron obtener los datos',
    error: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.',
    onRetry: () => console.log('Reintentar')
  }
}

// With footer
export const WithFooter: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel con Footer
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    title: 'Editar Cliente',
    footer: (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          * Los campos marcados son obligatorios
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            Cancelar
          </button>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
    )
  }
}

// Sticky footer
export const StickyFooter: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel con Footer Fijo
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    title: 'Formulario Largo',
    stickyFooter: true,
    children: (
      <div className="space-y-6">
        {[...Array(20)].map((_, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campo {i + 1}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        ))}
      </div>
    ),
    footer: (
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          Cancelar
        </button>
        <button className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
          Guardar
        </button>
      </div>
    )
  }
}

// Left direction
export const LeftDirection: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel desde la Izquierda
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    direction: 'left',
    title: 'Navegación'
  }
}

// Gray background
export const GrayBackground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel con Fondo Gris
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    background: 'gray'
  }
}

// Without close button
export const NonClosable: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel No Cerrable
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    closable: false,
    closeOnBackdropClick: false,
    closeOnEscape: false,
    title: 'Proceso Obligatorio',
    subtitle: 'Este proceso debe completarse',
    actions: [
      {
        id: 'complete',
        label: 'Completar',
        onClick: () => console.log('Completar'),
        variant: 'primary'
      }
    ]
  }
}

// With header content
export const WithHeaderContent: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel con Contenido de Header
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    title: 'Configuración Avanzada',
    headerContent: (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Los cambios en esta configuración afectarán a todo el sistema.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

// Different padding
export const CompactPadding: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel Compacto
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    ...Default.args,
    padding: 'sm',
    title: 'Panel Compacto'
  }
}

// Action variants
export const ActionVariants: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    
    return (
      <div className="p-6">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Panel con Variantes de Acciones
        </button>
        
        <DetailPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
  args: {
    title: 'Gestión de Usuario',
    subtitle: 'Acciones disponibles para este usuario',
    actions: [
      {
        id: 'save',
        label: 'Guardar',
        onClick: () => console.log('Guardar'),
        variant: 'primary'
      },
      {
        id: 'delete',
        label: 'Eliminar',
        onClick: () => console.log('Eliminar'),
        variant: 'danger'
      }
    ],
    secondaryActions: [
      {
        id: 'export',
        label: 'Exportar',
        onClick: () => console.log('Exportar'),
        variant: 'outline'
      },
      {
        id: 'duplicate',
        label: 'Duplicar',
        onClick: () => console.log('Duplicar'),
        variant: 'ghost'
      }
    ],
    children: (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Observa las diferentes variantes de botones en el header.
        </p>
      </div>
    )
  }
}