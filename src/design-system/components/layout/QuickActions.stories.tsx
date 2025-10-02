/**
 * QuickActions Stories for Nivexa CRM Design System
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { QuickActions } from './QuickActions'
import { defaultQuickActions } from './index'
import type { QuickAction } from './types'

const meta: Meta<typeof QuickActions> = {
  title: 'Design System/Layout/QuickActions',
  component: QuickActions,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Barra de herramientas flotante posicionada en la parte inferior derecha con acciones contextuales. Incluye estilo FAB con menú expandible, atajos de teclado y comportamiento responsivo.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative', padding: '20px' }}>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Página de Ejemplo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Esta es una página de ejemplo para demostrar el componente QuickActions.
            El botón flotante aparece en la esquina inferior derecha.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2">Tarjeta {i}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Contenido de ejemplo para mostrar la página.
                </p>
              </div>
            ))}
          </div>
        </div>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof QuickActions>

// Sample actions
const sampleActions: QuickAction[] = [
  {
    id: 'new-client',
    label: 'Nuevo Cliente',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    onClick: () => {
      console.log('Nuevo Cliente')
      alert('Nuevo Cliente')
    },
    shortcut: 'cmd+n'
  },
  {
    id: 'new-project',
    label: 'Nuevo Proyecto',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    onClick: () => {
      console.log('Nuevo Proyecto')
      alert('Nuevo Proyecto')
    },
    shortcut: 'cmd+p'
  },
  {
    id: 'new-invoice',
    label: 'Nueva Factura',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    onClick: () => {
      console.log('Nueva Factura')
      alert('Nueva Factura')
    },
    shortcut: 'cmd+i'
  },
  {
    id: 'scan-document',
    label: 'Escanear Documento',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    onClick: () => {
      console.log('Escanear Documento')
      alert('Escanear Documento')
    },
    shortcut: 'cmd+s'
  }
]

// Default story
export const Default: Story = {
  args: {
    actions: sampleActions,
    triggerLabel: 'Acciones rápidas'
  }
}

// With primary action
export const WithPrimaryAction: Story = {
  args: {
    actions: sampleActions.slice(1), // Remove first action
    primaryAction: sampleActions[0], // Use first action as primary
    triggerLabel: 'Crear nuevo'
  }
}

// Different sizes
export const SmallSize: Story = {
  args: {
    actions: sampleActions,
    size: 'sm'
  }
}

export const LargeSize: Story = {
  args: {
    actions: sampleActions,
    size: 'lg'
  }
}

// Different colors
export const GreenColor: Story = {
  args: {
    actions: sampleActions,
    color: 'green',
    triggerLabel: 'Crear'
  }
}

export const RedColor: Story = {
  args: {
    actions: sampleActions,
    color: 'red',
    triggerLabel: 'Acciones'
  }
}

export const PurpleColor: Story = {
  args: {
    actions: sampleActions,
    color: 'purple',
    triggerLabel: 'Herramientas'
  }
}

// Different directions
export const LeftDirection: Story = {
  args: {
    actions: sampleActions,
    direction: 'left'
  }
}

export const UpLeftDirection: Story = {
  args: {
    actions: sampleActions,
    direction: 'up-left'
  }
}

// Without labels
export const WithoutLabels: Story = {
  args: {
    actions: sampleActions,
    showLabels: false
  }
}

// Without shortcuts
export const WithoutShortcuts: Story = {
  args: {
    actions: sampleActions,
    showShortcuts: false
  }
}

// Different positions
export const CenterPosition: Story = {
  args: {
    actions: sampleActions,
    right: window.innerWidth / 2 - 35, // Center horizontally
    bottom: 100
  }
}

export const TopRight: Story = {
  args: {
    actions: sampleActions,
    right: 24,
    bottom: window.innerHeight - 100
  }
}

// Custom trigger content
export const CustomTrigger: Story = {
  args: {
    actions: sampleActions,
    triggerContent: (
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs font-medium">+</span>
      </div>
    )
  }
}

// Custom trigger icon
export const CustomTriggerIcon: Story = {
  args: {
    actions: sampleActions,
    triggerIcon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    triggerLabel: 'Acciones rápidas'
  }
}

// Default expanded
export const DefaultExpanded: Story = {
  args: {
    actions: sampleActions,
    defaultExpanded: true
  }
}

// Don't close on action
export const DontCloseOnAction: Story = {
  args: {
    actions: sampleActions,
    closeOnAction: false
  }
}

// Controlled state
export const ControlledState: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState(false)
    
    return (
      <div>
        <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Estado: {expanded ? 'Expandido' : 'Contraído'}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {expanded ? 'Contraer' : 'Expandir'}
            </button>
          </div>
        </div>
        
        <QuickActions
          {...args}
          defaultExpanded={expanded}
          onToggle={setExpanded}
        />
      </div>
    )
  },
  args: {
    actions: sampleActions
  }
}

// With disabled action
export const WithDisabledAction: Story = {
  args: {
    actions: [
      ...sampleActions.slice(0, 2),
      {
        id: 'disabled-action',
        label: 'Acción Deshabilitada',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        ),
        onClick: () => console.log('Esta acción está deshabilitada'),
        disabled: true
      },
      ...sampleActions.slice(2)
    ]
  }
}

// With loading action
export const WithLoadingAction: Story = {
  args: {
    actions: [
      ...sampleActions.slice(0, 1),
      {
        id: 'loading-action',
        label: 'Procesando...',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        onClick: () => console.log('Procesando'),
        loading: true
      },
      ...sampleActions.slice(1)
    ]
  }
}

// Many actions
export const ManyActions: Story = {
  args: {
    actions: [
      ...sampleActions,
      {
        id: 'action-5',
        label: 'Generar Reporte',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        onClick: () => alert('Generar Reporte'),
        shortcut: 'cmd+r'
      },
      {
        id: 'action-6',
        label: 'Exportar Datos',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m3-6V4a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
          </svg>
        ),
        onClick: () => alert('Exportar Datos'),
        shortcut: 'cmd+e'
      },
      {
        id: 'action-7',
        label: 'Configuración',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        onClick: () => alert('Configuración'),
        shortcut: 'cmd+,'
      }
    ]
  }
}

// Hide on scroll example
export const HideOnScroll: Story = {
  args: {
    actions: sampleActions,
    hideOnScroll: true
  },
  decorators: [
    (Story) => (
      <div style={{ height: '200vh', position: 'relative', padding: '20px' }}>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Página con Scroll</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Desplázate hacia abajo para ver cómo el botón flotante se oculta.
          </p>
          {[...Array(50)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-4">
              <h3 className="font-medium mb-2">Sección {i + 1}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Contenido de ejemplo para crear una página con scroll.
              </p>
            </div>
          ))}
        </div>
        <Story />
      </div>
    )
  ]
}

// Default actions from index
export const DefaultActions: Story = {
  args: {
    actions: defaultQuickActions
  }
}

// Contextual actions (different per page)
export const ContextualActions: Story = {
  render: (args) => {
    const [context, setContext] = useState<'clients' | 'projects' | 'invoices'>('clients')
    
    const contextActions = {
      clients: [
        {
          id: 'new-client',
          label: 'Nuevo Cliente',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ),
          onClick: () => alert('Nuevo Cliente'),
          shortcut: 'cmd+n'
        },
        {
          id: 'import-clients',
          label: 'Importar Clientes',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          ),
          onClick: () => alert('Importar Clientes')
        }
      ],
      projects: [
        {
          id: 'new-project',
          label: 'Nuevo Proyecto',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          onClick: () => alert('Nuevo Proyecto'),
          shortcut: 'cmd+p'
        },
        {
          id: 'clone-project',
          label: 'Clonar Proyecto',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          onClick: () => alert('Clonar Proyecto')
        }
      ],
      invoices: [
        {
          id: 'new-invoice',
          label: 'Nueva Factura',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          onClick: () => alert('Nueva Factura'),
          shortcut: 'cmd+i'
        },
        {
          id: 'bulk-send',
          label: 'Envío Masivo',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          onClick: () => alert('Envío Masivo')
        }
      ]
    }
    
    return (
      <div>
        <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium mr-2">Contexto:</span>
            {(['clients', 'projects', 'invoices'] as const).map((ctx) => (
              <button
                key={ctx}
                onClick={() => setContext(ctx)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  context === ctx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {ctx === 'clients' ? 'Clientes' : ctx === 'projects' ? 'Proyectos' : 'Facturas'}
              </button>
            ))}
          </div>
        </div>
        
        <QuickActions
          {...args}
          actions={contextActions[context]}
        />
      </div>
    )
  },
  args: {}
}